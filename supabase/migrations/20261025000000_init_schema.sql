-- ===================================================================
-- Swasthya schema
-- Replaces the ad hoc root SQL scripts (CREATE_ORDERS_TABLES, UPDATE_DB,
-- ADD_OTP_COLUMN, SET_MOQ_VALUES) with one consistent schema.
--
-- Business identity: a pharmacy or distributor profile's id IS its auth user
-- id. `user_id` is kept for the queries that look profiles up by it and is
-- always equal to `id`. Every pharmacy_id / distributor_id column therefore
-- holds an auth user id.
-- ===================================================================

-- -------------------------------------------------------------------
-- Admins and helpers
-- -------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- True for requests made by app clients (anon or signed-in JWT), false for
-- SQL editor, migrations and seeds.
create or replace function public.is_client_request()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Keeps id and user_id identical and stops non-admins from approving
-- themselves or changing their own role.
create or replace function public.guard_profile()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.user_id is not null then
      new.id := new.user_id;
    end if;
    new.user_id := new.id;
    if public.is_client_request() and not public.is_admin() then
      new.status := 'pending';
    end if;
  else
    new.id := old.id;
    new.user_id := old.id;
    if public.is_client_request() and not public.is_admin() then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

-- -------------------------------------------------------------------
-- Business profiles
-- -------------------------------------------------------------------
create table public.pharmacy_profiles (
  id uuid primary key default gen_random_uuid() references auth.users (id) on delete cascade,
  user_id uuid unique,
  email text not null unique,
  business_legal_name text not null,
  trade_name text,
  drug_license text,
  gstin text,
  contact_name text,
  contact_designation text,
  contact_mobile text,
  address text,
  city text,
  state text,
  role text not null default 'pharmacy' check (role = 'pharmacy'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  ml_id text unique, -- Demand-forecasting model id, e.g. PH_01
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pharmacy_profiles_id_matches_user check (user_id = id)
);

create table public.distributor_profiles (
  id uuid primary key default gen_random_uuid() references auth.users (id) on delete cascade,
  user_id uuid unique,
  email text not null unique,
  name text not null,
  display_name text,
  drug_license text,
  gstin text,
  contact_name text,
  contact_designation text,
  contact_mobile text,
  phone text,
  address text,
  warehouse_address text,
  location text,
  city text,
  state text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distributor_profiles_id_matches_user check (user_id = id)
);

create trigger pharmacy_profiles_guard before insert or update on public.pharmacy_profiles
  for each row execute function public.guard_profile();
create trigger distributor_profiles_guard before insert or update on public.distributor_profiles
  for each row execute function public.guard_profile();
create trigger pharmacy_profiles_updated_at before update on public.pharmacy_profiles
  for each row execute function public.set_updated_at();
create trigger distributor_profiles_updated_at before update on public.distributor_profiles
  for each row execute function public.set_updated_at();

-- Which distributors supply which pharmacies (managed by admins).
create table public.pharmacy_distributors (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacy_profiles (id) on delete cascade,
  distributor_id uuid not null references public.distributor_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (pharmacy_id, distributor_id)
);

-- -------------------------------------------------------------------
-- Catalog and stock
-- -------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  description text,
  category text,
  manufacturer text,
  pack_size text,
  hsn_code text,
  price numeric(10, 2) not null default 0 check (price >= 0), -- Pharmacy purchase price (INR)
  distributor_price numeric(10, 2) not null default 0 check (distributor_price >= 0), -- Distributor purchase price (INR)
  mrp numeric(10, 2) check (mrp >= 0),
  moq integer not null default 1 check (moq >= 1),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.pharmacy_inventory (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacy_profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  batch_number text,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pharmacy_inventory_pharmacy_idx on public.pharmacy_inventory (pharmacy_id);
create trigger pharmacy_inventory_updated_at before update on public.pharmacy_inventory
  for each row execute function public.set_updated_at();

create table public.distributor_stock (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sku text,
  quantity integer not null default 0 check (quantity >= 0),
  min_order_quantity integer not null default 1 check (min_order_quantity >= 1),
  batch_number text,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (distributor_id, product_id)
);
create trigger distributor_stock_updated_at before update on public.distributor_stock
  for each row execute function public.set_updated_at();

create table public.distributor_cart_items (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (distributor_id, product_id)
);

-- -------------------------------------------------------------------
-- Pharmacy -> distributor orders (distributor_id null = routed to admin)
-- -------------------------------------------------------------------
create or replace function public.normalize_order_status()
returns trigger
language plpgsql
as $$
begin
  new.status := lower(new.status);
  return new;
end;
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacy_profiles (id) on delete restrict,
  distributor_id uuid references public.distributor_profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected')),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  delivery_otp text,
  order_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_pharmacy_idx on public.orders (pharmacy_id, order_date desc);
create index orders_distributor_idx on public.orders (distributor_id, order_date desc);
create trigger orders_normalize_status before insert or update of status on public.orders
  for each row execute function public.normalize_order_status();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- -------------------------------------------------------------------
-- Distributor -> admin purchase orders
-- -------------------------------------------------------------------
create table public.distributor_admin_orders (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null,
  status text not null default 'Pending', -- The app uses capitalized statuses here
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  delivery_otp text,
  order_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The admin dashboard embeds distributor_profiles through this constraint name.
  constraint distributor_admin_orders_distributor_id_fkey
    foreign key (distributor_id) references public.distributor_profiles (id) on delete restrict
);
create index distributor_admin_orders_distributor_idx on public.distributor_admin_orders (distributor_id, created_at desc);
create trigger distributor_admin_orders_updated_at before update on public.distributor_admin_orders
  for each row execute function public.set_updated_at();

create table public.distributor_admin_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.distributor_admin_orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  unit_price numeric(10, 2) generated always as (price) stored -- Alias read by the admin order view
);
create index distributor_admin_order_items_order_idx on public.distributor_admin_order_items (order_id);

-- -------------------------------------------------------------------
-- Row-level security
-- -------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.pharmacy_profiles enable row level security;
alter table public.distributor_profiles enable row level security;
alter table public.pharmacy_distributors enable row level security;
alter table public.products enable row level security;
alter table public.pharmacy_inventory enable row level security;
alter table public.distributor_stock enable row level security;
alter table public.distributor_cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.distributor_admin_orders enable row level security;
alter table public.distributor_admin_order_items enable row level security;

create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Profiles: owners manage their own row, admins manage all, and mapped
-- partners can see each other.
create policy "pharmacy owner or admin" on public.pharmacy_profiles
  for all to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or user_id = auth.uid() or public.is_admin());
