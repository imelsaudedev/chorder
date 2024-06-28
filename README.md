# Chorder

A song book based on [chordpro](https://www.chordpro.org/).

## Dev Container

This project is setup to be run on vscode with [dev containers](https://code.visualstudio.com/docs/devcontainers/containers). To setup dev containers, follow [this guide](https://code.visualstudio.com/docs/devcontainers/containers) and then open this folder using the dev container extension.

## Running the local server for development

Run the following command:

```
yarn dev
```

### Running for the first time

If you are running the server for the first time, add some initial data with (if you are already running the server, stop it with `ctrl+c`):

    yarn add-initial-data

Also, it is nice to have some data validation, so run:

    mongosh --file mongosh/setup-schemas.js

## Debugging the database

If you are using our devcontainer on vscode, you should have the MongoDB extension enabled. You can connect to the database for debugging by creating a connection using the connection string (probably `mongodb://localhost:27017/`).

## Running the tests

To run the tests:

    yarn test
