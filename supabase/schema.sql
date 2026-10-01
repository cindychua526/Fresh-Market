-- 小镇鲜市 · 云存档（玩家ID + 恢复码，不需要邮箱）
-- 在 Supabase 后台 → SQL Editor 里整段粘贴，点 Run 运行一次即可。

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.player_saves (
  player_id   text primary key,          -- 例如 FM-3A9F2C
  secret_hash text not null,             -- 恢复码/密码的加密哈希（数据库里看不到原文）
  data        jsonb,
  progress    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 打开行级权限但不给任何直接读写权限：网页只能通过下面 4 个函数访问，
-- 而且每个函数都会先核对恢复码。
alter table public.player_saves enable row level security;
revoke all on public.player_saves from anon, authenticated;

-- 1) 新玩家：生成玩家ID
create or replace function public.fm_register(p_secret text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_id text; tries int := 0;
begin
  if p_secret is null or length(p_secret) < 6 or length(p_secret) > 64 then
    raise exception 'invalid secret';
  end if;
  loop
    v_id := 'FM-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    begin
      insert into public.player_saves(player_id, secret_hash) values (v_id, crypt(p_secret, gen_salt('bf')));
      return v_id;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 10 then raise; end if;
    end;
  end loop;
end $$;

-- 2) 备份存档
create or replace function public.fm_save(p_id text, p_secret text, p_data jsonb, p_progress integer)
returns timestamptz language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_now timestamptz := now();
begin
  if pg_column_size(p_data) > 300000 then raise exception 'save too large'; end if;
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  update public.player_saves s set data = p_data, progress = greatest(0, coalesce(p_progress, 0)), updated_at = v_now
   where s.player_id = p_id;
  return v_now;
end $$;

