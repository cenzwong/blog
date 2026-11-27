---
title: Type Casting Like a Data Sorcerer in PySpark
description: Tame messy data in PySpark! Master data type casting & ensure data integrity.
date: '2024-04-07'
tags:
  - Python
  - types
  - type-casting
  - datatypes
  - PySpark
  - databricks
slug: type-casting-like-a-data-sorcerer-in-pyspark
author: Cenz Wong
cover: >-
  https://cdn.hashnode.com/res/hashnode/image/upload/v1712451378295/0708c0a1-ef58-4524-b837-e7c794c2c9a0.png
---
Data types are a fundamental aspect of any data processing work, and PySpark offers robust solutions for handling them. When working with PySpark, data type conversion is a common task, and understanding the difference of each approach is key to efficient data manipulation. This blog post will explore the three primary methods of type conversion in PySpark: **column** level, **functions** level, and **dataframe** level, providing insights into when and how to use each one effectively.

> 💻 [Code used in this Blog](https://colab.research.google.com/drive/15DmzhloHINpuC9T3snYmF3XFXnSF8ARH?usp=sharing)

| Functions name (version) | Description |
| --- | --- |
| `Column.cast` (v1.3+) | Casts the column into type `dataType`. |
| `Column.astype` (v1.4+) | `astype()`[is an al](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.Column.astype.html?highlight=column%20astype#pyspark.sql.Column.astype)ias for `cast()`. |
| `Functions.to_date` (v2.2+) | Converts a `Column` into `DateType` using the optionally specified format. |
| `Functions.to_timestamp` (v2.2+) | Converts a `Column` into `DateType` using the optionally specified format. |
| `Functions.try_to_timestamp`(v3.5+) | Parses the <cite>col</cite> with the <cite>format</cite> to a timestamp. The function always returns null on an invalid input with/without ANSI SQL mode enabled. |
| `Functions.to_number` (v3.5+) | Convert string ‘col’ to a number based on the string format ‘format’. Throws an exception if the conversion fails. |
| `Functions.try_to_number` (v3.5+) | Convert string ‘col’ to a number based on the string format <cite>format</cite>. Returns NULL if the string ‘col’ does not match the expected format. |
| `DataFrame.to` (v3.4+) | Returns a new `DataFrame` whereh row is reconciled to match the specified schema. |

This is the example code on how to use the above functions:

```python
from pyspark.sql import functions as F, types as T

sdf = spark.createDataFrame([
    (123,),
], ["number"])

# Columns: cast()
sdf.withColumn("number", F.col("number").cast("long")).show()
sdf.withColumn("number", F.col("number").cast(T.LongType())).show()

# Functions: to_xyz() / try_to_xyz()
sdf.withColumn("number", F.to_number("number", F.lit("9"*3))).show()

# DataFrame: to()
to_schema = T.StructType([T.StructField("number", T.LongType())])
sdf.to(to_schema).show()
```

Life is far from perfect, and data often comes in messy and unstructured forms. For instance, numbers might be stored as text, and dates could appear in various formats. The ability to navigate and rectify these discrepancies is what distinguishes a competent Data Engineer. Careful planning and execution of data type conversions are crucial; without them, one risks obtaining incorrect results, which may go unnoticed until it’s too late.

# Task One: Convert String Number to Number

* We want to convert the string into a 10 digit number (Decimal Type)
    

```python
# Sample code to perform convertion
F.to_number("string_nbr", F.lit("9"*10))
F.try_to_number("string_nbr", F.lit("9"*10))
F.col("string_nbr").cast(T.DecimalType(10,0))
```

The table below outlines the behaviour of three different functions—`to_number`, `try_to_number`, and `cast`—when attempting to convert various string inputs into a numeric (Decimal) data type:

| from \\ to | to\_number | try\_to\_number | cast |
| --- | --- | --- | --- |
| "1234567890" | ✔ | ✔ | ✔ |
| "12345678901" (overflow) | 🚫 | `Null` | `Null` |
| "OneTwoThree" (non-numeric) | 🚫 | `Null` | `Null` |
| "" (Empty String) | 🚫 | 🚫 | `Null` |
| Null | `Null` | `Null` | `Null` |

* **“1234567890”**: This is a valid 10-digit number. All functions (`to_number`, `try_to_number`, and `cast`) successfully convert the string to a number.
    
* **“12345678901” (Overflow)**: This string represents a number that exceeds the maximum length for a 10-digit number, causing an overflow. The `to_number` function results in an error, while `try_to_number` and `cast` return `Null`, indicating that the conversion failed without throwing an error.
    
* **Null**: Returns `null` for all three functions
    
* **“OneTwoThree” (Random Text)**: This string contains non-numeric characters and cannot be converted into a number. The `to_number` function results in an error due to invalid input, while `try_to_number` and `cast` return `Null`, again indicating a failed conversion without an error.
    
* **“” (Empty String)**: Similar to the previous empty string case, but here, `to_number` and `try_to_number` both result in an error, while `cast` returns `Null`.
    

# Task Two: Downcast Number to Number

Whether intentional or not, downcasting a number to a short integer type requires caution. It’s essential to verify that all values fall within the permissible range before proceeding with the cast. Failure to do so could lead to data loss or unexpected behavior due to values exceeding the boundaries of a short integer.

```python
# Sample code to perform convertion
sdf.withColumn("nbr", F.col("nbr").cast(T.ShortType()))
sdf.to(T.StructType([T.StructField("nbr", T.ShortType())]))
```

| from \\ to | <s>to_number</s> | cast | to |
| --- | --- | --- | --- |
| 32767 | <s>✔ (decimal only)</s> | ✔ | ✔ |
| 32768 (overflow) | <s>✔ (decimal only)</s> | 💥 `-32768` | 🚫 |

If you are using cast, it will create a incorrect record without notifying you. And this issue would burry deep in the code. No one would knows it until you really take a look on the visual table.

* **32767**: This value is within the range of a 16-bit/2-byte signed integer (`-32768` to `32767`), so casting it to a type short integer is successful, indicated by `✔`.
    
* **32768 - overflow**: This value is just outside the range of a 16-bit signed integer (which has a maximum value of 32767). Attempting to cast it to a type with a smaller maximum value results in an overflow, indicated by `💥`. The overflow causes the number to wrap around to the minimum value for a 16-bit signed integer, which is `-32768`, without generating an error, thus remaining unnoticed. Using `to` could throw a error to warn us.
    

> 🔴 You could change the `cast` behaviour by setting `spark.sql.ansi.enable` to `true`
> 
> * overflow/malformed casting is not allowed
>     
> 
> ```python
> spark.conf.set("spark.sql.ansi.enabled", "true") # default is false
> ```
> 
> Visit [ANSI compliance in Databricks Runtime | Databricks on AWS](https://docs.databricks.com/en/sql/language-manual/sql-ref-ansi-compliance.html) for details

# Conclusion

It’s crucial to remember that each function behaves differently when converting strings to numeric types. A comprehensive understanding of these behaviors is necessary to prevent workflow disruptions and vulnerabilities. For instance, the functions `to_number`, `try_to_number`, and `cast` exhibit distinct behaviors when dealing with valid numbers, overflows, nulls, non-numeric text, and empty strings. Particularly with downcasting, one must ensure all values are within the acceptable range to avoid data loss or unexpected outcomes.

To safeguard against silent errors and maintain data integrity, always verify the behavior of conversion functions against every possible input. An unexamined cast could embed errors deep within your code, remaining hidden until visual inspection reveals them. By setting `spark.sql.ansi.enabled` to true, you can alter the casting behavior to disallow overflows and malformed casting, adding an extra layer of protection to your data engineering processes.

Remember, the key to successful data type management in PySpark is to know your data, understand the context of your analysis, and apply the right conversion method accordingly. Happy data processing!

> Reference:
> 
> * [Data Types — PySpark master documentation (apache.org)](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/data_types.html)
>     
> * [Data Types - Spark 3.5.1 Documentation (apache.org)](https://spark.apache.org/docs/latest/sql-ref-datatypes.html#)
>     
> * [Data types | Databricks on AWS](https://docs.databricks.com/en/sql/language-manual/sql-ref-datatypes.html#language-python)
>     

---

If you have any questions or feedback, feel free to leave a comment below or send me a message on LinkedIn! 📩. Happy coding! 😊

[![](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/cenzwong/)
