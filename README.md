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

If you are running the server for the first time, setup the database with (if you are already running the server, stop it with `ctrl+c`):

    yarn prisma migrate reset

## Running the tests

To run the tests:

    yarn test

## Running Storybook

Storybook is used for developing and testing UI components in isolation. To run Storybook, you need to have it installed in your project. To run Storybook, use the following command:

```
yarn storybook
```
