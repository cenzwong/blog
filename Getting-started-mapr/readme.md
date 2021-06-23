# Getting Started with MapR

## Filesystem
### Accessing via NFS Mount
```
mkdir /mapr
showmount -e 172.16.11.74
# Export list for 172.16.11.74:
# /mapr               *
# /mapr/demo.mapr.com *
sudo mount -t nfs 172.16.11.74:/mapr /mapr
```
### Accessing via Hadoop command
```

```
## HPE Ezmeral DataFabric Database
### Installing MapR-client
```
# or add 'deb https://abc' to /etc/apt/source.list 
sudo add-apt-repository 'deb https://package.mapr.com/releases/v6.2.0/ubuntu mapr optional'
sudo add-apt-repository 'deb https://package.mapr.com/releases/MEP/MEP-7.1/ubuntu binary trusty'
sudo apt update
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
