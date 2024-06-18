# Chorder

A song book based on [chordpro](https://www.chordpro.org/).

## Dev Container

This project is setup to be run on vscode with [dev containers](https://code.visualstudio.com/docs/devcontainers/containers). To setup dev containers, follow [this guide](https://code.visualstudio.com/docs/devcontainers/containers) and then open this folder using the dev container extension.

## Setup

To install the dependencies, run:

```
yarn
```

Then, create the database with:

```
yarn dbpush
```

## Running the server in development mode

Run the following command:

```
yarn dev
```

### Prisma Studio

[Prisma Studio](https://www.prisma.io/studio) is a useful tool to work with Prisma. You can run it with:

```
yarn dbstudio
```
