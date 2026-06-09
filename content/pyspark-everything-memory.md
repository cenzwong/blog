---
title: "PySpark Executor Memory Tuning"
subtitle: "Architectural Sizing for Distributed Data Lakes"
description: "An in-depth architectural guide on how to perfectly tune Spark executor memory, cores, and instances to prevent OOM errors, disk spills, and thread contention."
date: 2026-06-15
tags: PySpark, BigData, Architecture, Performance, Memory
slug: pyspark-executor-memory-tuning
author: Cenz Wong & Gemini AI
---

## Architectural Baseline & Working Assumptions

Processing large-scale datasets (e.g., multi-terabyte Parquet tables) in Apache Spark often leads to critical resource exhaustion if the underlying executor topology is poorly tuned. Common symptoms include tasks spilling to disk, crippling garbage collection (GC) pauses, and Out-Of-Memory (OOM) failures.

Standard execution problems rarely stem from engine failure, but rather from inefficient allocation of cluster resources. Optimizing spark-submit parameters dictates whether a cluster scales linearly or collapses under its own communication overhead.

---

## 1. The Executor Topology and Resource Hierarchies

Executors are the foundational worker processes within a Spark cluster. Each executor is an isolated JVM responsible for:

1. **Tasks**: The smallest unit of execution, typically mapping to a single partition of data.
2. **Memory Space**: Allocations for caching dataframes, shuffle buffers, and execution memory.
3. **Compute Cores**: Threads available for parallel task execution.

### The "Fat Executor" Anti-Pattern

A frequent misconfiguration is attempting to assign all available node resources to a single executor (e.g., `--num-executors 20`, `--executor-cores 15`, `--executor-memory 60g`). This creates a "Fat Executor" topology.

**Architectural Drawbacks of Fat Executors:**
* **Single Point of Failure**: An OOM kill on a fat executor results in the loss of all concurrent tasks running on that node.
* **I/O Bottlenecks**: Underlying distributed file systems (like HDFS or S3) struggle to maintain throughput when serving 15+ concurrent threads from a single process.
* **Garbage Collection (GC) Thrashing**: Managing large 60GB JVM heaps results in massive "Stop-The-World" garbage collection pauses, which can severely delay execution and trigger network timeouts.

Conversely, deploying an excessive number of "Tiny Executors" (e.g., 1 core per executor) leads to massive inter-process communication (IPC) overhead and an inability to share broadcast variables effectively.

---

## 2. Mathematical Sizing: A Scenario Study

Consider a standard cluster configuration processing a 2TB Parquet dataset:
* **Nodes**: 20
* **Node Capacity**: 16 vCPUs, 64GB RAM

We must mathematically derive the optimal values for `--num-executors`, `--executor-cores`, and `--executor-memory`.

### Step 1: Resource Reservation (YARN / OS Overhead)

The operating system and cluster managers (like YARN or Kubernetes daemons) require dedicated resources. Failing to reserve these will cause system-level Out-Of-Memory (OOM) evictions.

* **Reserved Cores per Node**: $1$ core
* **Reserved RAM per Node**: $1$ GB
* **Usable Capacity per Node**: $15$ cores, $63$ GB RAM
* **Total Usable Cluster Capacity**: $300$ cores, $1,260$ GB RAM

### Step 2: Executor Core Sizing

The industry standard sweet spot for `--executor-cores` is **5 cores**.

* **Reasoning**: Allocating 4 to 6 cores per executor balances thread contention against optimal HDFS/S3 I/O throughput. It allows the executor to process multiple standard $128$ MB Parquet blocks concurrently without overwhelming the JVM context switching capabilities.

### Step 3: Executor Count Calculation

To determine the number of executors per node, we divide the usable node cores by our optimal core count:

$$ \text{Executors per node} = \frac{\text{Usable Cores per Node}}{\text{Cores per Executor}} = \frac{15}{5} = 3 $$

Consequently, the total number of executors across the cluster is:

$$ \text{Total Executors} = \text{Nodes} \times \text{Executors per Node} = 20 \times 3 = 60 $$

*Note: The identical result can be derived by dividing total usable cluster cores (300) by the cores per executor (5).*

### Step 4: Memory Allocation and Overhead

Memory must be distributed equally among the executors on each node.

$$ \text{Raw RAM per Executor} = \frac{\text{Usable RAM per Node}}{\text{Executors per Node}} = \frac{63 \text{ GB}}{3} = 21 \text{ GB} $$

Spark strictly enforces an off-heap memory overhead buffer (`spark.yarn.executor.memoryOverhead`), typically defaulted to $10\%$ of the executor memory or a minimum of $384$ MB.

* **Memory Overhead**: $21 \text{ GB} \times 0.10 \approx 2 \text{ GB}$ (Rounding up to $3$ GB for safety).
* **Usable Heap Memory**: $21 \text{ GB} - 3 \text{ GB} = 18 \text{ GB}$.

### The Optimal Configuration Matrix

Applying the mathematical derivations, the optimal submission configuration for this architecture is:

```bash
spark-submit \
  --num-executors 60 \
  --executor-cores 5 \
  --executor-memory 18g \
  --executor-memoryOverhead 3g \
  --driver-memory 4g \
  optimized_pipeline.py
```

---

## 3. Implementation and Execution Profiling

When applied correctly, this topology ensures $100\%$ cluster utilization. Assuming a standard $128$ MB Parquet block size, a $2$ TB dataset yields approximately $16,000$ partitions. With $300$ total active cores, the cluster will process the data in staggered execution waves, vastly outperforming untuned architectures.

### PySpark Implementation Context

```python
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("Architectural_Memory_Tuning")
    .config("spark.sql.files.maxPartitionBytes", "134217728") # 128MB
    .config("spark.sql.adaptive.enabled", "true") # Enable AQE
    .getOrCreate()
)

# Ingesting the highly-partitioned large dataset
df = spark.read.parquet("s3://data-lake/2tb-dataset/")

# Applying distributed transformations
result = df.groupBy("category").count()
result.write.mode("overwrite").parquet("s3://data-lake/output/")

spark.stop()
```

### Profiling Metrics

Post-execution, examining the Spark Web UI should reflect healthy baseline metrics:
* **Garbage Collection (GC) Time**: $< 1\%$ of total task time.
* **Executor Memory Utilization**: Stable at $\sim 75\%$ fraction.
* **Disk Spillage**: Zero bytes spilled during shuffle stages.

## Architectural Postscript: Dynamic Allocation

For volatile or shared cluster environments, manual tuning can be augmented with **Dynamic Allocation** (`spark.dynamicAllocation.enabled=true`). This allows Spark to horizontally scale the number of executors based on the current workload backlog, returning resources to the cluster manager when idle. However, the foundational rules regarding **cores per executor** and **memory per executor** remain strictly applicable to ensure the atomic scaling units are mathematically sound.
