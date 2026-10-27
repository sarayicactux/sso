# 08 — Coding Rules

## How to Use This Document

Process, planning, and verification are mandatory in [12-engineering-rules.md](12-engineering-rules.md). This file is the Nest/Prisma coding conventions layer. Classes:

- **Mandatory** — break this and the change is wrong for this repo
- **Established** — what the current code already does
- **Recommended** — do this on new code; do not mass-rewrite old code to match

## Process

| Rule | Class |
|------|-------|
| Follow [12-engineering-rules.md](12-engineering-rules.md) for understand-before-change, MCP, plans, and final review | Mandatory |
| Read the relevant `context/` file and the nearest existing feature before editing | Mandatory |
| Use codebase-memory-mcp MCP (`user-codebase-memory-mcp`) for structure before wide file reads. Re-index after structural edits | Mandatory when the server is connected |
| Smallest change that completes the task. No drive-by renames | Mandatory |
| Do not add a dependency without an explicit request | Mandatory |
| Do not implement `App` HTTP by repairing the admin copy under `modules/app`. Build the missing application/infrastructure pieces from the domain interfaces | Mandatory |
| Prefer source over this document when they disagree, then fix the document | Mandatory |
| New business rules stay on the server (service + DTO validation + `@Admin` where the route is protected) | Mandatory |

## TypeScript and Nest

| Rule | Class |
|------|-------|
| Stay on Nest 12 modules, controllers, providers | Established |
| `strictNullChecks` and `noImplicitAny` are off. Explicit types on public DTO and interface fields anyway | Established |
| `noUnusedParameters` is on. Do not leave unused constructor params | Mandatory |
| Import path casing must match the filename | Mandatory for new files |
| Relative imports, matching neighbors. Do not introduce a new path-alias style | Established |
| Keep controllers thin | Established |
| One feature module per folder under `src/modules` | Established |

## Naming

| Artifact | Convention | Class |
|----------|------------|-------|
| Feature folder | lower camel or single word: `admin`, `media`, `app` | Established |
| Nest class | `AdminModule`, `AdminController`, `AdminService`, `AdminRepository` | Established |
| Domain contract | same name + `Impl`: `AdminServiceImpl` | Established |
| Command | verb + aggregate: `CreateAdminCommand` | Established |
| Files | `createAdmin.command.ts` next to `createAdmin.handler.ts` | Established |
| Prisma model | PascalCase model, `@@map` snake plural: `Admin` → `admins` | Established |
| Do not rename `SmsRq`, `pathes`, or `secoundDepartments` unless the task is a rename | Mandatory |

## Modules and DI

- Register providers in the feature module. Export the repository and application service when another module needs them.
- Import the feature module from `src/app.module.ts` only when the API should be live.
- Inject `CommandBus`, `QueryBus`, mapper, `Jwt`, and `Tools` into the application service.
- Inject the repository into the handler.
- **Recommended:** import `PrismaModule` and inject `PrismaService`. **Established (avoid copying):** `new PrismaService()` inside decorators, and listing `PrismaService` again in every feature `providers` array.
- `Tools` must be injected so `EventBus` exists. `saveLogs` on a manually constructed `Tools` has no bus.

## DTOs and validation

| Rule | Class |
|------|-------|
| Request classes use `class-validator` and live in `presentation/dtos` | Established |
| Request DTO `implements` the domain interface | Established |
| `@ApiProperty` on fields that Swagger must show | Established |
| Global `ValidationPipe` has default options. It does not strip unknown fields and does not transform types | Verified |
| Do not rely on pipe `transform: true` unless you set it on that route | Mandatory |
| `MobilePipe` and `CodePipe` are extra checks. They return the original body. They do not coerce `+989` to `09` ( `Tools.validateMobile` does, and the pipes do not call it) | Verified |
| Response mapping goes through the mapper (`toAdminDto`, `mediaObject`, `toAppDto`) | Established |

## Errors

**Established:**

