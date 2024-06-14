# Chorder

A song book based on [chordpro](https://www.chordpro.org/).

## Setup

### Installing dependencies

Dependencies:

- [Node.js](https://nodejs.org/en/download)
- [PNPM](https://pnpm.io/installation)

To install the dependencies, run:

```
pnpm install
```

### Setup Postgres

You will need PostgreSQL to run this project locally. The easiest way is to use Docker:

```
docker pull postgres
docker volume create postgres-data
docker run --name postgres-container -e POSTGRES_PASSWORD=SOME_PASSWORD -p 5432:5432 -v postgres-data:/var/lib/postgresql/data -d postgres
```

Now you have to run `psql`. Using Docker:

```
docker exec -it postgres-container psql -U postgres
```

Finally, initialize the database:

```
create database SOME_DB_NAME;
create user SOME_USERNAME with encrypted password 'SOME_PASSWORD';
grant all privileges on database SOME_DB_NAME to SOME_USERNAME;
\c SOME_DB_NAME postgres
GRANT ALL ON SCHEMA public TO SOME_USERNAME;
ALTER USER SOME_USERNAME CREATEDB;
\q
```

Create a `.env` file with the following:

```
POSTGRES_PRISMA_URL="postgresql://SOME_USERNAME:SOME_PASSWORD@localhost:5432/SOME_DB_NAME"
POSTGRES_URL_NON_POOLING="postgresql://SOME_USERNAME:SOME_PASSWORD@localhost:5432/SOME_DB_NAME"
```

#### Setup Prisma

To apply Prisma DB schema, run:

```
pnpm dbpush
```

### Running the server in development mode

Run the following command:

```
pnpm dev
```

#### Prisma Studio

[Prisma Studio](https://www.prisma.io/studio) is a useful tool to work with Prisma. You can run it with:

```
pnpm dbstudio
```

## Dev Container

### Setup

To install the dependencies, run:

```
pnpm install
```

> [!TIP]
> If you run into an error such as `no such file or directory` (I've had this on MacOS), try running:
> ```pnpm config set store-dir ~/.local/share/pnpm/store```
> Then, try to run `pnpm install` again.

Then, create (or modify) a file named `.env` in the root directory with the following content:

```
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@localhost:5432/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:5432/postgres"
```

Then, create the database with:

```
pnpm dbpush
```
