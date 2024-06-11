Steps to run with Docker

docker buildx build . -t incompatibilityscenario-web:latest
docker run -d -p 4300:4300 --name incompatibilityscenario-web incompatibilityscenario-web:latest