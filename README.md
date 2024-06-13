# Learn elasticsearch

### Pull elasticsearch

```js
docker pull elasticsearch:8.14.1
```

### Run elasticsearch

```js
docker run -d --name elasticsearch --net somenetwork -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.http.ssl.enabled=false" -e "ELASTIC_PASSWORD=123456789" elasticsearch:8.14.1

```

### Using docker compose

```js
docker compose up
```
