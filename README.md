if error `MongoServerError[AlreadyInitialized]: already initialized` persists use
```
docker exec -it mongo mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```