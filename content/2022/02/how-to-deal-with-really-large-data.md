---
title: How to deal with really LARGE data?
description: >-
  In this blog, I would introduce methods for interacting with large data using
  Linux and Python.
date: '2022-02-17'
tags:
  - Linux
  - big-data
  - python3
  - pandas
  - distributed-system
slug: how-to-deal-with-really-large-data
author: Cenz Wong
cover: >-
  https://cdn.hashnode.com/res/hashnode/image/upload/v1645095427381/21kfDyRsX.png
---
With more and more companies being serious about their data, file sizes are now larger than they used to be. While most of our laptops still have 8GB of RAM, we get out of memory errors when we try to open files larger than memory. Instead of adding more memory to your system (or using a cloud service), we can have another way to deal with this situation.

Some people might be confused about these two terms:

> * \*\*Storage \*\* is refer to HDD/SSD
>     
> * \*\*Memory \*\* is refer to RAM
>     

In this blog, I would introduce methods for interacting with large data using Linux and Python.

# Environment Preparation

The dataset I used for this experiment is the [CORD-19 dataset](https://ai2-semanticscholar-cord-19.s3-us-west-2.amazonaws.com/historical_releases.html).

At this snapshot, the *cord\_19\_embeddings\_2022-02-07.csv* is around 13G and the environment I used has only 12G memory. You can check your computer memory configuration using `free -h`. And check the file size using `ls -lh`. Also check the disk size using `df -h`.

> Bonus: You could use `watch` to watch the changes from time to time.

All the code used is in the following Colab notebook:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1W3ZYipBjuB4MtKPbnwKTLs_qnsQS2_8_?usp=sharing)

# Handling with Linux Command

## GNU Coreutils

### Command: `cat`/`head`/`tail`/`more`/`less`

The Linux terminal has always been a powerful tool for working with files. It provides powerful command-line tools to manipulate files. The following commands are from GNU Coreutils, which you can find on almost every Linux system. When working with large files, GUI interface programs can have difficulty opening the file. In this case, command-line tools can come in handy.

| Command | Description |
| --- | --- |
| `cat myfile.csv` | View the entire file |
| `head/tail myfile.csv` | View the head/tail of the files |
| `more/less myfile.csv` | View the file page by page |

### Command: `split`

```bash
#!/bin/bash

# n x 14MB files
split cord_19_embeddings_2021-05-31.csv

# n x 1G files
split -b 1G cord_19_embeddings_2021-05-31.csv
```

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1644919628640/WHmlbWYfe.png)

The image above shows the result when you just run the command `split file.csv`. The file is actually a plain text file. You can still rename the files with extra extension and you can now open the `.csv` file with Excel. To make life easier, we can ask the tool to rename it for us. Just add some arguments as below:

```bash
#  n x 1G files with -Digit.csv as suffix
split -b 1G -d --additional-suffix=.csv cord_19_embeddings_2021-05-31.csv cord_19_embeddings
```

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1644920396704/aEBk8ETdq.png)

