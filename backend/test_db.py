import psycopg

conn = psycopg.connect(
    host="cts-hcc-db.cm1204aeqcwd.us-east-1.rds.amazonaws.com",
    port=5432,
    dbname="postgres",
    user="postgres",
    password="CTS_gn675"
)

print("✅ Connected to AWS RDS PostgreSQL!")

cur = conn.cursor()

cur.execute("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
""")

tables = cur.fetchall()

print("\n📋 Tables in AWS RDS:")
for table in tables:
    print(" -", table[0])

cur.close()
conn.close()