# Accessing dtap in pods

> ref: https://docs.containerplatform.hpe.com/53/reference/kubernetes/tenant-project-administration/datataps/Accessing_DataTaps_in_Kubernetes_Pods.html



## **Enable dtap when creating the pod**
![image](https://user-images.githubusercontent.com/72959956/119443704-9cc92180-bd5c-11eb-8fce-b6b53823336c.png)\
Click the enable DataTap when creating KubeDirector Application
- a extra /opt/bdfs/* will be mounted
- ![image](https://user-images.githubusercontent.com/72959956/119444172-66d86d00-bd5d-11eb-8cfa-053b692963e5.png)


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
pip install pyspark
```
### Method one, initiate pyspark session with jars
```bash
pyspark --jars /opt/bdfs/bluedata-dtap.jar
```
```py
# pyspark
sc._jsc.hadoopConfiguration().set('fs.dtap.impl', 'com.bluedata.hadoop.bdfs.Bdfs')
sc._jsc.hadoopConfiguration().set('fs.AbstractFileSystem.dtap.impl', 'com.bluedata.hadoop.bdfs.BdAbstractFS')
text = sc.textFile("dtap://TenantStorage/HPE.txt")
text.take(5)
```

### Method two, initiate python and initiate pyspark with jars later
```bash
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



