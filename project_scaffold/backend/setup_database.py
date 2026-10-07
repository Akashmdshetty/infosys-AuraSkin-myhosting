import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

password = os.getenv("POSTGRES_PASSWORD", "aakashshetty112233")
host = os.getenv("POSTGRES_HOST", "localhost")
port = int(os.getenv("POSTGRES_PORT", 5432))
target_db = os.getenv("POSTGRES_DB", "skincare_db")

# Connect to default 'postgres' database
conn = psycopg2.connect(dbname="postgres", user="postgres", password=password, host=host, port=port)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
exists = cur.fetchone()
if not exists:
    cur.execute(f'CREATE DATABASE "{target_db}"')
    print(f"Database '{target_db}' created successfully.")
else:
    print(f"Database '{target_db}' already exists.")

cur.close()
conn.close()
