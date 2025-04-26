default ldap credinatals username `cn=admin,dc=example,dc=org` password `admin`

load test ldap user from `test-user.ldif` 


```
docker cp test-user.ldif ldap-server:/test-user.ldif
docker exec -it ldap-server ldapadd -x -D "cn=admin,dc=example,dc=org" -w admin -f /test-user.ldif
```