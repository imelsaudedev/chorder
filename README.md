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

### 1. Main Suite (Unit, Integration, Storybook)
This suite verifies core logic, API integration, and component interactions.
```bash
yarn test
```

### 2. End-to-End Visual Regression (Playwright)
This suite verifies the application layout across different devices (Desktop, Tablet, Mobile).
```bash
yarn test:e2e
```

**Common Playwright Commands:**
- **Show Report**: `npx playwright show-report` (View visual diffs after failures)
- **Update Baselines**: `npx playwright test --update-snapshots` (Use when UI changes are intentional)
- **Run Specific Project**: `npx playwright test --project=desktop-chromium` (Projects: `desktop-chromium`, `tablet-ipad`, `mobile-iphone`)

## Running Storybook

Storybook is used for developing and testing UI components in isolation. To run Storybook, you need to have it installed in your project. To run Storybook, use the following command:

```
yarn storybook
```
