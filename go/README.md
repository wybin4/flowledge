## Регистрация нового сервиса

```bash
cd new-service
go mod init github.com/wybin4/flowledge/go/new-service
```

## Сбилдить новый образ

```bash
& minikube -p minikube docker-env | Invoke-Expression
docker build -f gateway-service/Dockerfile -t gateway .
```

## Поднять

```bash
minikube image load confluentinc/cp-kafka:7.4.0
minikube image load confluentinc/cp-zookeeper:7.4.0
minikube image load provectuslabs/kafka-ui:latest
minikube image load mongo:latest
minikube image load osixia/openldap:1.5.0
minikube image load osixia/phpldapadmin:0.9.0

kubectl apply -f charts/zookeeper/
kubectl apply -f charts/kafka/
kubectl apply -f charts/mongo/
kubectl apply -f charts/policy/
kubectl apply -f charts/gateway/
kubectl apply -f charts/ldap/
kubectl apply -f charts/account/
kubectl apply -f charts/ingress.yaml
minikube tunnel
```

## Удалить

```bash
kubectl delete -f charts/gateway/
kubectl delete -f charts/kafka/
kubectl delete -f charts/zookeeper/
kubectl delete -f charts/mongo/
kubectl delete -f charts/policy/
kubectl delete -f charts/ldap/
kubectl delete -f charts/account/
kubectl delete -f charts/ingress.yaml
```

## Проверить

```bash
kubectl get pods
kubectl get svc
kubectl get statefulsets
kubectl get deployments
minikube ip
```

## Создать пользователя

```bash
kubectl exec -it ldap-0 -- bash -c 'cat > /tmp/newuser.ldif <<EOF
dn: uid=testuser,dc=example,dc=org
objectClass: inetOrgPerson
objectClass: organizationalPerson
objectClass: person
objectClass: top
cn: Test User
sn: User
uid: testuser
mail: testuser@example.org
userPassword: testpassword
EOF'
kubectl exec -it ldap-0 -- ldapadd -x -D "cn=admin,dc=example,dc=org" -w admin -f /tmp/newuser.ldif -H ldap://localhost:389
```