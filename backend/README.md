## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# init prisma
$ npx prisma init

# create schemas from models
$ npm run build:schema

# generate prisma client
$ npx prisma generate

# push to database
$ npx prisma db push

# force to update database
$ npx prisma db push --accept-data-loss

# create first role and user
$ npm run seed:user

# development
$ npm run start

# watch mode
$ npm run start:dev

# access to swagger

$ http://domain.com/api/#/

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
