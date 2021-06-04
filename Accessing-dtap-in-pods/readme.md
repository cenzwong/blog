# Accessing dtap in pods

## What is DataTap?
(I want to find a better version of this graph showing kubernetes instead of EPIC, will you guys has that picture? if not, I will create my own.)
![image](https://user-images.githubusercontent.com/72959956/120766016-62296b00-c54c-11eb-9a2e-6d2ec90e0871.png)

Handling different protocol of files is always a pain for an data analyst. DataTap is a file system connector which aims to alleviate the pain developers had. DataTap provides HDFS protocol abstraction that allows big data applications like Spark to run unmodified with fast access to data sources other than HDFS, i.e. MapR-FS and NFS. Using DataTap, you can unify your code while the underlying data sources can be swap from HDFS, MapR-FS or NFS. This flexibility allows developers like you to focus more on coding rather than the infrastructure. More information of DataTap can be founded [here](https://docs.containerplatform.hpe.com/53/reference/kubernetes/tenant-project-administration/copy_About_DataTaps.html).

In this blog, I will introduce two ways to access DataTaps in Kubernetes. The first method will be accessing the DataTaps using HDFS Commands and the second method will be directly reading data from Apache Spark (using pyspark). Here we go.

1. [Hadoop FS Shell](#1-access-dtap-using-hadoop-fs-shell)
2. [Pyspark](#2-access-dtap-using-pyspark)

## **Enable dtap when creating the pod**
First and foremost, we have to enable DataTaps of the application. This can be done by ticking "Enable DataTap" box when creating the application.

![image](https://user-images.githubusercontent.com/72959956/119443704-9cc92180-bd5c-11eb-8fce-b6b53823336c.png)

This will result in mounting a lot of files at ```/opt/bdfs/``` of your pod. If you can see the files, shown below, in your pod, this means that your pod is DataTap enabled, and you are now ready to access the files in DataTap.

![image](https://user-images.githubusercontent.com/72959956/119444172-66d86d00-bd5d-11eb-8cfa-053b692963e5.png)

```
    <name>fs.dtap.impl</name>
    <value>com.bluedata.hadoop.bdfs.Bdfs</value>

    <name>fs.AbstractFileSystem.dtap.impl</name>
    <value>com.bluedata.hadoop.bdfs.BdAbstractFS</value>
```

# 1. Access dtap using hadoop fs shell
> ref: https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/FileSystemShell.html

## Install Hadoop
### Install the dependency
```
apt update && apt upgrade -y
apt install wget -y
```
### Install OpenJDK
```
# install openjdk # option: 6, 31
apt install openjdk-11-jdk-headless -y
```
### Download hadoop and untar hadoop
```
wget https://apache.website-solution.net/hadoop/common/hadoop-3.3.0/hadoop-3.3.0.tar.gz
tar zxf hadoop-*.tar.gz
mv hadoop-3.3.0 $HOME/hadoop
```
### Move directory to hadoop
```
cd hadoop
```
### Config the required environment
- $HADOOP_HOME/etc/hadoop/hadoop-env.sh
```
# this two to make hadoop command run successfully, line 54, 58, 126
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/
export HADOOP_HOME=$HOME/hadoop

# this command is datatap specific
export HADOOP_CLASSPATH=$HADOOP_CLASSPATH:$HADOOP_HOME/lib/:/opt/bdfs/bluedata-dtap.jar
```
- $HADOOP_HOME/etc/hadoop/core-site.xml 
```
<configuration>
  <property>
    <name>fs.dtap.impl</name>
    <value>com.bluedata.hadoop.bdfs.Bdfs</value>
  </property>

  <property>
    <name>fs.AbstractFileSystem.dtap.impl</name>
    <value>com.bluedata.hadoop.bdfs.BdAbstractFS</value>
  </property>

  <property>
    <name>fs.dtap.impl.disable.cache</name>
    <value>false</value>
  </property>
</configuration>
```
### or replace an online template
- https://github.com/helloezmeral/hpe-binary/tree/main/hadoop-dtap-config
## Testing command
```
pwd: $HADOOP_HOME
bin/hadoop
bin/hdfs dfs -ls dtap://TenantStorage/
hdfs dfs -mkdir dtap://TenantStorage/user
hdfs dfs -put helloworld.txt dtap://TenantStorage/cenz
hdfs dfs -put -f helloworld.txt dtap://TenantStorage/cenz # force replacement
hdfs dfs -cat dtap://TenantStorage/cenz/helloworld.txt
hdfs dfs -rm dtap://TenantStorage/cenz/helloworld.txt
```

## Notes:
- to get rid of the bin/, we can add the bin file to path
```
export HADOOP_HOME=$HOME/hadoop
export PATH=$PATH:$HADOOP_HOME:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
```

# 2. Access dtap using pyspark
## Install pyspark
There are lots of way to install Spark. For the most simplest purpose, I just do the
```bash
# install pyspark & Java
apt-get install python3 -y
apt-get install python3-pip -y
DEBIAN_FRONTEND=noninteractive apt-get install openjdk-11-jdk-headless -y
pip install pyspark
```
### Method one, initiate pyspark session with jars
```bash
# bash
pyspark --jars /opt/bdfs/bluedata-dtap.jar
```
![image](https://user-images.githubusercontent.com/72959956/120170783-e8d00680-c233-11eb-9fe8-136da9996fdc.png)

```py
# pyspark
sc._jsc.hadoopConfiguration().set('fs.dtap.impl', 'com.bluedata.hadoop.bdfs.Bdfs')
sc._jsc.hadoopConfiguration().set('fs.AbstractFileSystem.dtap.impl', 'com.bluedata.hadoop.bdfs.BdAbstractFS')
text = sc.textFile("dtap://TenantStorage/HPE.txt")
text.take(5)
```
![image](https://user-images.githubusercontent.com/72959956/120171213-61cf5e00-c234-11eb-8928-2514e8b867a8.png)

### Method two, initiate python and initiate pyspark with jars later
```bash
# bash
python3
```
```py
# python
from pyspark import SparkConf, SparkContext
conf = SparkConf().set("spark.jars", "/opt/bdfs/bluedata-dtap.jar")
sc = SparkContext( conf=conf)

sc._jsc.hadoopConfiguration().set('fs.dtap.impl', 'com.bluedata.hadoop.bdfs.Bdfs')
sc._jsc.hadoopConfiguration().set('fs.AbstractFileSystem.dtap.impl', 'com.bluedata.hadoop.bdfs.BdAbstractFS')
text = sc.textFile("dtap://TenantStorage/HPE.txt")
text.take(5)
```

> ref: https://github.com/delta-io/delta/issues/346
> https://spark.apache.org/docs/latest/configuration.html#runtime-environment

