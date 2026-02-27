-- ============================================================
-- FITNESS & HEALTH TRACKER — initial schema
-- ============================================================

-- ---------- profiles ----------
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  unit_system   text not null default 'imperial'
                  check (unit_system in ('imperial','metric')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- exercises ----------
create table public.exercises (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  exercise_type   text not null default 'strength'
                    check (exercise_type in ('strength','cardio','flexibility','other')),
  primary_muscle  text not null default 'other'
                    check (primary_muscle in (
                      'chest','back','shoulders','biceps','triceps','forearms',
                      'core','quads','hamstrings','glutes','calves',
                      'full_body','upper_body','lower_body','other')),
  equipment       text not null default 'bodyweight'
                    check (equipment in (
                      'barbell','dumbbell','machine','cable','bodyweight',
                      'kettlebell','band','steel_mace','steel_club','other')),
  notes           text,
  is_archived     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- workout templates ----------
create table public.workout_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.workout_template_exercises (
  id                  uuid primary key default gen_random_uuid(),
  template_id         uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id         uuid not null references public.exercises(id) on delete cascade,
  sort_order          int not null default 0,
  target_sets         int,
  target_reps         int,
  target_weight       numeric,
  target_duration_sec int,
  rest_seconds        int,
  notes               text
);

-- ---------- workout sessions (logs) ----------
create table public.workout_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  template_id   uuid references public.workout_templates(id) on delete set null,
  name          text not null,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  duration_sec  int,
  notes         text,
  created_at    timestamptz not null default now()
);

create table public.workout_sets (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id         uuid not null references public.exercises(id) on delete cascade,
  set_number          int not null,
  reps                int,
  weight              numeric,
  duration_sec        int,
  distance_meters     numeric,
  rpe                 numeric check (rpe >= 1 and rpe <= 10),
  is_warmup           boolean not null default false,
  notes               text,
  performed_at        timestamptz not null default now()
);

-- ---------- programs ----------
create table public.programs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  weeks       int not null default 1,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.program_days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  week_number int not null default 1,
  day_number  int not null default 1,
  name        text not null,
  sort_order  int not null default 0
);

create table public.program_day_exercises (
  id                  uuid primary key default gen_random_uuid(),
  program_day_id      uuid not null references public.program_days(id) on delete cascade,
  exercise_id         uuid not null references public.exercises(id) on delete cascade,
  sort_order          int not null default 0,
  target_sets         int,
  target_reps         int,
  target_weight       numeric,
  target_duration_sec int,
  rest_seconds        int,
  notes               text
);

