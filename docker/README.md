default ldap credinatals username `cn=admin,dc=example,dc=org` password `admin`

load test ldap user from `test-user.ldif` 

```
docker cp test-user.ldif ldap-server:/test-user.ldif
docker exec -it ldap-server ldapadd -x -D "cn=admin,dc=example,dc=org" -w admin -f /test-user.ldif
```

search all entries

```
docker exec -it ldap-server ldapsearch -x -H ldap://localhost:389 -b "dc=example,dc=org" -D "cn=admin,dc=example,dc=org" -w admin
```

load test group with testuser member from `group.ldif`

```
docker cp group.ldif ldap-server:/group.ldif
docker exec -it ldap-server ldapadd -x -H ldap://localhost:389 -D "cn=admin,dc=example,dc=org" -w admin -f group.ldif
```
