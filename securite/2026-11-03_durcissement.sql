-- Surbooking : durcissement du multijoueur (audit du 2026-11-03)
-- À exécuter une fois dans Supabase > SQL Editor (projet pygyfxczfiqzddlsbsha). Idempotent : on peut le relancer.
-- Aucun changement du jeu (index.html) n'est nécessaire : la version 17 n'appelle aucune des fonctions fermées ici.

begin;

-- 1. surb_docs_reload (rechargement du schéma PostgREST) était appelable par n'importe qui avec la clé publique :
--    il suffisait d'une boucle pour faire recharger l'API en permanence. Réservé à l'administration.
revoke execute on function public.surb_docs_reload() from public, anon, authenticated;

-- 2. surb_duel_act : ancien journal de duel écrit par les joueurs (versions < 4). Son action « over » laissait un
--    joueur se déclarer vainqueur. Depuis la version 4, seul l'arbitre (fonction surb-duel) écrit : on le ferme.
revoke execute on function public.surb_duel_act(text, text, integer, jsonb) from public, anon, authenticated;

-- 3. Un duel en direct (entre deux humains) perdu, ou pas encore fini, à cette table pour ce joueur ?
create or replace function public.surb_live_duel_blocked(p_table text, p_pid text)
 returns boolean
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.surb_duel d cross join generate_series(0, 1) k
    where d.table_id = p_table and d.players -> k ->> 'pid' = p_pid
      and (d.state = 'jeu' or (d.state = 'fini' and coalesce((d.result ->> 'w')::int, -1) <> k)))
$function$;
revoke execute on function public.surb_live_duel_blocked(text, text) from public, anon, authenticated;

