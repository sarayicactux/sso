---
name: manualsso-add-module
description: >-
  Standard ordered workflow for adding a ManualSSO NestJS module or feature
  (domain → DTOs → mappers → repositories → CQRS commands/queries → services →
  controllers → Nest module). Use when creating a new module, feature, aggregate,
  entity stack, or when the user asks to add a module the standard way in
  ManualSSO / C:\sarayi\ManualSSO.
---

# ManualSSO — add module / feature

Follow this order. Do not invent layers or skip steps unless the user approves an exception. Still obey `context/12-engineering-rules.md` and use codebase-memory-mcp when connected.

## Standard approach

1. In the domain directory, create the following files in this order:
   1. Define enum files in the enums directory.
   2. If value objects are needed, define them in the value_objects directory.
   3. Define entity files in the entities directory. Entity files must also contain domain rules, such as conditions for changing entity status, duplicate value validation, and other business constraints.
   4. Define all data interfaces in the interfaces directory. These interfaces are implemented by DTOs.
   5. Define database query functions as interfaces in the repository directory. Implement these interfaces in the repositories located at infrastructure/repositories.
   6. Define all domain use cases as interfaces in the use_cases directory and implement them in services.
   7. If events exist, add their interfaces to the corresponding entity's use case file.
   8. Prefer using services and controllers instead of use cases for the operations described in item 7. Each should be implemented by the system's corresponding service and controller.
2. Implement all DTOs in the presentation/dtos directory based on the domain interfaces.
3. Implement all mapper functions in mapper classes located at infrastructure/mappers to convert data into DTOs.
4. Create all domain repository implementations in infrastructure/repositories. These classes must implement the domain repository interfaces.
5. For each model, create command and handler files under application/commands, using separate create, update, and delete directories. For example, creating a role should use the following structure:
   application/commands/admin/create/createAdmin.command.ts
   application/commands/admin/create/createAdmin.handler.ts

   Domain rules must be validated in these commands.
6. Implement query and handler files for each query under application/queries. For example:
   application/queries/admin/getAdmin.query.ts
   application/queries/admin/getAdmin.handler.ts
7. If events or saga-related database operations exist, define the corresponding files in their respective directories. Update the initial implementation when creating the first instance of this structure.
8. Implement NestJS services in application/services. These services must implement their corresponding use cases.
9. Implement controllers for handling user requests in presentation/controllers.
10. Create the NestJS module file. It must import and register all handlers, infrastructure repositories, and every other class used by the module in its providers array.

## Return-type conventions

- Repositories must return Entity objects.
- Service implementations (serviceImpl) must return domain interface types.
- Public-facing services must return DTOs.

## Also

- Do not create or keep test/spec files (`*.spec.ts`, e2e, etc.). Verify with build/API behavior only.
- After schema/model changes: edit module `infrastructure/models/*.prisma`, then `npm run build:schema` and `prisma generate` (never while `app.prisma` is invalid).
- Re-index via codebase-memory-mcp when available.