-- ---------- personal records ----------
create table public.personal_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  record_type   text not null
                  check (record_type in ('max_weight','max_reps','max_volume','max_duration')),
  value         numeric not null,
  achieved_at   timestamptz not null default now(),
  set_id        uuid references public.workout_sets(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- body measurements ----------
create table public.body_measurements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  measured_at   timestamptz not null default now(),
  weight        numeric,
  body_fat_pct  numeric,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_exercises_user          on public.exercises(user_id);
create index idx_workout_templates_user  on public.workout_templates(user_id);
create index idx_workout_sessions_user   on public.workout_sessions(user_id);
create index idx_workout_sets_session    on public.workout_sets(session_id);
create index idx_programs_user           on public.programs(user_id);
create index idx_personal_records_user   on public.personal_records(user_id);
create index idx_body_measurements_user  on public.body_measurements(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles                  enable row level security;
alter table public.exercises                 enable row level security;
alter table public.workout_templates         enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_sessions          enable row level security;
alter table public.workout_sets              enable row level security;
alter table public.programs                  enable row level security;
alter table public.program_days              enable row level security;
alter table public.program_day_exercises     enable row level security;
alter table public.personal_records          enable row level security;
alter table public.body_measurements         enable row level security;

-- Helper: owner-only policies
-- profiles
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- exercises
create policy "Users can view own exercises"   on public.exercises for select using (auth.uid() = user_id);
create policy "Users can insert own exercises" on public.exercises for insert with check (auth.uid() = user_id);
create policy "Users can update own exercises" on public.exercises for update using (auth.uid() = user_id);
create policy "Users can delete own exercises" on public.exercises for delete using (auth.uid() = user_id);

-- workout_templates
create policy "Users can view own templates"   on public.workout_templates for select using (auth.uid() = user_id);
create policy "Users can insert own templates" on public.workout_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own templates" on public.workout_templates for update using (auth.uid() = user_id);
create policy "Users can delete own templates" on public.workout_templates for delete using (auth.uid() = user_id);

-- workout_template_exercises (access via template ownership)
create policy "Users can view own template exercises"   on public.workout_template_exercises for select
  using (exists (select 1 from public.workout_templates t where t.id = template_id and t.user_id = auth.uid()));
create policy "Users can insert own template exercises" on public.workout_template_exercises for insert
  with check (exists (select 1 from public.workout_templates t where t.id = template_id and t.user_id = auth.uid()));
create policy "Users can update own template exercises" on public.workout_template_exercises for update
  using (exists (select 1 from public.workout_templates t where t.id = template_id and t.user_id = auth.uid()));
create policy "Users can delete own template exercises" on public.workout_template_exercises for delete
  using (exists (select 1 from public.workout_templates t where t.id = template_id and t.user_id = auth.uid()));

-- workout_sessions
create policy "Users can view own sessions"   on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.workout_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on public.workout_sessions for delete using (auth.uid() = user_id);

-- workout_sets (access via session ownership)
create policy "Users can view own sets"   on public.workout_sets for select
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Users can insert own sets" on public.workout_sets for insert
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Users can update own sets" on public.workout_sets for update
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Users can delete own sets" on public.workout_sets for delete
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- programs
create policy "Users can view own programs"   on public.programs for select using (auth.uid() = user_id);
create policy "Users can insert own programs" on public.programs for insert with check (auth.uid() = user_id);
create policy "Users can update own programs" on public.programs for update using (auth.uid() = user_id);
create policy "Users can delete own programs" on public.programs for delete using (auth.uid() = user_id);

-- program_days (access via program ownership)
create policy "Users can view own program days"   on public.program_days for select
  using (exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid()));
create policy "Users can insert own program days" on public.program_days for insert
  with check (exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid()));
create policy "Users can update own program days" on public.program_days for update
  using (exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid()));
create policy "Users can delete own program days" on public.program_days for delete
  using (exists (select 1 from public.programs p where p.id = program_id and p.user_id = auth.uid()));

-- program_day_exercises (access via program ownership)
create policy "Users can view own program day exercises"   on public.program_day_exercises for select
  using (exists (
    select 1 from public.program_days d
    join public.programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = auth.uid()
  ));
create policy "Users can insert own program day exercises" on public.program_day_exercises for insert
  with check (exists (
    select 1 from public.program_days d
    join public.programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = auth.uid()
  ));
create policy "Users can update own program day exercises" on public.program_day_exercises for update
  using (exists (
    select 1 from public.program_days d
    join public.programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = auth.uid()
  ));
create policy "Users can delete own program day exercises" on public.program_day_exercises for delete
  using (exists (
    select 1 from public.program_days d
    join public.programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = auth.uid()
  ));

-- personal_records
create policy "Users can view own records"   on public.personal_records for select using (auth.uid() = user_id);
create policy "Users can insert own records" on public.personal_records for insert with check (auth.uid() = user_id);
create policy "Users can update own records" on public.personal_records for update using (auth.uid() = user_id);
create policy "Users can delete own records" on public.personal_records for delete using (auth.uid() = user_id);

-- body_measurements
create policy "Users can view own measurements"   on public.body_measurements for select using (auth.uid() = user_id);
create policy "Users can insert own measurements" on public.body_measurements for insert with check (auth.uid() = user_id);
create policy "Users can update own measurements" on public.body_measurements for update using (auth.uid() = user_id);
create policy "Users can delete own measurements" on public.body_measurements for delete using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles           for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.exercises          for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.workout_templates  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.programs           for each row execute function public.update_updated_at();
