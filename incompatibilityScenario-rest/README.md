Steps to run with Docker

docker buildx build . -t incompatibilityscenario-rest:latest
docker run -d -p 8080:8080 --name incompatibilityscenario-rest incompatibilityscenario-rest:latest