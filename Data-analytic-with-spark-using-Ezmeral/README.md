# Data Analytic with pySpark Using HPE Ezmeral Container Platform

PySpark is an interface for Apache Spark in Python. [Apache Spark](https://spark.apache.org/) is a unified analytics engine for big data processing. It allows developers to perform data processing on files in distributed filesystem, like Hadoop distributed filesystem or HPE Ezmeral Data Fabric (formerly known as MapR-XD). Setting up Spark environment is always a pain for data scientist. HPE Ezmeral Container Platorm is here for making your life easier. You can run Spark on a standalone pods or run on top a kubernetes cluster. Your way, your choice. In this blog, I will have a walk through to all of you to see how easy that is to run spark job with HPE Ezmeral Container Platform.

## Running Spark in Standalone Mode
First, we have to prepare our favorite Jupyter environment. Inside a tenant, navigate to Notebooks tab. You will see a Jupyter Kubedirector app prepared for you. After clicking the "Launch" button, you will need to configure the compute resource needed.
![image](https://user-images.githubusercontent.com/72959956/120459929-39c63300-c3cb-11eb-9e7a-65189f4367d3.png)
<!-- ![image](https://user-images.githubusercontent.com/72959956/120459957-4185d780-c3cb-11eb-8011-95e09ab7b9c3.png) -->
As you can see below, you have to specify the name of the notebook. In order to expand access to shared data by specifying a named path to a specified storage resource, click 'Enable DataTap' here.
![image](https://user-images.githubusercontent.com/72959956/120460214-801b9200-c3cb-11eb-94c0-e86bb70dad57.png)


![image](https://user-images.githubusercontent.com/72959956/120460537-cc66d200-c3cb-11eb-8410-3b7ec95051d5.png)
![image](https://user-images.githubusercontent.com/72959956/120460678-ea343700-c3cb-11eb-9aef-8afc9252d471.png)
![image](https://user-images.githubusercontent.com/72959956/120461217-67f84280-c3cc-11eb-9126-e69cacef4432.png)
![image](https://user-images.githubusercontent.com/72959956/120461299-76def500-c3cc-11eb-9857-5b760ef62e62.png)
![image](https://user-images.githubusercontent.com/72959956/120461869-fa98e180-c3cc-11eb-8a6f-72d91d29c102.png)


```
# jupyter
!hdfs dfs -ls dtap://TenantStorage/
!hdfs dfs -tail dtap://TenantStorage/enhanced_sur_covid_19_eng_.csv
```

# Into the pyspark
![image](https://user-images.githubusercontent.com/72959956/122021373-333ab100-cdf8-11eb-9e58-edbccf43f0b2.png)
![image](https://user-images.githubusercontent.com/72959956/122021431-3e8ddc80-cdf8-11eb-9c61-d9bd400a4c9b.png)
![image](https://user-images.githubusercontent.com/72959956/122021467-45b4ea80-cdf8-11eb-8ca4-ffc11c03f1ad.png)
![image](https://user-images.githubusercontent.com/72959956/122021502-4baacb80-cdf8-11eb-87d3-b29ef643b373.png)
![image](https://user-images.githubusercontent.com/72959956/122021550-56fdf700-cdf8-11eb-9c31-e0d171c7406e.png)
![image](https://user-images.githubusercontent.com/72959956/122021576-5ebd9b80-cdf8-11eb-9810-36d744560327.png)
![image](https://user-images.githubusercontent.com/72959956/122021616-667d4000-cdf8-11eb-8400-2dc03f4290f3.png)

## Possible Error
![image](https://user-images.githubusercontent.com/72959956/124234611-d6086480-db46-11eb-849e-7d4f7a8c35e4.png)
- Solution
### control it in notebook
```bash
# Grap the kubectl credential
kubectl hpecp refresh ez-gateway.hpeilab.com --insecure --hpecp-user=hpecli --hpecp-pass=hpecli
kubectl get pods --all-namespaces
kubectl get pods --namespace=poc-tenant
kubectl exec -it testnotebook-controller-6kq7r-0 --namespace=poc-tenant -- /bin/bash
```

### Using WebTerminal
```
# 1: exec into the pod
kubectl exec -it <pod name> -- /bin/bash
# 2: changed the access mode for the core-site.xml
chmod 666 /opt/bluedata/hadoop-2.8.5/etc/hadoop/core-site.xml
```
