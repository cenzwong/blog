# Connecting k8s Services to HPE Ezmeral Gateway

Gateway (4): These hosts are also required. The Gateway hosts map both the IP address of the Controller host and the private IP endpoints of services running on the virtual nodes/containers inside the virtual clusters to publicly-accessible IP addresses/ports. 

# Create a Hello World Kubernetes Application
```
kubectl create deployment k8s-helloworld --image=gcr.io/google-samples/kubernetes-bootcamp:v1

kubectl describe pods k8s-helloworld-796df996dc-xsksf
kubectl exec k8s-helloworld-796df996dc-xsksf -- curl -s http://localhost:8080

kubectl exec $POD_NAME -- env
kubectl exec --stdin --tty kubernetes-bootcamp-student1076-6c69d77744-c87ff -- bash
kubectl exec --stdin --tty kubernetes-bootcamp-student1076-6c69d77744-c87ff -- /bin/bash



kubectl port-forward k8s-bc-796df996dc-xsksf 9999:8080
curl http://localhost:9999 # on your terminal where you run port-forward
>> Hello Kubernetes bootcamp! | Running on: k8s-bc-796df996dc-xsksf | v=1
curl http://localhost:9999/api/v1/namespaces/default/pods/k8s-bc-796df996dc-xsksf/proxy/




kubectl expose deployment/k8s-bc --type="NodePort" --port 8080

kubectl get services | grep k8s # you will find the eternal port
kubectl describe pods k8s-bc-796df996dc-xsksf # you will find the node name # ez-vm02.hpeilab.com

curl ez-vm02.hpeilab.com:31299 # also work in broswer
curl http://ez-vm02.hpeilab.com:31299/api/v1/namespaces/default/pods/k8s-bc-796df996dc-xsksf/proxy/



kubectl scale deployments/k8s-bc --replicas=4
kubectl get pods -l app=k8s-bc
curl ez-vm02.hpeilab.com:31299 # also work in broswer
curl ez-vm02.hpeilab.com:31299 # will change different pods

# YAML, add 
hpecp.hpe.com/hpecp-internal-gateway: "true"
kubectl label service k8s-bc hpecp.hpe.com/hpecp-internal-gateway=true

http://ez-gateway.hpeilab.com:10014/



# delete everything
kubectl delete services/kubernetes-bootcamp-$studentId
kubectl delete deployment/kubernetes-bootcamp-$studentId
```


# How to scale your application

# Using a Service to Expose Your App

# Map HPE Ezmeral Gateway to your Services
