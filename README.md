# College Attendance Manager

A ground-up rewrite using only: **HTML, CSS, JavaScript, Python, FastAPI, SQL** — no frontend frameworks, no ORM.

## Stack
- **Frontend**: plain HTML/CSS/JS pages under `public/` (login, dashboard, students, attendance/QR-scan, timetable, analytics, notifications).
- **Backend**: FastAPI (`api/`), talking to Postgres with raw SQL via `psycopg2` (no ORM).
- **Database**: Supabase Postgres (`sql/schema.sql`).
- **Auth**: real admin accounts in the `admins` table (bcrypt password hashes + JWT sessions). No hardcoded demo login baked into the code.

## Live deployment
- App: https://college-attendance-manager-opdarksoumya-6877s-projects.vercel.app
- API health check: `/api/health`

## Placeholder admin (replace this!)
```
email:    admin@example.com
password: ChangeMe123!
```
This was seeded directly into the `admins` table so you have something to log in with right away.
**Replace it** by running this SQL in the Supabase SQL editor (swap in your own email/password hash):
```sql
update admins
set email = 'you@yourcollege.edu',
    password_hash = '<bcrypt hash of your password>',
    name = 'Your Name'
where email = 'admin@example.com';
```
Generate a bcrypt hash with:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PASSWORD', bcrypt.gensalt()).decode())"
```

## Running locally
```bash
pip install -r requirements.txt
export DATABASE_URL="postgresql://<role>:<password>@<host>:5432/postgres?sslmode=require"
export JWT_SECRET="some-long-random-string"
uvicorn api.index:app --reload
# serve public/ with any static server, e.g.:
python3 -m http.server 5500 --directory public
```

## Project layout
```
api/                FastAPI backend (routers, db, auth)
public/             Static frontend (html/css/js)
sql/schema.sql       Database schema
requirements.txt    Python dependencies
vercel.json          Deployment config
```
