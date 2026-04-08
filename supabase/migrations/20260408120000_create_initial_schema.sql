-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: 飲食店ポートフォリオアプリの基本テーブル構造を作成
-- Tables: users, portfolios, places, photos
-- ============================================

-- ============================================
-- 1. テーブル作成
-- ============================================

-- users テーブル
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email varchar(255) not null,
  name varchar(255),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.users is 'アプリケーションのユーザー情報を管理（Clerkとの同期用）';

-- portfolios テーブル
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  title varchar(255) not null,
  share_id varchar(64) unique not null,
  is_public boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.portfolios is 'ユーザーが作成するお店のリスト（グループ）を管理';

-- places テーブル
create table public.places (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  tabelog_url varchar(1024) not null,
  ai_generated_text text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.places is 'ポートフォリオに追加される個々の店舗情報とAI生成記事を保存';

-- photos テーブル
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete cascade not null,
  storage_url varchar(1024) not null,
  order_index integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.photos is 'お店に紐づく写真のメタデータとStorageへのURLを管理';

-- ============================================
-- 2. RLS の有効化
-- ============================================

alter table public.users enable row level security;
alter table public.portfolios enable row level security;
alter table public.places enable row level security;
alter table public.photos enable row level security;

-- ============================================
-- 3. RLS ポリシー: users テーブル
-- ============================================

-- ユーザー自身のデータのみアクセス可能
create policy "users_select_own_data" on public.users
  for select to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_insert_own_data" on public.users
  for insert to authenticated
  with check (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_update_own_data" on public.users
  for update to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub')
  with check (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_delete_own_data" on public.users
  for delete to authenticated
  using (clerk_user_id = auth.jwt() ->> 'sub');

-- ============================================
-- 4. RLS ポリシー: portfolios テーブル
-- ============================================

-- 作成者自身のフルアクセス
create policy "portfolios_select_own_data" on public.portfolios
  for select to authenticated
  using (
    user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "portfolios_insert_own_data" on public.portfolios
  for insert to authenticated
  with check (
    user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "portfolios_update_own_data" on public.portfolios
  for update to authenticated
  using (
    user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  )
  with check (
    user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "portfolios_delete_own_data" on public.portfolios
  for delete to authenticated
  using (
    user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- パブリック閲覧 (is_public = true) - 未認証/認証済み共通
create policy "portfolios_select_public" on public.portfolios
  for select to anon
  using (is_public = true);

create policy "portfolios_select_public_auth" on public.portfolios
  for select to authenticated
  using (is_public = true);

-- ============================================
-- 5. RLS ポリシー: places テーブル
-- ============================================

-- 作成者自身のフルアクセス（ポートフォリオの所有者）
create policy "places_select_own_data" on public.places
  for select to authenticated
  using (
    portfolio_id in (
      select id from public.portfolios 
      where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "places_insert_own_data" on public.places
  for insert to authenticated
  with check (
    portfolio_id in (
      select id from public.portfolios 
      where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "places_update_own_data" on public.places
  for update to authenticated
  using (
    portfolio_id in (
      select id from public.portfolios 
      where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  )
  with check (
    portfolio_id in (
      select id from public.portfolios 
      where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

create policy "places_delete_own_data" on public.places
  for delete to authenticated
  using (
    portfolio_id in (
      select id from public.portfolios 
      where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

-- パブリック閲覧 (親ポートフォリオが is_public = true の場合) - 未認証/認証済み共通
create policy "places_select_public" on public.places
  for select to anon
  using (
    portfolio_id in (select id from public.portfolios where is_public = true)
  );

create policy "places_select_public_auth" on public.places
  for select to authenticated
  using (
    portfolio_id in (select id from public.portfolios where is_public = true)
  );

-- ============================================
-- 6. RLS ポリシー: photos テーブル
-- ============================================

-- 作成者自身のフルアクセス（ポートフォリオの所有者）
create policy "photos_select_own_data" on public.photos
  for select to authenticated
  using (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios 
        where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "photos_insert_own_data" on public.photos
  for insert to authenticated
  with check (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios 
        where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "photos_update_own_data" on public.photos
  for update to authenticated
  using (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios 
        where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  )
  with check (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios 
        where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

create policy "photos_delete_own_data" on public.photos
  for delete to authenticated
  using (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios 
        where user_id = (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
      )
    )
  );

-- パブリック閲覧 (親ポートフォリオが is_public = true の場合) - 未認証/認証済み共通
create policy "photos_select_public" on public.photos
  for select to anon
  using (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios where is_public = true
      )
    )
  );

create policy "photos_select_public_auth" on public.photos
  for select to authenticated
  using (
    place_id in (
      select id from public.places 
      where portfolio_id in (
        select id from public.portfolios where is_public = true
      )
    )
  );

-- ============================================
-- 7. インデックスの作成
-- ============================================

create index idx_users_clerk_user_id on public.users(clerk_user_id);
create index idx_portfolios_user_id on public.portfolios(user_id);
create index idx_portfolios_share_id on public.portfolios(share_id);
create index idx_places_portfolio_id on public.places(portfolio_id);
create index idx_photos_place_id on public.photos(place_id);
