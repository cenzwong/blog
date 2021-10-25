# Connecting k8s Services to HPE Ezmeral Gateway

Gateway (4): These hosts are also required. The Gateway hosts map both the IP address of the Controller host and the private IP endpoints of services running on the virtual nodes/containers inside the virtual clusters to publicly-accessible IP addresses/ports. 

![image](https://user-images.githubusercontent.com/72959956/138654527-77f3bf2c-f001-4fc7-88f3-d17436368dc3.png)

![image](https://user-images.githubusercontent.com/72959956/138656214-73c9418f-e291-4678-b3a2-c318a318d325.png)


# Create a Hello World Kubernetes Application
```
kubectl create deployment k8s-helloworld --image=gcr.io/google-samples/kubernetes-bootcamp:v1
kubectl get deployment -l app=k8s-helloworld
kubectl describe deployment k8s-helloworld

kubectl get pods -l app=k8s-helloworld
kubectl describe pods k8s-helloworld-5f84bb5d68-l9vch # copy your pod id
kubectl exec k8s-helloworld-5f84bb5d68-l9vch -- curl -s http://localhost:8080

kubectl exec k8s-helloworld-5f84bb5d68-l9vch -- env
kubectl exec --stdin --tty k8s-helloworld-5f84bb5d68-l9vch -- bash
kubectl exec --stdin --tty k8s-helloworld-5f84bb5d68-l9vch -- /bin/bash
```

# Exposing your application to your host temporay
```
kubectl port-forward k8s-bc-796df996dc-xsksf 9999:8080
curl http://localhost:9999 # on your terminal where you run port-forward
>> Hello Kubernetes bootcamp! | Running on: k8s-bc-796df996dc-xsksf | v=1
curl http://localhost:9999/api/v1/namespaces/default/pods/k8s-bc-796df996dc-xsksf/proxy/
```


```
kubectl expose deployment/k8s-helloworld --type="NodePort" --port 8080
# kubectl expose deployment/k8s-helloworld --type=LoadBalancer --name=k8s-helloworld-svc --port 8080
kubectl get svc -l app=k8s-helloworld

kubectl get services | grep k8s # you will find the eternal port
kubectl describe pods k8s-bc-796df996dc-xsksf # you will find the node name # ez-vm02.hpeilab.com

curl ez-vm02.hpeilab.com:31299 # also work in broswer
curl http://ez-vm02.hpeilab.com:31299/api/v1/namespaces/default/pods/k8s-bc-796df996dc-xsksf/proxy/
```
![image](https://user-images.githubusercontent.com/72959956/138665803-dea57cb9-1209-4b55-810a-5d564ea2b7e5.png)
```
kubectl scale deployments/k8s-helloworld --replicas=4
kubectl get pods -l app=k8s-helloworld
curl ez-vm02.hpeilab.com:31299 # also work in broswer
curl ez-vm02.hpeilab.com:31299 # will change different pods
```
![image](https://user-images.githubusercontent.com/72959956/138668470-ce8b6846-5fb4-4494-9a90-24aa2be73456.png)

```
# YAML, add 
hpecp.hpe.com/hpecp-internal-gateway: "true"
kubectl label service k8s-helloworld hpecp.hpe.com/hpecp-internal-gateway=true

http://ez-gateway.hpeilab.com:10014/
```
![image](https://user-images.githubusercontent.com/72959956/138668836-0313c1c5-e720-4575-a759-842c85d5502c.png)
![image](https://user-images.githubusercontent.com/72959956/138669273-fa2969b3-61f3-4bae-a2f6-66425daf0a7b.png)

```
# delete everything
kubectl delete services/kubernetes-bootcamp-$studentId
kubectl delete deployment/kubernetes-bootcamp-$studentId
```


# How to scale your application

# Using a Service to Expose Your App

# Map HPE Ezmeral Gateway to your Services
