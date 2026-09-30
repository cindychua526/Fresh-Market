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