```ts
throw new HttpException(
  { status: HttpStatus.FORBIDDEN, error: 'اطلاعات ورود نا معتبر است' },
  HttpStatus.FORBIDDEN,
);
```

- User-facing `error` strings that already exist are Persian. Keep that for admin and media flows.
- Some recover/login failures use English tokens (`FORBIDDEN_HEARED`, `FORBIDDEN_token_not_valid`). Match the neighboring message of the use case you are editing.
- Re-throw in the controller `catch`. Do not swallow.
- Do not put stack traces, JWT secrets, or password hashes in the body.
- Media upload replaces the original error with `BAD_REQUEST`.

## Logging and secrets

| Rule | Class |
|------|-------|
| Never commit real `.env` values. Never paste them into `context/` | Mandatory |
| Never copy the session secret from `main.ts` or the SMS API key literal from `tools.helper.ts` | Mandatory |
| Do not log OTP codes, passwords, or full JWTs | Mandatory |
| `LoggingMiddleware` logs method, URL, status, size, and duration for 200/201/304 | Established |
| Audit rows go through `Tools.saveLogs` | Established for media. Recommended for new writes |

## Async

- `async/await` on bus and repository calls.
- **Recommended:** do not copy `MediaService` fire-and-forget `fs.mkdir` / `fs.copyFile`. Await filesystem work before inserting the media row so a failed copy does not leave a database URL.

## Configuration

- Read configuration from `process.env` via the names in [02-tech-stack.md](02-tech-stack.md).
- Paths and public URLs live in `shared/config/pathes.ts`. Change them there, not inline in controllers.
- JWT secret is `secretKey`. Missing secret throws on sign.

## Security and authorization

| Rule | Class |
|------|-------|
| Protected routes take `@Admin({ operationId })` even though `operationId` is not enforced yet | Established |
| Pass the Swagger `operationId` string so a future RBAC check has a stable id | Recommended |
| Public auth routes stay public: login, forgetPass, recoverPass | Established |
| Compare passwords only with `bcryptjs` (`bcrypt.compare` / `bcrypt.hash`) | Established |
| Store the JWT in `admin_tokens` on login and delete that row on logout | Established |
| Do not trust `ownerId` from the client on upload. Media service sets `ownerId: null` | Established |
| Helmet is enabled. Custom CORS headers also set `Access-Control-Allow-Origin: *` together with `credentials: true`. Do not widen this further | Established |

## OTP and SMS

`Tools.codeCreator` returns `1234`. `sendSmsCode` returns before the HTTP request. New password-reset work must not assume a real SMS was sent. Changing that behavior is a product decision: wire a real code and a real send, and remove the hardcoded key from source.

## Data and Prisma

Follow [09-query-dataAccess-rules.md](09-query-dataAccess-rules.md). Short form:

- New columns go in `infrastructure/models/*.prisma`, then `npm run build:schema`, `prisma generate`, and `db push` when the task includes applying the schema.
- Do not hand-edit `schema.prisma` as the lasting source.
- Do not `build:schema` while `app.prisma` is invalid.
- Repository methods return the row cast to the entity. Mappers build DTOs.
- Writes that must succeed together use `prisma.$transaction`.

## HTTP

Follow [10-api-design.md](10-api-design.md) and [11-api-documentation.md](11-api-documentation.md).

- No global prefix. Controller path is the public path (`admins`, `medias`).
- `@HttpCode(HttpStatus.OK)` is used even for creates.
- Boolean routes return `true`.

## Tests

Per [12-engineering-rules.md](12-engineering-rules.md) §14: **do not create test files** for this project unless the user explicitly asks. Do not add `*.spec.ts` / e2e suites by default. Verify with build and API behavior instead.

## Disabled code

Leave commented unless the task enables it: `LeakyService`, `NotFoundFilter`, Firebase send, CryptoJS helpers, `FileTypeValidator`. Do not register `LeakyService`.

## Comments and style

Match the surrounding file. Do not add a comment that restates the code. Do not reformat an entire file while changing one method.
