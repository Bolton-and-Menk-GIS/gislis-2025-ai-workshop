# Build Weaviate Container

To build the locally hosted weaviate service in Docker, run:

```sh
mkdir -p ./weaviate/certs
openssl req -x509 -newkey rsa:4096 -keyout ./weaviate/certs/weaviate.key -out ./weaviate/certs/weaviate.crt -days 365 -nodes -subj "/CN=localhost"
docker-compose up --build -d
```

This should start up in `https://localhost:8443`: