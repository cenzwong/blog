# Getting Started with MapR

## Filesystem
### Accessing via NFS Mount
```
mkdir /mapr


```

## list element in MapR
```curl
bin/hadoop
bin/hdfs dfs -ls dtap://TenantStorage/
bin/hdfs dfs -mkdir dtap://TenantStorage/user
bin/hdfs dfs -put helloworld.txt dtap://TenantStorage/cenz
bin/hdfs dfs -put -f helloworld.txt dtap://TenantStorage/cenz # force replacement
bin/hdfs dfs -cat dtap://TenantStorage/cenz/helloworld.txt
bin/hdfs dfs -rm dtap://TenantStorage/cenz/helloworld.txt
```
