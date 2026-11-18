3--- =========================================================
-- PETCARE ONG
-- Esquema inicial do PetCare ONG para Supabase.
-- Execute no SQL Editor do projeto Supabase.
-- =========================================================
 
 
-- =========================================================
-- 1. TABELA DE ANIMAIS
-- =========================================================
 
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
 
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
 
  name text not null
    check (char_length(trim(name)) > 0),
 
  species text not null
    check (char_length(trim(species)) > 0),
 
  breed text,
 
  sex text,
 
  birth_date date
    check (birth_date is null or birth_date <= current_date),
 
  current_weight numeric(7, 2)
    check (current_weight is null or current_weight > 0),
 
  status text not null default 'Disponível'
    check (status in (
      'Disponível',
      'Em tratamento',
      'Adotado',
      'Lar temporário'
    )),
 
  observations text,
 
  created_at timestamptz not null default now()
);
 
 
-- =========================================================
-- 2. TABELA DE ALIMENTOS
-- =========================================================
 
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
 
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
 
  name text not null
    check (char_length(trim(name)) > 0),
 
  brand text,
 
  food_type text not null
    check (char_length(trim(food_type)) > 0),
 
  ingredients text,
 
  restrictions text,
 
  observations text,
 
  created_at timestamptz not null default now()
);
 
 
-- =========================================================
-- 3. TABELA DE PLANOS ALIMENTARES
-- =========================================================
 
create table if not exists public.feeding_plans (
  id uuid primary key default gen_random_uuid(),
 
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
 
  animal_id uuid not null
    references public.animals (id) on delete cascade,
 
  food_id uuid
    references public.foods (id) on delete set null,
 
  daily_quantity numeric(8, 2) not null
    check (daily_quantity > 0),
 
  meals_per_day integer not null
    check (meals_per_day > 0),
 
  feeding_times text,
 
  observations text,
 
  active boolean not null default true,
 
  created_at timestamptz not null default now()
);
 
 
-- =========================================================
-- 4. TABELA DE HISTÓRICO DE PESO
-- =========================================================
 
create table if not exists public.weight_records (
  id uuid primary key default gen_random_uuid(),
 
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
 
  animal_id uuid not null
    references public.animals (id) on delete cascade,
 
  weight numeric(7, 2) not null
    check (weight > 0),
 
  record_date date not null default current_date
    check (record_date <= current_date),
 
  observations text,
 
  created_at timestamptz not null default now()
);
 
 
-- =========================================================
-- 5. ÍNDICES
-- =========================================================
 
create index if not exists animals_user_name_idx
  on public.animals (user_id, name);
 
create index if not exists foods_user_name_idx
  on public.foods (user_id, name);
 
create index if not exists feeding_plans_user_animal_idx
  on public.feeding_plans (user_id, animal_id);
 
create index if not exists feeding_plans_user_active_idx
  on public.feeding_plans (user_id, active);
 
create index if not exists weight_records_user_animal_date_idx
  on public.weight_records (user_id, animal_id, record_date desc);
 
 
-- =========================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- =========================================================
 
alter table public.animals enable row level security;
alter table public.foods enable row level security;
alter table public.feeding_plans enable row level security;
alter table public.weight_records enable row level security;
 
 
-- =========================================================
-- 7. LIMPAR POLÍTICAS ANTERIORES
-- =========================================================
 
drop policy if exists "animals_select_own"
  on public.animals;
 
drop policy if exists "animals_insert_own"
  on public.animals;
 
drop policy if exists "animals_update_own"
  on public.animals;
 
drop policy if exists "animals_delete_own"
  on public.animals;
 
 
drop policy if exists "foods_select_own"
  on public.foods;
 
drop policy if exists "foods_insert_own"
  on public.foods;
 
drop policy if exists "foods_update_own"
  on public.foods;
 
drop policy if exists "foods_delete_own"
  on public.foods;
 
 
drop policy if exists "feeding_plans_select_own"
  on public.feeding_plans;
 
