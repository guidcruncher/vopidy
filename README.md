# Vopidy

A nicer and friendlier Mopidy Music server clone in NodeJS, Vue and Typescript.

To run in development mode(Docker required)

```bash
mkdir ./vopidy
cd ./vopidy
git clone https://github.com/guidcruncher/vopidy.git .
bash ./dev.sh --build
```

It should be accessible on http://localhost:3004

```bash
docker network create --driver bridge --subnet 192.168.0.0/24 --gateway 192.168.0.1 vopidy_network
```
