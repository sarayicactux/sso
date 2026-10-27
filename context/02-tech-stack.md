# 02 — Tech Stack

## How to Use This Document

Versions below are the ranges declared in `backend/package.json`. Lockfile resolution can be newer inside the same major. Do not add a package unless the task says so.

## Runtime

| Item | Declared | Role |
|------|----------|------|
| Node types | `@types/node` ^20.3.1 | Typings only |
| TypeScript | ^6.0.0 | `target` ES2017, `module` CommonJS. `strictNullChecks: false`, `noImplicitAny: false`, `forceConsistentCasingInFileNames: false`, `noUnusedParameters: true` |
| NestJS | `@nestjs/common`, `core`, `platform-express` ^12.2.0 | HTTP application |
| Express | ^5.3.0 | Platform under Nest |
| gRPC | `@nestjs/microservices`, `@grpc/grpc-js`, `@grpc/proto-loader` | Hybrid gRPC on `GRPC_PORT` (User validate access) |

## Persistence

| Item | Declared | Role |
|------|----------|------|
| PostgreSQL driver | `pg` ^8.23.1 | Used by Prisma adapter |
| Prisma | `prisma` and `@prisma/client` ^7.10.1 | Schema and client |
| `@prisma/adapter-pg` | ^7.10.1 | Driver adapter. `PrismaService` passes `connectionString: process.env.DATABASE_URL` |
| Prisma config | `backend/prisma.config.ts` | Schema path `prisma/schema.prisma`. Datasource URL from `DATABASE_URL`. Migrations path `prisma/migrations` (directory not in the repo) |

Datasource block in `schema.prisma` has `provider = "postgresql"` and no inline URL. Prisma 7 reads the URL from `prisma.config.ts`.

Generator: `prisma-client-js`.

## Application libraries

| Package | Use in this repo |
|---------|------------------|
| `@nestjs/cqrs` ^12.1.1 | Commands, queries, `EventBus` |
| `@nestjs/event-emitter` ^12.0.1 | Registered in `EventsModule`. No listeners found |
| `@nestjs/config` ^12.0.1 | Global env file `.env` |
| `@nestjs/swagger` ^12.0.3 + `swagger-ui-express` | Document builder; UI only in `NODE_ENV=test` |
| `class-validator` ^0.15.1, `class-transformer` ^0.5.1 | DTO decorators. Global pipe does not enable `transform` |
| `bcrypt` ^6 and `bcryptjs` ^3 | Login and seed use `bcryptjs`. `bcrypt` is installed and unused by the auth path that was read |
| `jsonwebtoken` ^9 | `Jwt` helper |
| `axios` ^1.20.0 | SMS helpers (currently unreachable) |
| `moment` ^2.31.0 | Forget-password calls `now.diff(...)` and ignores the result |
| `helmet` ^8 | After custom headers in `main.ts` |
| `cookie-parser`, `express-session` | Parsed/session middleware. Login does not read the session |
| `dotenv` ^18 | `main.ts` calls `dotenv.config()` before Nest config |
| `md5` | Declared. No source usage confirmed in the modules that were read |
| `request-ip` | Declared. IP on login comes from `@IpAddress()` |
| `rxjs` | Nest peer |

## Tooling

| Script | Command |
|--------|---------|
| `start` / `start:dev` / `start:prod` | Nest start / watch / `node dist/main` |
| `build` | `nest build` |
| `build:schema` | `node prisma/combine.js && npx prisma format` |
| `start:dev-auto-migrate` | schema build + `prisma generate` + `prisma db push` + watch |
| `seed:admin`, `seed:user` | `ts-node` `src/shared/commands/seed-admin.ts` |
| `console` | `src/console.ts` (context bootstrap only, no task) |
| `test`, `test:e2e`, `test:cov` | Jest. No spec files in the repo |
| `lint` | ESLint `--fix` |

Package manager: README uses `npm`. No yarn/pnpm lock was confirmed as the project standard. Use the lockfile that already exists in `backend/` when installing.

## Environment variables (names only)

| Name | Consumer |
|------|----------|
| `DATABASE_URL` | `prisma.config.ts`, `PrismaService` |
| `APP_PORT` | `main.ts` `app.listen` |
| `GRPC_PORT` | `main.ts` gRPC microservice URL (`0.0.0.0:GRPC_PORT`) |
| `NODE_ENV` | Swagger UI gate (`test`) |
| `secretKey` | JWT sign/verify. Missing value throws `Missing env: secretKey` |
| `algorithm` | JWT algorithm. Default `HS256` |
| `expiresIn` | JWT default TTL string. Login and recover pass an explicit TTL and ignore this |
| `USERNAME`, `EMAIL`, `MOBILE`, `FIRST_NAME`, `LAST_NAME`, `PASSWORD` | `AdminService.seeder` |

Never write values of these variables into `context/`.

## TypeScript path

`tsconfig.json` maps `src/*` → `./src/*`. Feature code uses relative imports, not the alias. Follow relative imports.

## Vendored agent skills

`backend/.agents/skills/` and `backend/.windsurf/skills/` contain upstream Prisma skill packs (client API, upgrade, postgres). They are vendor docs, not this application's engineering rules. For ManualSSO work, follow `context/` and the code.
