# 07 — CQRS Rules

## How to Use This Document

This project **uses** `@nestjs/cqrs`. Follow the existing command, query, and event split. Do not add a second bus, a custom mediator, or sagas.

## Status

| Item | Result | Evidence |
|------|--------|----------|
| `@nestjs/cqrs` | Dependency ^12.1.1 | `backend/package.json` |
| `CqrsModule` | Imported by `AdminModule` and `MediaModule` | feature `*.module.ts` |
| Command bus | Application services call `commandBus.execute` | `AdminService`, `MediaService` |
| Query bus | Application services call `queryBus.execute` | same |
| Event bus | `Tools.saveLogs` calls `eventBus.publish` | `tools.helper.ts` |
| Handlers | `@CommandHandler`, `@QueryHandler`, `@EventsHandler` | `application/**` |
| Sagas / `EventPublisher` aggregate roots | Absent | no matches in feature code |

## Layer ownership

| Concern | Owner |
|---------|--------|
| HTTP, status codes, Swagger | Controller |
| Transactions of a use case, hashing, JWT, branching, `HttpException` | Application service |
| One write | Command + `@CommandHandler` |
| One read | Query + `@QueryHandler` |
| Cross-cutting write that must not fail the request | `IEvent` + `@EventsHandler` via `EventBus` |
| SQL | Infrastructure repository only |
| Prisma client | `PrismaService` |

Controllers do not inject `CommandBus` or `QueryBus`. Handlers do not throw HTTP exceptions; the service does. Handlers do not hash passwords or sign JWTs.

## Naming

| Kind | Class | File | Decorator |
|------|-------|------|-----------|
| Command | `CreateAdminCommand` | `createAdmin.command.ts` | none on the class |
| Command handler | `CreateAdminHandler` | `createAdmin.handler.ts` | `@CommandHandler(CreateAdminCommand)` |
| Query | `GetAdminByMobileQuery` | `getAdminByMobile.query.ts` | none |
| Query handler | `GetAdminByMobileHandler` | `getAdminByMobile.handler.ts` | `@QueryHandler(GetAdminByMobileQuery)` |
| Event | `CreateLogEvent` implements `IEvent` | `createLog.event.ts` | none |
| Event handler | `CreateLogHandler` | `createLog.handler.ts` | `@EventsHandler(CreateLogEvent)` |

Command and query classes are plain constructors that store `public readonly` payloads. They do not extend a framework base class (this codebase’s pattern).

Handler method is `execute` for commands and queries, `handle` for events.

Register every handler class in the feature module `providers` array (`CommandHandlers`, `QueryHandlers`, `EventHandlers`). A handler file that is not registered does not run.

## Current catalog

### Admin commands

| Command | Handler | Repository effect |
|---------|---------|-------------------|
| `CreateAdminCommand` | `CreateAdminHandler` | `AdminRepository.create` |
| `UpdatePasswordCommand` | `UpdatePasswordHandler` | `AdminRepository.updatePassword` |
| `CreateAdminTokenCommand` | `CreateAdminTokenHandler` | `AdminTokenRepository.create` |
| `DeleteAdminTokenCommand` | `DeleteAdminTokenHandler` | `AdminTokenRepository.delete` |
| `CreateSmsRqCommand` | `CreateSmsRqHandler` | `SmsRqRepository.create` |
| `UpdateSmsRqCommand` | `UpdateSmsRqHandler` | `SmsRqRepository.update` |
| `SoftDeleteCommand` | `SoftDeleteHandler` | `SmsRqRepository.softDelete` (hard delete) |
| `CreateLogCommand` | `CreateLogCommandHandler` | `LogRepository.create` |

`CreateLogCommand` is registered. The live audit path publishes `CreateLogEvent` instead. Do not add a third way to insert logs.

### Admin queries

| Query | Handler | Repository effect |
|-------|---------|-------------------|
| `GetAdminByMobileQuery` | `GetAdminByMobileHandler` | `findByMobile` |
| `GetAdminByUsernameQuery` | `GetAdminByUsernameHandler` | `findByUsername` |
| `GetAdminByEmailQuery` | `GetAdminByEmailHandler` | `findByEmail` |
| `GetAdminQuery` | `GetAdminQueryHandler` | `findById` |
| `AllAdminQuery` | `AllAdminHandler` | `findAll` |
| `GetOneSmsRqQuery` | `GetOneSmsRqHandler` | `SmsRqRepository.findOne` |
| `FindLogQuery` | `GetLogHandler` | `LogRepository.find` |

Only `GetAdminByMobileQuery` and `GetOneSmsRqQuery` are executed by `AdminService`. The others are available for new admin endpoints. Reuse them instead of a second query class for the same read.

### Admin events

| Event | Handler | Effect |
|-------|---------|--------|
| `CreateLogEvent` | `CreateLogHandler` | `LogRepository.create` |

Publish with `Tools.saveLogs`. Payload is `CreateLogInterface`.

### Media

| Type | Class | Effect |
|------|-------|--------|
| Command | `CreateMediaCommand` | `MediaRepository.create` |
| Command | `DeleteMediaCommand` | `MediaRepository.delete` |
| Command | `UpdateMediaOwnerCommand` | `updateMediaOwner`. No service caller |
| Query | `GetMediaQuery` | `findById` |

## How to add a command

1. Add `domain/interfaces/...` if the payload is new.
2. Add `<name>.command.ts` with a constructor payload.
3. Add `<name>.handler.ts`:

```ts
@CommandHandler(CreateThingCommand)
export class CreateThingHandler implements ICommandHandler<CreateThingCommand> {
  constructor(private readonly thingRepository: ThingRepository) {}

  async execute(command: CreateThingCommand) {
    return this.thingRepository.create(command.payload);
  }
}
```

4. Add the repository method on the interface and the infrastructure class.
5. Push the handler into the module `CommandHandlers` array.
6. From the application service: `await this.commandBus.execute(new CreateThingCommand(payload))`.
7. Map to a DTO in the service. Throw `HttpException` in the service when the rule fails.

## How to add a query

Same as a command, with `@QueryHandler`, `IQueryHandler`, and `queryBus.execute`. Queries must not insert, update, or delete.

## How to add an event

Use an event when the caller should continue if the side effect fails. `saveLogs` already swallows handler setup errors in its own `try/catch`. Domain events are not event-sourced state. The database row is still the source of truth.

`@nestjs/event-emitter` is not the audit bus. Do not publish logs with `EventEmitter2`.

## Transactions

No `prisma.$transaction` usage was found. A use case that writes two required rows (for example create App and attach Media) must use one `prisma.$transaction` inside the application service or a single repository method. Do not pretend two `commandBus.execute` calls are atomic.

## What not to do

- Do not put Prisma in `domain/` or in controllers.
- Do not call repositories from controllers.
- Do not create a command for a pure calculation.
- Do not duplicate `GetAdminByMobileQuery` under a new name.
- Do not register handlers only in `dist/`.
- Do not copy `modules/app/app.module.ts`. It imports admin commands that are not part of the App aggregate.

## App feature

When App is implemented, add commands for `create`, `update`, `updateStatus`, `updateActiveSession` and queries for `findById`, `findByAccessToken`, `findAll`, matching `AppRepositoryImpl`. Issue `accessToken` in the service (JWT or random) and persist it through a command. That behavior is not implemented. Do not invent the token format until the task specifies it.