-- 4. surb_live_result : un joueur ne peut plus déclarer « gagne » / « etage » quand le duel arbitré dit le contraire
--    (ou n'est pas fini). Le jeu traite le refus (invalid_argument) sans réessayer.
CREATE OR REPLACE FUNCTION public.surb_live_result(p_secret text, p_id text, p_res text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_pid text := public.surb_live_who(p_secret);
begin
  if p_res not in ('gagne', 'perdu', 'etage', 'elimine') then raise exception 'résultat invalide' using errcode = '22023'; end if;
  -- (durcissement) une victoire déclarée doit s'accorder avec le duel en direct arbitré par le serveur, s'il y en a un
  if p_res in ('gagne', 'etage') and public.surb_live_duel_blocked(p_id, v_pid) then
    raise exception 'résultat contredit par le duel' using errcode = '22023';
  end if;
  update public.surb_live set results = results || jsonb_build_object(v_pid, p_res), updated_at = now()
    where id = p_id and coalesce(seats, '[]'::jsonb) @> jsonb_build_array(jsonb_build_object('pid', v_pid));
  return public.surb_live_view(p_id, v_pid, 999);
end $function$;

-- 5. surb_live_join (arbre de 32) : pas de place à l'étage suivant pour un joueur éliminé ou battu en duel.
CREATE OR REPLACE FUNCTION public.surb_live_join(p_secret text, p_floor integer, p_code text, p_me jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_pid text := public.surb_live_who(p_secret); v_id text; v_code text := upper(coalesce(p_code, '')); r record; s int; v_mine text;
  nowe numeric := extract(epoch from now()); v_ver int; v_size int := case when p_floor = 5 then 2 else 4 end; -- étage 5 : la finale, à deux
  v_slot int; v_seat int; v_pslot int; v_pseat int; v_arbre boolean;
begin
  if p_floor is null or p_floor < 1 or p_floor > 9 then raise exception 'étage invalide' using errcode = '22023'; end if;
  if v_code !~ '^[A-Z0-9]{0,8}$' then raise exception 'code invalide' using errcode = '22023'; end if;
  if p_me is null or jsonb_typeof(p_me) <> 'object' or octet_length(p_me::text) > 8192
     or coalesce(jsonb_typeof(p_me -> 'name'), '') <> 'string' or char_length(p_me ->> 'name') not between 1 and 24
     or (p_me ->> 'name') ~ '[<>&"]' then -- 0.82 : un nom reste du texte (même règle que cleanName côté jeu)
    raise exception 'joueur invalide' using errcode = '22023';
  end if;
  v_ver := case when coalesce(p_me ->> 'ver', '') ~ '^[0-9]{1,6}$' then (p_me ->> 'ver')::int else 0 end;
  delete from public.surb_live where updated_at < now() - interval '3 hours';
  delete from public.surb_duel where updated_at < now() - interval '3 hours';
  -- seul à sa table de l'étage 1 (0.87.1) : on y reste, sauf si un autre joueur attend à une autre table
  if v_code = '' and p_floor = 1 then
    select id into v_mine from public.surb_live where state = 'attente' and floor = 1 and code = '' and ver = v_ver and size = v_size
      and jsonb_array_length(members) = 1 and members -> 0 ->> 'pid' = v_pid limit 1;
    if v_mine is not null and not exists (select 1 from public.surb_live q where q.id <> v_mine and q.state = 'attente' and q.floor = 1 and q.code = '' and q.ver = v_ver
        and q.size = v_size and jsonb_array_length(q.members) between 1 and v_size - 1 and public.surb_live_joinable(q.floor, q.created_at, q.members)) then
      update public.surb_live set members = jsonb_set(members, '{0,seen}', to_jsonb(nowe)) where id = v_mine;
      return public.surb_live_view(v_mine, v_pid, -1);
    end if;
  end if;
  -- on quitte les autres tables : la file qu'on attendait, ou un draft abandonné (le bot reprend la place)
  for r in select id, state, seats from public.surb_live where state in ('attente', 'draft')
      and (members @> jsonb_build_array(jsonb_build_object('pid', v_pid)) or coalesce(seats, '[]'::jsonb) @> jsonb_build_array(jsonb_build_object('pid', v_pid))) for update loop
    if r.state = 'attente' then
      update public.surb_live set members = coalesce((select jsonb_agg(m order by i) from jsonb_array_elements(members) with ordinality x(m, i) where m ->> 'pid' <> v_pid), '[]'::jsonb),
        state = case when jsonb_array_length(members) <= 1 then 'annule' else state end, updated_at = now() where id = r.id;
    else
      for s in 0 .. jsonb_array_length(r.seats) - 1 loop
        if r.seats -> s ->> 'pid' = v_pid then update public.surb_live set seats = jsonb_set(seats, array[s::text, 'seen'], '0'::jsonb) where id = r.id; end if;
      end loop;
    end if;
  end loop;
  -- Arbre de 32 (0.87.1) : à partir du 2e étage, la place est écrite d'avance
  if v_code <> '' and p_floor > 1 then
    select p.slot, (select (i - 1)::int from jsonb_array_elements(p.seats) with ordinality z(x, i) where x ->> 'pid' = v_pid limit 1)
      into v_pslot, v_pseat from public.surb_live p
      where p.code = v_code and p.ver = v_ver and p.arbre and p.slot is not null and p.floor = case when p_floor = 5 then 4 else p_floor - 1 end
        and p.state = 'fini' and p.seats @> jsonb_build_array(jsonb_build_object('pid', v_pid))
        -- (durcissement) un joueur éliminé, ou battu / encore en jeu dans son duel en direct, n'a pas de place écrite d'avance
        and coalesce(p.results ->> v_pid, '') not in ('perdu', 'elimine') and not public.surb_live_duel_blocked(p.id, v_pid)
      order by p.updated_at desc limit 1;
    if v_pseat is not null then
      v_slot := case when p_floor = 5 then 0 else v_pslot / 2 end;
      v_seat := case when p_floor = 5 then v_pseat % 2 else (v_pslot % 2) * 2 + v_pseat % 2 end;
      perform pg_advisory_xact_lock(hashtext('surb_arbre:' || v_code || ':' || v_ver || ':' || p_floor || ':' || v_slot));
      select id into v_id from public.surb_live where state = 'attente' and floor = p_floor and code = v_code and ver = v_ver and arbre and slot = v_slot
        order by created_at limit 1 for update;
      if v_id is null then
        if (select count(*) from public.surb_live) >= 500 then raise exception 'serveur plein' using errcode = '53400'; end if;
        v_id := substr(md5(random()::text || clock_timestamp()::text || v_pid), 1, 12);
        insert into public.surb_live (id, floor, code, ver, size, total, arbre, slot) values (v_id, p_floor, v_code, v_ver, v_size, case when v_size = 2 then 4 else 8 end, true, v_slot);
      end if;
      update public.surb_live set members = members || jsonb_build_array(jsonb_build_object('pid', v_pid, 'name', p_me -> 'name',
          'cls', coalesce(p_me -> 'cls', '"postulant"'::jsonb), 'fem', coalesce(p_me -> 'fem', 'false'::jsonb), 'deck', coalesce(p_me -> 'deck', '[]'::jsonb),
          'fp', case when jsonb_typeof(p_me -> 'fp') = 'object' then p_me -> 'fp' else '{}'::jsonb end, 'seen', nowe, 'joined', nowe, 'seat', v_seat)),
        updated_at = now() where id = v_id;
      return public.surb_live_view(v_id, v_pid, -1);
    end if;
  end if;
  -- une salle à l'étage 1 : une table de 4, ou la salle d'attente d'un arbre de 32 (p_me.arbre, pour qui la crée). Un jeu
  -- sans p_me.tree_ok (0.87.0 et avant) ne connaît pas l'arbre : il n'y entre pas (il ouvrirait une table de 4 à part).
  v_arbre := v_code <> '' and p_floor = 1 and coalesce(p_me ->> 'arbre', '') = 'true';
  select id into v_id from public.surb_live where state = 'attente' and floor = p_floor and code = v_code and ver = v_ver and slot is null
    and ((size = v_size and not arbre) or (v_code <> '' and p_floor = 1 and arbre and size = 32 and (v_arbre or coalesce(p_me ->> 'tree_ok', '') = 'true')))
    and jsonb_array_length(members) between 1 and size - 1
    and case when v_code = '' then public.surb_live_joinable(p_floor, created_at, members)
        else updated_at > now() - interval '15 minutes' end
    order by created_at limit 1 for update skip locked;
  if v_id is null then
    if (select count(*) from public.surb_live) >= 500 then raise exception 'serveur plein' using errcode = '53400'; end if;
    v_id := substr(md5(random()::text || clock_timestamp()::text || v_pid), 1, 12);
    insert into public.surb_live (id, floor, code, ver, size, total, arbre) values (v_id, p_floor, v_code, v_ver, case when v_arbre then 32 else v_size end, case when v_size = 2 then 4 else 8 end, v_arbre);
  end if;
  update public.surb_live set members = members || jsonb_build_array(jsonb_build_object('pid', v_pid, 'name', p_me -> 'name',
      'cls', coalesce(p_me -> 'cls', '"postulant"'::jsonb), 'fem', coalesce(p_me -> 'fem', 'false'::jsonb), 'deck', coalesce(p_me -> 'deck', '[]'::jsonb),
      'fp', case when jsonb_typeof(p_me -> 'fp') = 'object' then p_me -> 'fp' else '{}'::jsonb end, 'seen', nowe, 'joined', nowe)),
    updated_at = now() where id = v_id;
  return public.surb_live_view(v_id, v_pid, -1);
end $function$;

-- 6. Avertissements du linter Supabase « search_path mutable » (fonctions de calcul pur)
alter function public.surb_live_inc() set search_path = pg_catalog;
alter function public.surb_live_inc(integer) set search_path = pg_catalog;
alter function public.surb_live_bank0(integer) set search_path = pg_catalog;
alter function public.surb_live_tier(numeric) set search_path = pg_catalog;

notify pgrst, 'reload schema';

commit;
