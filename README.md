# FFC Demo Payment Orchestrator
Digital service mock for calculation engine

## Prerequisites

Either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name              | Description       | Required | Default     | Valid                     | Notes |
|-------------------|-------------------|:--------:|-------------|---------------------------|-------|
| NODE_ENV          | Node environment  | no       | development |development,test,production|       |
| PORT              | Port number       | no       | 3002        |                           |       |

## How to run tests

A convenience script is provided to run automated tests in a containerised environment. The test script will cleanup and build the project prior to running the tests.

```
./scripts/test
```

It should be straight forward for the end user to inspect the test scripts so they can call commands individually to avoid a build or cleanup.

A "test watch" compose file is also available, that will rerun the tests in the container when files are edited locally. This may be run via 
```
docker-compose -f docker-compose.yaml -f docker-compose.test.watch.yaml up --force-recreate ffc-ce-web
```

Alternatively, the same tests may be run locally via npm:

```
# Run tests without Docker
npm run test
```

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will rarely be a need to build images manually. However, this can be achieved through the Docker Compose [build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start and stop the service

Use Docker Compose to run service locally.

`docker-compose up`

Additional Docker Compose files are provided for scenarios such as linking to other running services.

Link to other services:
```
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```

### Test the service

The service binds to a port on the host machine so it can be tested manually by sending HTTP requests to the bound port using a tool such as [Postman](https://www.getpostman.com) or `curl`.

```
# Send a sample request to the /payment endpoint
curl -i --header "Content-Type: application/json" --request POST --data '{ "email": "test@email.com" }' http://localhost:3002/payment
```

Sample valid JSON for the `/payment` endpoint is:

```
{
  "email": "test@email.com"
}
```

### Link to sibling services

To test interactions with sibling services in the FFC demo application, it is necessary to connect each service to an external Docker network, along with shared dependencies such as message queues. The most convenient approach for this is to start the entire application stack from the [`mine-support-development`](https://github.com/DEFRA/mine-support-development) repository.

It is also possible to run a limited subset of the application stack, using the [`start`](./scripts/start) script's `--link` flag to join each service to the shared Docker network. See the [`mine-support-development`](https://github.com/DEFRA/mine-support-development) Readme for instructions.

### Deploy to Kubernetes

For production deployments, a helm chart is included in the `./helm/ffc-ce-payment-orchestrator` folder. This service connects to an AMQP 1.0 message broker, using credentials defined in [values.yaml](./helm/ffc-ce-payment-orchestrator/values.yaml), which must be made available prior to deployment.

Scripts are provided to test the Helm chart by deploying the service, along with an appropriate message broker, into the current Helm/Kubernetes context.

```
# Deploy to current Kubernetes context
scripts/helm/install

# Remove from current Kubernetes context
scripts/helm/delete
```

#### Accessing the pod

By default, the service is not exposed via an endpoint within Kubernetes.

Access may be granted by forwarding a local port to the deployed pod:

```
# Forward local port to the Kubernetes deployment
kubectl port-forward --namespace=ffc-ce deployment/ffc-ce-payment-orchestrator 3002:3002
```

Once the port is forwarded, the service can be accessed and tested in the same way as described in the "Test the service" section above.

## Dependency management

Dependencies should be managed within a container using the development image for the app. This will ensure that any packages with environment-specific variants are installed with the correct variant for the contained environment, rather than the host system which may differ between development and production.

The [`exec`](./scripts/exec) script is provided to run arbitrary commands, such as npm, in a running service container. If the service is not running when this script is called, it will be started for the duration of the command and then removed.

Since dependencies are installed into the container image, a full build should always be run immediately after any dependency change.

In development, the `node_modules` folder is mounted to a named volume. This volume must be removed in order for dependency changes to propagate from the rebuilt image into future instances of the app container. The [`start`](./scripts/start) script has a `--clean` (or `-c`) option  which will achieve this.

The following example will update all npm dependencies, rebuild the container image and replace running containers and volumes:

```
# Run the NPM update
scripts/exec npm update

# Rebuild and restart the service
scripts/start --clean
```


## Build pipeline

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)

### Testing a pull request

A PR can be tested by reconfiguring the user service to use the URL of the PR rather than the current release in the development cluster. Create a `patch.yaml` file containing the desired URL:

```
apiVersion: extensions/v1beta1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - env:
        - name: FFC_DEMO_USER_SERVICE
          value: http://ffc-ce-payment-orchestrator.ffc-ce-payment-orchestrator-pr2
        name: ffc-ce-payment-orchestrator
```

then apply the patch:

`kubectl patch deployment --namespace default ffc-ce-payment-orchestrator --patch "$(cat patch.yaml)"`

Once tested the patch can be rolled back, i.e.

`kubectl rollout undo --namespace default deployment/ffc-ce-payment-orchestrator`

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
