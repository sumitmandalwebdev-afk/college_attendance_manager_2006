-- College Attendance Manager — Database Schema (PostgreSQL / Supabase)
-- Run this once in the Supabase SQL editor (or via the psql connection string).

create extension if not exists pgcrypto;

-- ── Admins (real login accounts, no demo/example rows shipped) ──────────────
create table if not exists admins (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    password_hash text not null,
    created_at timestamptz not null default now()
);

-- ── Students ──────────────────────────────────────────────────────────────
create table if not exists students (
    id uuid primary key default gen_random_uuid(),
    roll_number text unique not null,
    name text not null,
    department text not null,
    year int not null,
    email text,
    phone text,
    qr_code text unique not null,          -- encoded value shown/scanned as the student's QR
    created_at timestamptz not null default now()
);

-- ── Timetable ─────────────────────────────────────────────────────────────
create table if not exists timetable (
    id uuid primary key default gen_random_uuid(),
    department text not null,
    year int not null,
    day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday
    start_time time not null,
    end_time time not null,
    subject text not null,
    teacher text not null,
    room text,
    created_at timestamptz not null default now()
);

-- ── Attendance ────────────────────────────────────────────────────────────
create table if not exists attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    timetable_id uuid references timetable(id) on delete set null,
    date date not null default current_date,
    status text not null check (status in ('present', 'absent', 'late')) default 'present',
    marked_via text not null default 'qr' check (marked_via in ('qr', 'manual')),
    marked_by uuid references admins(id),
    created_at timestamptz not null default now(),
    unique (student_id, timetable_id, date)
);

-- ── Notifications ─────────────────────────────────────────────────────────
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    message text not null,
    type text not null default 'info' check (type in ('info', 'warning', 'success', 'error')),
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_attendance_date on attendance(date);
create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_students_dept_year on students(department, year);
create index if not exists idx_timetable_dept_year on timetable(department, year);