-- 3) 读取存档（找回进度）
create or replace function public.fm_load(p_id text, p_secret text)
returns table(data jsonb, progress integer, updated_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
declare v_hash text;
begin
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  return query select s.data, s.progress, s.updated_at from public.player_saves s where s.player_id = p_id;
end $$;

-- 4) 改成自己好记的密码
create or replace function public.fm_set_secret(p_id text, p_secret text, p_new text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text;
begin
  if p_new is null or length(p_new) < 6 or length(p_new) > 64 then raise exception 'invalid secret'; end if;
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  update public.player_saves s set secret_hash = crypt(p_new, gen_salt('bf')) where s.player_id = p_id;
end $$;

revoke all on function public.fm_register(text)                      from public;
revoke all on function public.fm_save(text, text, jsonb, integer)    from public;
revoke all on function public.fm_load(text, text)                    from public;
revoke all on function public.fm_set_secret(text, text, text)        from public;
grant execute on function public.fm_register(text)                   to anon, authenticated;
grant execute on function public.fm_save(text, text, jsonb, integer) to anon, authenticated;
grant execute on function public.fm_load(text, text)                 to anon, authenticated;
grant execute on function public.fm_set_secret(text, text, text)     to anon, authenticated;

-- ============ 排行榜 ============
alter table public.player_saves add column if not exists nickname text;
alter table public.player_saves add column if not exists earned   bigint  not null default 0;
alter table public.player_saves add column if not exists story_ch integer not null default 0;
alter table public.player_saves add column if not exists score_at timestamptz;

-- 上传分数（同样要核对恢复码）
create or replace function public.fm_score(p_id text, p_secret text, p_name text, p_earned bigint, p_progress integer, p_story integer)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text;
begin
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  update public.player_saves s set
    nickname = nullif(left(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>&"]', '', 'g'), 12), ''),
    earned   = greatest(0, least(coalesce(p_earned, 0), 1000000000000)),
    progress = greatest(0, least(coalesce(p_progress, 0), 1000)),
    story_ch = greatest(0, least(coalesce(p_story, 0), 100)),
    score_at = now()
  where s.player_id = p_id;
end $$;

-- 前 50 名（公开，只返回昵称、分数和玩家ID后 3 位）
create or replace function public.fm_top(p_kind text)
returns table(rank integer, nickname text, value bigint, tag text)
language sql security definer set search_path = public stable as $$
  select (row_number() over (order by v desc, s.score_at asc))::int, coalesce(s.nickname, '玩家'), v, right(s.player_id, 3)
  from (select s.*, case p_kind when 'progress' then s.progress::bigint when 'story' then s.story_ch::bigint else s.earned end as v
        from public.player_saves s where s.score_at is not null) s
  order by v desc, s.score_at asc
  limit 50;
$$;

-- 我的名次
create or replace function public.fm_rank(p_id text, p_kind text)
returns integer language sql security definer set search_path = public stable as $$
  with me as (select case p_kind when 'progress' then progress::bigint when 'story' then story_ch::bigint else earned end as v, score_at
              from public.player_saves where player_id = p_id and score_at is not null)
  select (select count(*) from public.player_saves s, me
           where s.score_at is not null
             and (case p_kind when 'progress' then s.progress::bigint when 'story' then s.story_ch::bigint else s.earned end) > me.v)::int + 1
  from me;
$$;

revoke all on function public.fm_score(text, text, text, bigint, integer, integer) from public;
revoke all on function public.fm_top(text)        from public;
revoke all on function public.fm_rank(text, text) from public;
grant execute on function public.fm_score(text, text, text, bigint, integer, integer) to anon, authenticated;
grant execute on function public.fm_top(text)        to anon, authenticated;
grant execute on function public.fm_rank(text, text) to anon, authenticated;

-- ============ v3：周榜、防作弊、云端历史版本 ============
alter table public.player_saves add column if not exists week_start date;
alter table public.player_saves add column if not exists week_base  bigint not null default 0;

create table if not exists public.player_save_history (
  player_id text not null references public.player_saves(player_id) on delete cascade,
  saved_at  timestamptz not null default now(),
  progress  integer not null default 0,
  data      jsonb,
  primary key (player_id, saved_at)
);
alter table public.player_save_history enable row level security;
revoke all on public.player_save_history from anon, authenticated;

-- 备份存档：每 10 分钟额外存一份历史版本，只保留最近 3 份
create or replace function public.fm_save(p_id text, p_secret text, p_data jsonb, p_progress integer)
returns timestamptz language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_now timestamptz := now(); v_last timestamptz;
begin
  if pg_column_size(p_data) > 300000 then raise exception 'save too large'; end if;
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  update public.player_saves s set data = p_data, progress = greatest(0, least(coalesce(p_progress, 0), 1000)), updated_at = v_now
   where s.player_id = p_id;
  select max(h.saved_at) into v_last from public.player_save_history h where h.player_id = p_id;
  if v_last is null or v_last < v_now - interval '10 minutes' then
    insert into public.player_save_history(player_id, saved_at, progress, data) values (p_id, v_now, greatest(0, coalesce(p_progress, 0)), p_data);
    delete from public.player_save_history h where h.player_id = p_id
      and h.saved_at not in (select h2.saved_at from public.player_save_history h2 where h2.player_id = p_id order by h2.saved_at desc limit 3);
  end if;
  return v_now;
end $$;

create or replace function public.fm_history(p_id text, p_secret text)
returns table(saved_at timestamptz, progress integer)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
declare v_hash text;
begin
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  return query select h.saved_at, h.progress from public.player_save_history h where h.player_id = p_id order by h.saved_at desc;
end $$;

create or replace function public.fm_history_load(p_id text, p_secret text, p_at timestamptz)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_data jsonb;
begin
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
  select h.data into v_data from public.player_save_history h where h.player_id = p_id and h.saved_at = p_at;
  if v_data is null then raise exception 'version not found'; end if;
  return v_data;
end $$;

-- 上传分数：加入周榜，并限制收入增长速度（防止明显作弊）
create or replace function public.fm_score(p_id text, p_secret text, p_name text, p_earned bigint, p_progress integer, p_story integer)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare r public.player_saves%rowtype; v_week date := date_trunc('week', now())::date; v_allowed bigint; v_earned bigint;
begin
  select * into r from public.player_saves s where s.player_id = p_id;
  if r.secret_hash is null or r.secret_hash <> crypt(p_secret, r.secret_hash) then raise exception 'invalid id or secret'; end if;
  -- 每秒最多增加 5000（第一次上传可以带上已有进度）
  v_allowed := case when r.score_at is null then 50000000
                    else r.earned + greatest(60, extract(epoch from now() - r.score_at))::bigint * 5000 end;
  v_earned := greatest(r.earned, least(coalesce(p_earned, 0), v_allowed, 1000000000000));
  update public.player_saves s set
    nickname   = nullif(left(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>&"]', '', 'g'), 12), ''),
    earned     = v_earned,
    progress   = greatest(0, least(coalesce(p_progress, 0), 1000)),
    story_ch   = greatest(0, least(coalesce(p_story, 0), 100)),
    week_base  = case when r.week_start is distinct from v_week then r.earned else r.week_base end,
    week_start = v_week,
    score_at   = now()
  where s.player_id = p_id;
end $$;

create or replace function public.fm_top(p_kind text)
returns table(rank integer, nickname text, value bigint, tag text)
language sql security definer set search_path = public stable as $$
  select (row_number() over (order by v desc, s.score_at asc))::int, coalesce(s.nickname, '玩家'), v, right(s.player_id, 3)
  from (select s.*, case p_kind
          when 'progress' then s.progress::bigint
          when 'story'    then s.story_ch::bigint
          when 'weekly'   then case when s.week_start = date_trunc('week', now())::date then s.earned - s.week_base else 0 end
          else s.earned end as v
        from public.player_saves s where s.score_at is not null) s
  where p_kind <> 'weekly' or v > 0
  order by v desc, s.score_at asc
  limit 50;
$$;

create or replace function public.fm_rank(p_id text, p_kind text)
returns integer language sql security definer set search_path = public stable as $$
  with vals as (
    select s.player_id, case p_kind
      when 'progress' then s.progress::bigint
      when 'story'    then s.story_ch::bigint
      when 'weekly'   then case when s.week_start = date_trunc('week', now())::date then s.earned - s.week_base else 0 end
      else s.earned end as v
    from public.player_saves s where s.score_at is not null)
  select (select count(*) from vals o where o.v > me.v)::int + 1 from vals me where me.player_id = p_id;
$$;

revoke all on function public.fm_history(text, text)                        from public;
revoke all on function public.fm_history_load(text, text, timestamptz)      from public;
grant execute on function public.fm_history(text, text)                     to anon, authenticated;
grant execute on function public.fm_history_load(text, text, timestamptz)   to anon, authenticated;
grant execute on function public.fm_save(text, text, jsonb, integer)        to anon, authenticated;
grant execute on function public.fm_score(text, text, text, bigint, integer, integer) to anon, authenticated;
grant execute on function public.fm_top(text)                               to anon, authenticated;
grant execute on function public.fm_rank(text, text)                        to anon, authenticated;

-- =====================================================================
-- v7：开心农场 · 拜访朋友（帮忙浇水除虫 / 偷一点菜）
-- 已经运行过旧版的站长：把整个文件再运行一次即可，不会影响已有存档。
-- =====================================================================
create table if not exists public.farm_public (
  player_id  text primary key references public.player_saves(player_id) on delete cascade,
  nickname   text,
  farm       jsonb not null default '{}'::jsonb,   -- 只有公开信息：作物、种下时间、生长时长、还没处理的需求
  updated_at timestamptz not null default now()
);
create table if not exists public.farm_marks (
  id         bigserial primary key,
  target_id  text not null,       -- 被拜访的农场
  plot       integer not null,
  planted_at bigint not null,     -- 作物种下的时间（毫秒），用来确认还是同一棵作物
  kind       text not null,       -- water / weed / bug / steal
  by_id      text not null,
  by_name    text,
  at         timestamptz not null default now()
);
create index if not exists farm_marks_target on public.farm_marks(target_id, at);
create index if not exists farm_marks_by on public.farm_marks(by_id, at);
alter table public.farm_public enable row level security;
alter table public.farm_marks  enable row level security;
revoke all on public.farm_public from anon, authenticated;
revoke all on public.farm_marks  from anon, authenticated;

-- 内部用：核对玩家ID和恢复码
create or replace function public.fm_auth(p_id text, p_secret text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text;
begin
  select s.secret_hash into v_hash from public.player_saves s where s.player_id = p_id;
  if v_hash is null or v_hash <> crypt(p_secret, v_hash) then raise exception 'invalid id or secret'; end if;
end $$;
revoke all on function public.fm_auth(text, text) from public, anon, authenticated;

-- 发布自己的农场（公开部分）
create or replace function public.fm_farm_put(p_id text, p_secret text, p_name text, p_farm jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.fm_auth(p_id, p_secret);
  if pg_column_size(p_farm) > 20000 then raise exception 'farm too large'; end if;
  insert into public.farm_public(player_id, nickname, farm, updated_at)
  values (p_id, left(coalesce(p_name, ''), 12), p_farm, now())
  on conflict (player_id) do update set nickname = excluded.nickname, farm = excluded.farm, updated_at = now();
end $$;

-- 看某个农场（任何人只要知道农场ID就能看；里面没有任何私密信息）
create or replace function public.fm_farm_get(p_target text)
returns table(nickname text, farm jsonb, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select f.nickname, f.farm, f.updated_at from public.farm_public f where f.player_id = p_target;
$$;

-- 附近的农场：最近 7 天有人玩的，随机 6 个
create or replace function public.fm_farm_random(p_id text)
returns table(player_id text, nickname text, updated_at timestamptz)
language sql security definer set search_path = public volatile as $$
  select f.player_id, f.nickname, f.updated_at from public.farm_public f
   where f.player_id <> coalesce(p_id, '') and f.updated_at > now() - interval '7 days'
   order by random() limit 6;
$$;

-- 拜访时的动作：water / weed / bug（帮忙）或 steal（偷一点）。所有规则都在服务器检查。
create or replace function public.fm_farm_act(p_id text, p_secret text, p_name text, p_target text, p_plot integer, p_planted bigint, p_kind text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_farm jsonb; v_plot jsonb; v_now bigint := (extract(epoch from now()) * 1000)::bigint; v_dur bigint; v_thr double precision; v_n int; v_max int;
begin
  perform public.fm_auth(p_id, p_secret);
  if p_target = p_id then return 'self'; end if;
  if p_kind not in ('water', 'weed', 'bug', 'steal') then return 'bad'; end if;
  select f.farm into v_farm from public.farm_public f where f.player_id = p_target;
  if v_farm is null then return 'nofarm'; end if;
  v_plot := v_farm -> 'p' -> p_plot;
  if v_plot is null or jsonb_typeof(v_plot) <> 'object' or (v_plot ->> 'at')::bigint <> p_planted then return 'gone'; end if;
  v_dur := greatest(60000, coalesce((v_plot ->> 'dur')::bigint, 0));
  -- 每天上限：偷 12 次、帮忙 30 次
  select count(*) into v_n from public.farm_marks m
   where m.by_id = p_id and m.at > now() - interval '1 day' and ((m.kind = 'steal') = (p_kind = 'steal'));
  if v_n >= (case when p_kind = 'steal' then 12 else 30 end) then return 'limit'; end if;
  -- 同一个人对同一棵作物：每种帮忙各一次，偷只能一次
  if exists (select 1 from public.farm_marks m where m.target_id = p_target and m.plot = p_plot and m.planted_at = p_planted
             and m.by_id = p_id and m.kind = p_kind) then return 'done'; end if;
  if p_kind = 'steal' then
    if v_now < p_planted + v_dur then return 'notripe'; end if;
    v_max := case when coalesce((v_farm ->> 'g')::boolean, false) then 1 else 2 end;   -- 有稻草人只能被偷 1 次
    select count(*) into v_n from public.farm_marks m where m.target_id = p_target and m.plot = p_plot and m.planted_at = p_planted and m.kind = 'steal';
    if v_n >= v_max then return 'empty'; end if;
  else
    if v_now >= p_planted + v_dur then return 'noneed'; end if;
    v_thr := (v_plot -> 'n' ->> p_kind)::double precision;
    if v_thr is null or v_now < p_planted + (v_dur * v_thr)::bigint then return 'noneed'; end if;
  end if;
  insert into public.farm_marks(target_id, plot, planted_at, kind, by_id, by_name)
  values (p_target, p_plot, p_planted, p_kind, p_id, left(coalesce(p_name, ''), 12));
  return 'ok';
end $$;

-- 农场主人读取别人对自己农场做了什么（并清理 14 天前的记录）
create or replace function public.fm_farm_marks(p_id text, p_secret text, p_since timestamptz)
returns table(plot integer, planted_at bigint, kind text, by_name text, at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
begin
  perform public.fm_auth(p_id, p_secret);
  delete from public.farm_marks m where m.at < now() - interval '14 days';
  return query select m.plot, m.planted_at, m.kind, m.by_name, m.at from public.farm_marks m
    where m.target_id = p_id and m.at > coalesce(p_since, 'epoch'::timestamptz) order by m.at limit 200;
end $$;

grant execute on function public.fm_farm_put(text, text, text, jsonb)                              to anon, authenticated;
grant execute on function public.fm_farm_get(text)                                                 to anon, authenticated;
grant execute on function public.fm_farm_random(text)                                              to anon, authenticated;
grant execute on function public.fm_farm_act(text, text, text, text, integer, bigint, text)        to anon, authenticated;
grant execute on function public.fm_farm_marks(text, text, timestamptz)                            to anon, authenticated;

-- =====================================================================
-- v8：排行榜防作弊加强（所有检查都在服务器上做，改本机存档也没用）
--   · 收入：每秒最多增加 1500；第一次上传最多 = 账号存在的秒数 × 1500（最多 2000 万）
--   · 解锁进度：最多 200；每 20 秒最多 +1（开分店会变小，允许变小）
--   · 故事章节：最多 30；每 60 秒最多 +1，不能倒退
--   · 10 秒内重复上传会被忽略
-- =====================================================================
create or replace function public.fm_score(p_id text, p_secret text, p_name text, p_earned bigint, p_progress integer, p_story integer)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare r public.player_saves%rowtype; v_week date := date_trunc('week', now())::date;
        v_secs double precision; v_age double precision; v_earned bigint; v_prog integer; v_story integer;
begin
  select * into r from public.player_saves s where s.player_id = p_id;
  if r.secret_hash is null or r.secret_hash <> crypt(p_secret, r.secret_hash) then raise exception 'invalid id or secret'; end if;
  if r.score_at is not null and r.score_at > now() - interval '10 seconds' then return; end if;
  v_age  := greatest(60, extract(epoch from now() - coalesce(r.created_at, now() - interval '1 hour')));
  v_secs := case when r.score_at is null then v_age else greatest(1, extract(epoch from now() - r.score_at)) end;
  v_earned := case when r.score_at is null
                   then least(greatest(0, coalesce(p_earned, 0)), (v_age * 1500)::bigint, 20000000)
                   else greatest(r.earned, least(coalesce(p_earned, 0), r.earned + (v_secs * 1500)::bigint, 1000000000000)) end;
  v_prog := greatest(0, least(coalesce(p_progress, 0), 200,
              case when r.score_at is null then (v_age / 20)::int + 3 else coalesce(r.progress, 0) + (v_secs / 20)::int + 1 end));
  v_story := greatest(coalesce(r.story_ch, 0), least(coalesce(p_story, 0), 30,
              case when r.score_at is null then (v_age / 60)::int + 1 else coalesce(r.story_ch, 0) + (v_secs / 60)::int + 1 end));
  update public.player_saves s set
    nickname   = nullif(left(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>&"]', '', 'g'), 12), ''),
    earned     = v_earned,
    progress   = v_prog,
    story_ch   = v_story,
    week_base  = case when r.week_start is distinct from v_week then r.earned else r.week_base end,
    week_start = v_week,
    score_at   = now()
  where s.player_id = p_id;
end $$;
revoke all on function public.fm_score(text, text, text, bigint, integer, integer) from public;
grant execute on function public.fm_score(text, text, text, bigint, integer, integer) to anon, authenticated;
