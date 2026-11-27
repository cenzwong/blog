---
title: 'Connect PySpark with PostgreSQL Using Docker (Part 2: Advanced Tips & Tricks)'
description: >-
  Pro-level techniques for optimizing, securing, and scaling PySpark–PostgreSQL
  integrations.
date: '2025-10-22'
tags:
  - postgresql
  - docker
  - Data Engineering
  - PySpark
slug: connect-pyspark-with-postgresql-using-docker-part-2-advanced-tips-and-tricks
author: Cenz Wong
---
**By Cenz Wong · Data Engineer**

In [Part 1](./connect-pyspark-with-postgresql-using-docker-a-practical-guide-for-data-engineers.md), we set up a local PostgreSQL database using Docker and connected it to PySpark via JDBC.

Now, let’s take it further — with **advanced optimizations**, **performance tuning**, and **production-ready best practices** that real data engineers use in the field.

---

## **⚡️ 1. Use** `.option("pushDownPredicate", True)`

Let Spark **push filters and projections down** to PostgreSQL instead of reading the full table.

```python
df = (
    spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", "public.sales")
    .option("user", user)
    .option("password", password)
    .option("driver", "org.postgresql.Driver")
    .option("pushDownPredicate", True)
    .load()
    .filter("region = 'EU' and amount > 1000")
)
```

✅ PostgreSQL will handle the filtering — reducing data transferred to Spark.

---

## **🔢 2. Use Proper Partitioning Keys**

For parallel reads:

* Always use **integer or date** columns.
    
* Avoid text/UUIDs.
    
* Adjust numPartitions to match your Spark cluster.
    

You can even **auto-calculate bounds** before reading:

```python
import psycopg2

conn = psycopg2.connect("dbname=mydb user=myuser password=mypassword host=localhost")
cur = conn.cursor()
cur.execute("SELECT MIN(id), MAX(id) FROM public.sales")
lower, upper = cur.fetchone()
cur.close()
conn.close()

df = (
    spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", "public.sales")
    .option("user", user)
    .option("password", password)
    .option("driver", "org.postgresql.Driver")
    .option("partitionColumn", "id")
    .option("lowerBound", lower)
    .option("upperBound", upper)
    .option("numPartitions", 8)
    .load()
)
```

---

## **🧠 3. Replace** `dbtable` **with a SQL Query**

```python
query = "(SELECT id, region, SUM(amount) AS total FROM sales GROUP BY id, region) AS t"
df = (
    spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", query)
    .option("user", user)
    .option("password", password)
    .option("driver", "org.postgresql.Driver")
    .load()
)
```

✅ Spark treats your query output as a virtual table.

---

## **🧰 4. Add Connection Pool Options**

To prevent excessive connections and improve throughput:

```python
.option("fetchsize", 1000)
.option("batchsize", 500)
.option("isolationLevel", "READ_COMMITTED")
```

* fetchsize → how many rows PostgreSQL sends per batch
    
* batchsize → how many rows Spark writes per batch
    

---

## **🔒 5. Use Environment Variables for Secrets**

```python
import os

df = (
    spark.read.format("jdbc")
    .option("url", os.getenv("PG_URL"))
    .option("user", os.getenv("PG_USER"))
    .option("password", os.getenv("PG_PASS"))
    .option("driver", "org.postgresql.Driver")
    .load()
)
```

✅ Use .env files or Docker secrets — never hardcode credentials.

---

## **🪶 6. Write Modes & Savepoints**

When writing, always set .mode("append") or .mode("overwrite") intentionally.

```python
df.write.mode("append").jdbc(url=jdbc_url, table="public.output_table", properties=props)
```

For safety in production, wrap writes in **transactions**:

```python
BEGIN;
DELETE FROM public.output_table WHERE date = CURRENT_DATE;
INSERT INTO public.output_table SELECT * FROM staging_table;
COMMIT;
```

---

## **🧩 7. Use Views or Materialized Views**

Define PostgreSQL views for complex queries:

```python
CREATE VIEW v_active_customers AS
SELECT * FROM customers WHERE active = TRUE;
```

Then in Spark:

```python
.option("dbtable", "v_active_customers")
```

✅ Simplifies your Spark logic and centralizes SQL.

---

## **🔁 8. Cache Small Lookup Tables**

```python
lookup_df = (
    spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", "public.dim_country")
    .option("user", user)
    .option("password", password)
    .option("driver", "org.postgresql.Driver")
    .load()
    .cache()
)
```

✅ Reduces repeated database hits for small dimension tables.

---

## **🧾 9. Use properties for Cleaner Code**

```python
props = {
    "user": "myuser",
    "password": "mypassword",
    "driver": "org.postgresql.Driver",
    "fetchsize": "1000"
}

df = spark.read.jdbc("jdbc:postgresql://localhost:5432/mydb", "public.customers", properties=props)
```

---

## **☁️ 10. Cloud-Ready JDBC URLs**

When migrating to managed services like **AWS RDS** or **Azure Database**:

```python
jdbc_url = "jdbc:postgresql://my-rds-instance.us-east-1.rds.amazonaws.com:5432/mydb?sslmode=require"
```

✅ Same code, new target — completely portable.

---

## **🧩 11. Debug JDBC Connection Problems**

Enable verbose logging when Spark fails silently:

```python
spark.sparkContext.setLogLevel("DEBUG")
```

Or run with:

```python
export JAVA_OPTS="-Djavax.net.debug=all"
```

✅ Reveals SSL, JDBC, or authentication issues.

---

## **🎯 Summary Table**

| **Goal** | **Tip** |
| --- | --- |
| Optimize reads | Use pushDownPredicate, partitioning |
| Secure credentials | Use environment variables |
| Improve performance | Adjust fetchsize, batchsize |
| Debug errors | Enable Spark debug logs |
| Cleaner code | Use .jdbc() with properties dict |
| Reuse logic | Create PostgreSQL views or staging tables |

---

## **🚀 Conclusion**

By combining these techniques with the foundation from **Part 1**, you now have a truly production-ready, high-performance PySpark–PostgreSQL integration stack.
