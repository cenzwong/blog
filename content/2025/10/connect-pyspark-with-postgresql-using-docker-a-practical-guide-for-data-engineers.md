---
title: "\U0001F680 Connect PySpark with PostgreSQL Using Docker — A Practical Guide for Data Engineers"
description: >-
  A step-by-step guide for Data Engineers to integrate PySpark and PostgreSQL
  locally using Docker.
date: '2025-10-22'
tags:
  - postgresql
  - docker
  - jdbc
  - PySpark
slug: >-
  connect-pyspark-with-postgresql-using-docker-a-practical-guide-for-data-engineers
author: Cenz Wong
---
**By Cenz Wong · Data Engineer**

Coedited with ChatGPT

## **🧠 Why Combine PySpark and PostgreSQL?**

PySpark excels at distributed data processing, while PostgreSQL is a powerful and reliable analytical database.

Connecting the two lets you:

* Ingest relational data into Spark for large-scale transformations
    
* Write back analytics results or model outputs to SQL tables
    
* Prototype ETL pipelines locally before deploying to production
    

In this guide, you’ll learn how to:

1. Launch a **PostgreSQL instance in Docker**
    
2. Connect it to **PySpark**
    
3. **Read** and **write** data between them
    

---

## **🐘 Step 1. Spin Up PostgreSQL in Docker**

First, make sure Docker is installed and running.

Run the following command in your terminal:

```plaintext
docker run -d \
  --name my_postgres \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  postgres:16
```

✅ This starts PostgreSQL 16 on your machine, exposing port 5432.

You can verify it with:

```plaintext
docker ps
```

Optional: create a sample table inside the container.

```plaintext
docker exec -it my_postgres psql -U myuser -d mydb
```

```plaintext
CREATE TABLE customers (id SERIAL PRIMARY KEY, name TEXT, country TEXT);
INSERT INTO customers (name, country) VALUES ('Alice', 'UK'), ('Bob', 'France');
SELECT * FROM customers;
```

---

## **⚙️ Step 2. Start PySpark and Load the PostgreSQL Driver**

Instead of manually downloading a JAR file, let Spark pull the **official PostgreSQL JDBC driver** from Maven automatically.

```plaintext
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("PostgresIntegrationDemo")
    .config("spark.jars.packages", "org.postgresql:postgresql:42.7.3")
    .getOrCreate()
)
```

This tells Spark to download and include the PostgreSQL driver at runtime.

---

## **📥 Step 3. Read Data from PostgreSQL**

Use the JDBC format to read any table or query:

```plaintext
df = (
    spark.read.format("jdbc")
    .option("url", "jdbc:postgresql://localhost:5432/mydb")
    .option("dbtable", "public.customers")
    .option("user", "myuser")
    .option("password", "mypassword")
    .option("driver", "org.postgresql.Driver")
    .load()
)

df.show()
```

💡 You should see the rows you inserted earlier.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1761142005934/3626ec5c-9726-4beb-8201-7e28a5660d37.png)

---

## **📤 Step 4. Write Data Back to PostgreSQL**

Let’s filter and save the results into a new table:

```plaintext
df_uk = df.filter(df.country == "UK")

(
    df_uk.write.format("jdbc")
    .option("url", "jdbc:postgresql://localhost:5432/mydb")
    .option("dbtable", "public.uk_customers")
    .option("user", "myuser")
    .option("password", "mypassword")
    .option("driver", "org.postgresql.Driver")
    .mode("overwrite")
    .save()
)
```

Check the result in psql:

```plaintext
SELECT * FROM uk_customers;
```

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1761142058503/10a97ccd-17b5-4077-bc5f-d03322a39824.png)

---

## **⚡ Step 5. (Optional) Tune for Large Tables**

If you’re working with millions of rows, enable parallel reads:

```python
df = (
    spark.read.format("jdbc")
    .option("url", "jdbc:postgresql://localhost:5432/mydb")
    .option("dbtable", "public.big_table")
    .option("user", "myuser")
    .option("password", "mypassword")
    .option("driver", "org.postgresql.Driver")
    .option("partitionColumn", "id")
    .option("lowerBound", 1)
    .option("upperBound", 100000)
    .option("numPartitions", 8)
    .load()
)
```

```python
df = (
    spark.read.format("jdbc")
    .option("url", "jdbc:postgresql://localhost:5432/mydb")
    .option("dbtable", "(SELECT * FROM public.customers WHERE country = 'UK') AS subset")
    .option("user", "myuser")
    .option("password", "mypassword")
    .option("driver", "org.postgresql.Driver")
    .option("partitionColumn", "id")
    .option("lowerBound", 10)
    .option("upperBound", 25000)
    .option("numPartitions", 8)
    .load()
)

df.show()
# +---+-----+-------+
# | id| name|country|
# +---+-----+-------+
# |  1|Alice|     UK|
# +---+-----+-------+
```

```python
df = (
    spark.read.format("jdbc")
    .option("url", "jdbc:postgresql://localhost:5432/mydb")
    .option("dbtable", "public.customers")
    .option("user", "myuser")
    .option("password", "mypassword")
    .option("driver", "org.postgresql.Driver")
    .option("pushDownPredicate", True)
    .load()
    .filter("country = 'UK'")
    # .filter(F.col("country") == "UK")
)

df.show()
# +---+-----+-------+
# | id| name|country|
# +---+-----+-------+
# |  1|Alice|     UK|
# +---+-----+-------+
```

This lets Spark fetch data in parallel, significantly improving performance.

### Notes

The partitionColumn, lowerBound, upperBound, and numPartitions options only work when:

1. The partitionColumn **exists in the table**, and
    
2. It’s **numeric** (integer, bigint, or decimal).
    

If id is not numeric (for example, UUID or text), or if your table doesn’t actually have values between 1 and 100000, Spark cannot split the range and will fail.

---

## **🧰 Bonus: Docker Compose Setup (Optional)**

If you want to manage PostgreSQL (and even pgAdmin) easily:

```plaintext
# docker-compose.yml
version: "3"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - ./data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
```

Run both:

```plaintext
docker compose up -d
```

Then visit [http://localhost:5050](http://localhost:5050) to open pgAdmin.

---

## **🎯 Conclusion**

You’ve now got:

* A **local PostgreSQL** instance running in Docker
    
* A **PySpark environment** connected via JDBC
    
* Full **read/write capability** between them
    

This setup is perfect for local ETL development, Spark SQL prototyping, and building pipelines before moving to production systems like AWS EMR or Databricks.

---

### **🧾 Example Repository Structure**

```plaintext
pyspark-postgres-demo/
│
├── docker-compose.yml
├── notebooks/
│   └── pyspark_postgres_demo.ipynb
└── requirements.txt
```

---