create policy "mapped distributors read pharmacies" on public.pharmacy_profiles
  for select to authenticated
  using (exists (
    select 1 from public.pharmacy_distributors m
    where m.pharmacy_id = pharmacy_profiles.id and m.distributor_id = auth.uid()
  ));

create policy "distributor owner or admin" on public.distributor_profiles
  for all to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or user_id = auth.uid() or public.is_admin());
create policy "mapped pharmacies read distributors" on public.distributor_profiles
  for select to authenticated
  using (exists (
    select 1 from public.pharmacy_distributors m
    where m.distributor_id = distributor_profiles.id and m.pharmacy_id = auth.uid()
  ));

create policy "admins manage mappings" on public.pharmacy_distributors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "partners read own mappings" on public.pharmacy_distributors
  for select to authenticated using (pharmacy_id = auth.uid() or distributor_id = auth.uid());

create policy "signed-in users read catalog" on public.products
  for select to authenticated using (true);
create policy "admins manage catalog" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "pharmacy manages own inventory" on public.pharmacy_inventory
  for all to authenticated
  using (pharmacy_id = auth.uid() or public.is_admin())
  with check (pharmacy_id = auth.uid() or public.is_admin());

create policy "distributor manages own stock" on public.distributor_stock
  for all to authenticated
  using (distributor_id = auth.uid() or public.is_admin())
  with check (distributor_id = auth.uid() or public.is_admin());

create policy "distributor manages own cart" on public.distributor_cart_items
  for all to authenticated
  using (distributor_id = auth.uid() or public.is_admin())
  with check (distributor_id = auth.uid() or public.is_admin());

create policy "order parties read" on public.orders
  for select to authenticated
  using (pharmacy_id = auth.uid() or distributor_id = auth.uid() or public.is_admin());
create policy "pharmacy places own orders" on public.orders
  for insert to authenticated
  with check (pharmacy_id = auth.uid() or public.is_admin());
create policy "order parties update" on public.orders
  for update to authenticated
  using (pharmacy_id = auth.uid() or distributor_id = auth.uid() or public.is_admin())
  with check (pharmacy_id = auth.uid() or distributor_id = auth.uid() or public.is_admin());
create policy "admins delete orders" on public.orders
  for delete to authenticated using (public.is_admin());

create policy "order parties read items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.pharmacy_id = auth.uid() or o.distributor_id = auth.uid() or public.is_admin())
  ));
create policy "pharmacy adds items to own orders" on public.order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and (o.pharmacy_id = auth.uid() or public.is_admin())
  ));
create policy "admins manage order items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "distributor or admin reads purchase orders" on public.distributor_admin_orders
  for select to authenticated using (distributor_id = auth.uid() or public.is_admin());
create policy "distributor places purchase orders" on public.distributor_admin_orders
  for insert to authenticated with check (distributor_id = auth.uid() or public.is_admin());
create policy "distributor or admin updates purchase orders" on public.distributor_admin_orders
  for update to authenticated
  using (distributor_id = auth.uid() or public.is_admin())
  with check (distributor_id = auth.uid() or public.is_admin());
create policy "admins delete purchase orders" on public.distributor_admin_orders
  for delete to authenticated using (public.is_admin());

create policy "distributor or admin reads purchase order items" on public.distributor_admin_order_items
  for select to authenticated
  using (exists (
    select 1 from public.distributor_admin_orders o
    where o.id = distributor_admin_order_items.order_id
      and (o.distributor_id = auth.uid() or public.is_admin())
  ));
create policy "distributor adds purchase order items" on public.distributor_admin_order_items
  for insert to authenticated
  with check (exists (
    select 1 from public.distributor_admin_orders o
    where o.id = distributor_admin_order_items.order_id
      and (o.distributor_id = auth.uid() or public.is_admin())
  ));
create policy "admins manage purchase order items" on public.distributor_admin_order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------------
-- Storage: product images
-- -------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('hercircle_assets', 'hercircle_assets', true)
on conflict (id) do nothing;

create policy "public reads product images" on storage.objects
  for select using (bucket_id = 'hercircle_assets');
create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'hercircle_assets' and public.is_admin());
create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'hercircle_assets' and public.is_admin());
create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'hercircle_assets' and public.is_admin());
