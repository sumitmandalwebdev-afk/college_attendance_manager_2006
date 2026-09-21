import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_conn():
    """Open a fresh connection to the Supabase Postgres database.

    A new connection per request is used because this API runs as a
    stateless serverless function; DATABASE_URL should point at Supabase's
    connection pooler (port 6543) so this stays cheap.
    """
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    conn.autocommit = True
    return conn


def fetch_all(query: str, params: tuple = ()):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def fetch_one(query: str, params: tuple = ()):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        conn.close()


def execute(query: str, params: tuple = ()):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
    finally:
        conn.close()