drop policy if exists "feeding_plans_insert_own"
  on public.feeding_plans;
 
drop policy if exists "feeding_plans_update_own"
  on public.feeding_plans;
 
drop policy if exists "feeding_plans_delete_own"
  on public.feeding_plans;
 
 
drop policy if exists "weight_records_select_own"
  on public.weight_records;
 
drop policy if exists "weight_records_insert_own"
  on public.weight_records;
 
drop policy if exists "weight_records_update_own"
  on public.weight_records;
 
drop policy if exists "weight_records_delete_own"
  on public.weight_records;
 
 
-- =========================================================
-- 8. POLÍTICAS DA TABELA ANIMALS
-- =========================================================
 
create policy "animals_select_own"
  on public.animals for select to authenticated
  using (user_id = (select auth.uid()));
 
create policy "animals_insert_own"
  on public.animals for insert to authenticated
  with check (user_id = (select auth.uid()));
 
create policy "animals_update_own"
  on public.animals for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
 
create policy "animals_delete_own"
  on public.animals for delete to authenticated
  using (user_id = (select auth.uid()));
 
 
-- =========================================================
-- 9. POLÍTICAS DA TABELA FOODS
-- =========================================================
 
create policy "foods_select_own"
  on public.foods for select to authenticated
  using (user_id = (select auth.uid()));
 
create policy "foods_insert_own"
  on public.foods for insert to authenticated
  with check (user_id = (select auth.uid()));
 
create policy "foods_update_own"
  on public.foods for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
 
create policy "foods_delete_own"
  on public.foods for delete to authenticated
  using (user_id = (select auth.uid()));
 
 
-- =========================================================
-- 10. POLÍTICAS DA TABELA FEEDING_PLANS
-- =========================================================
 
create policy "feeding_plans_select_own"
  on public.feeding_plans for select to authenticated
  using (user_id = (select auth.uid()));
 
create policy "feeding_plans_insert_own"
  on public.feeding_plans for insert to authenticated
  with check (
    user_id = (select auth.uid())
 
    and exists (
      select 1
      from public.animals a
      where a.id = animal_id
        and a.user_id = (select auth.uid())
    )
 
    and (
      food_id is null
      or exists (
        select 1
        from public.foods f
        where f.id = food_id
          and f.user_id = (select auth.uid())
      )
    )
  );
 
create policy "feeding_plans_update_own"
  on public.feeding_plans for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
 
    and exists (
      select 1
      from public.animals a
      where a.id = animal_id
        and a.user_id = (select auth.uid())
    )
 
    and (
      food_id is null
      or exists (
        select 1
        from public.foods f
        where f.id = food_id
          and f.user_id = (select auth.uid())
      )
    )
  );
 
create policy "feeding_plans_delete_own"
  on public.feeding_plans for delete to authenticated
  using (user_id = (select auth.uid()));
 
 
-- =========================================================
-- 11. POLÍTICAS DA TABELA WEIGHT_RECORDS
-- =========================================================
 
create policy "weight_records_select_own"
  on public.weight_records for select to authenticated
  using (user_id = (select auth.uid()));
 
create policy "weight_records_insert_own"
  on public.weight_records for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.animals a
      where a.id = animal_id
        and a.user_id = (select auth.uid())
    )
  );
 
create policy "weight_records_update_own"
  on public.weight_records for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.animals a
      where a.id = animal_id
        and a.user_id = (select auth.uid())
    )
  );
 
create policy "weight_records_delete_own"
  on public.weight_records for delete to authenticated
  using (user_id = (select auth.uid()));
 
 
-- =========================================================
-- 12. PERMISSÕES
-- =========================================================
 
revoke all on public.animals,
               public.foods,
               public.feeding_plans,
               public.weight_records
from anon;
 
grant select, insert, update, delete
  on public.animals,
     public.foods,
     public.feeding_plans,
     public.weight_records
to authenticated;
 
 
-- =========================================================
-- FIM DO ESQUEMA PETCARE ONG
-- =========================================================