To fully understand the meaning of the argument, check the official documents: [Coreutil: Split a file into pieces.](https://www.gnu.org/software/coreutils/manual/html_node/split-invocation.html#split-invocation)

To count all the line of the csv files: `wc -l *.csv`

### For Windows User

I strongly recommend that you [install the ubuntu subsystem in Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install). If you want to stick with Microsoft, try exploring PowerShell or Batch scripting on Windows. After installing Linux Subsystem, in Windows run:

```plaintext
ubuntu run [your-linux-command]
```

> Additional Reading:
> 
> * [Working With Large Files in Linux](https://www.baeldung.com/linux/large-files)
>     

# Handling with Python

## Using Pandas

Our beloved [Pandas](https://pandas.pydata.org/) is the most popular data analysis tool. It is an open-source Python library based on the NumPy library. By nature, it is not supposed to handle such a large amount of data. Pandas is "well-known" for a certain design problem, like, Pandas is single-threaded. When dealing with datasets as large as the memory, it can be trickier to deal with.

Using chunking might be a way out. Chunking means that we do not load the entire data into memory. Instead, we want to load one part of the data, process it, then load another part, and so on. In the input argument to `pandas.read_csv()`, you can specify chunk size data at load time. Below is the performance comparison:

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1644934919514/lm9b_GBqY.png)

| Performance | W/o Chunk | w/ chunk |
| --- | --- | --- |
| Time | 264s | 223s |
| Peak Memory | 11127.07MiB | **432.77MiB** |
| Increment Memory | 10994.32MiB | **249.76MiB** |

The time required for running the query is almost the same because they are loading the same amount of data using a single thread. But when it comes to memory, it makes a big difference. The memory usage remains almost constant, which is manageable for us, and technically the data size can scale to infinity! The concept is just like doing stream processing.

`df_chunk` is an [iterator object](https://docs.python.org/3/library/stdtypes.html#iterator-types) which we can use other advance Python tools like [itertools](https://docs.python.org/3/library/itertools.html) to further speed up the process of analytics. Here I just simply use a `for` loop to process the result.

> Additional Reading:
> 
> * [Pandas: Scaling to large datasets](https://pandas.pydata.org/pandas-docs/stable/user_guide/scale.html)
>     
> * [Why and How to Use Pandas with Large Data](https://towardsdatascience.com/why-and-how-to-use-pandas-with-large-data-9594dda2ea4c)
>     
> * [Chunking Pandas](https://pythonspeed.com/articles/chunking-pandas/)
>     

## Using Dask

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1644937614705/0fK9Rdjlq.png)

Dask is an Open Source library for parallel computing written in Python. It is a dynamic task scheduler and a "big data" library that extend the capability of NumPy, Pandas. The design logic behind Dask would be by writing the task using high level collections with Python, and Dask will generate task graphs that can be executed by schedulers on a single machine or a cluster. As a result, Dask is a lazy evaluation language. We write our pipeline and run `.compute` to really execute the program. This ensures that some tasks can be executed in parallel.

![](https://docs.dask.org/en/latest/_images/dask-overview.svg)

The syntax of the Dask Dataframe is more or less the same as Pandas. The main difference would be importing Dask library with `import dask.dataframe as dd`, and running `.compute` to obtain the result. Friendly reminder, we should [avoid calling compute repeatedly](https://docs.dask.org/en/stable/best-practices.html#avoid-calling-compute-repeatedly).

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1644937783968/7rYGIEQMk.png)

| Performance | Loading CSV | Compute Sum | Filter Dataframe | Compute Both | | ----------- | ----------- | ----------- | | Time | 9s | 183.91s | 158.58s | 769s | | Peak Memory | 173.91 MiB | 792.21 MiB | 843.69 MiB | 846.09 MiB | | Increment Memory | 31.15 MiB | 618.10 MiB | 17.1 MiB | 74.87 MiB|

Loading csv is so fast because Dask only loads data when we need to get query results. There is some technique behind calculating the sum while filtering requires reading the entire data. That's why it takes more time to filter then to compute a sum. This is just the tip of the iceberg for using Dask, feel free to check out the [Dask Document](https://docs.dask.org/en/latest/).

# Explore the possibility

Usually, when dealing with large files, we harness the power of distributed computing. Like if we can load the file into [HDFS](https://hadoop.apache.org/), we can leverage the Hadoop ecosystem like [Apache Spark](https://spark.apache.org/) to process really big data. [Dask](https://dask.org/) provides `Dask.distributed` for distributed computing in Python. [Coiled](https://coiled.io/) provides extra cloud computing power for Dask users. [Ray](https://www.ray.io/) is a low-level framework for parallelizing Python code across processors or clusters. It is a relatively new package that many big players are adopting to using it. Ray has a managed cloud offering called [Anyscale](https://www.anyscale.com/)

I have summarized related topics into a mind map. The world is constantly changing, if you have any other exciting projects feel free to comment below and I'll add them to the mind map as well.

[![HPC@2x (1).png](https://cdn.hashnode.com/res/hashnode/image/upload/v1645365669294/jvlirJY5A.jpeg)](https://whimsical.com/hpc-6siHqXsWd89xtYs4hbEPVV)

> Additional Reading:
> 
> * [Is Spark Still Relevant: Spark vs Dask vs RAPIDS](https://www.youtube.com/watch?v=RRtqIagk93k)
>     
> * [Dask vs Spark | Dask as a Spark Replacement](https://coiled.io/blog/dask-as-a-spark-replacement/)
>     
> * [Computers are not as parallel as we think](https://coiled.io/blog/computers-are-not-as-parallel-as-we-think/)
>     

# Conclusion

It's not about which is the best. It's about which one is best for your situation. If you want to stick with pandas, try changing your code to take chunking. If you want to speed up your code, try exploring Dask as your processing engine. Try to understand the technology behind these packages and you'll know which one is right for your situation.

> Additional Reading:
> 
> * [Profiling and Optimizing Python Algorithms in Scientific Environments.](https://towardsdatascience.com/speed-up-jupyter-notebooks-20716cbe2025)
>     
> * [Optimized ways to Read Large CSVs in Python](https://medium.com/analytics-vidhya/optimized-ways-to-read-large-csvs-in-python-ab2b36a7914e)
>     
> * [12 Ways to Apply a Function to Each Row in Pandas DataFrame](http://scgupta.link/pandas-dataframe-apply)
>
