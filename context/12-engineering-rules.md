# 12 — Project Engineering Rules (Mandatory)

## How to Use This Document

These rules are **mandatory** for all future work in ManualSSO unless the user explicitly approves an exception.

- Cursor always-apply rule: `.cursor/rules/engineering-rules.mdc`
- Product/domain details: [00-project-overview.md](00-project-overview.md) … [11-api-documentation.md](11-api-documentation.md)
- Architecture binding for this repo: `Controller → application service → CommandBus | QueryBus → handler → infrastructure repository → PrismaService → PostgreSQL`. NestJS 12 + Prisma 7 + PostgreSQL. CQRS is in use. Live HTTP modules: **Admin**, **Media**, **Apps**, and **User**. See [01-architecture.md](01-architecture.md) and [07-cqrs-rules.md](07-cqrs-rules.md).
- Codebase-memory MCP namespace (when configured): `user-codebase-memory-mcp`

---

You are working as the AI engineering agent for this project.

These are the general engineering rules you MUST follow for all future work in this repository.

## 1. Understand Before Changing

Before making any code change:
- Read the relevant project context.
- Inspect the existing implementation.
- Check the established project patterns.
- Use the available codebase-memory-mcp MCP, if configured and connected, to retrieve relevant codebase knowledge.
- Do not rely on memory from previous conversations when the repository can provide authoritative information.

If the required codebase-memory-mcp MCP is configured but unavailable/disconnected:
- Stop before making code changes.
- Tell me that the MCP connection is unavailable.
- Do not pretend that you used it.

Before any significant implementation, verify that your understanding is consistent with:
- /context/
- existing source code
- established project conventions

## 2. Re-index After Changes

After completing code changes:
- Re-index/update the codebase using the available codebase-memory-mcp MCP.
- Ensure the new implementation is represented in project memory.
- If the MCP connection is unavailable, tell me explicitly.

## 3. Do Not Invent

Do not invent:
- business rules
- APIs
- database schemas
- models
- services
- abstractions
- dependencies
- architectural patterns
- validation rules
- workflow behavior

Use this priority order:

1. Explicit task requirements
2. Existing business rules in the codebase
3. Existing architecture and conventions
4. Existing project context/memory
5. Ask the user if the ambiguity is still unresolved

Never silently guess when the missing information can materially change behavior.

## 4. Task Scope

Do exactly what the task requires.

Do not:
- add unrelated features
- perform unrelated refactoring
- redesign working architecture
- introduce unnecessary abstractions
- change existing behavior without a concrete reason

Prefer the smallest safe change that fully satisfies the requirement.

## 5. Preserve Working Code

Existing tested and working code should not be changed merely for style or personal preference.

Modify existing working code only when:
- the requested feature requires it
- a bug must be fixed
- the current implementation violates an explicit requirement
- the existing implementation would cause the new feature to fail

Before changing such code, explain the reason.

## 6. Dependency Rules

Do NOT install new packages.

If a new package is genuinely required:
- stop before installing it
- explain exactly why the package is required
- explain why the existing dependencies cannot solve the problem
- wait for my approval

Never add a dependency merely because it makes implementation easier.

## 7. Requirements and Ambiguity

For every feature request:
- analyze the complete request first
- inspect the relevant code
- identify business logic
- identify validations
- identify edge cases
- identify state transitions
- identify data integrity constraints
- identify API behavior
- identify UI behavior

If a material ambiguity remains after inspecting the repository and task requirements, ask me before changing code.

Do not ask unnecessary questions when the answer is clearly established by the project.

## 8. Planning

For new feature tasks:

Before changing code:
1. Analyze the task.
2. Resolve all material ambiguities.
3. Create a Markdown implementation plan.
4. Break the implementation into clear phases.
5. Each phase must have:
   - objective
   - files/modules affected
   - implementation steps
   - validation strategy
   - completion criteria

Do not include a “tests” phase or create test files as part of the plan unless the user explicitly asks for tests.

The plan file must be updated after implementation to reflect the final state.

Do not begin implementation while a material ambiguity remains unresolved.

## 9. Updates to Existing Features

For update tasks:
- identify affected functionality
- identify dependencies
- check whether other parts of the application may break
- report potential regressions before implementation
- preserve backward compatibility unless the requirement explicitly changes it

## 10. Business Logic

Business rules must be enforced on the server.

Never rely exclusively on frontend validation for:
- business rules
- authorization
- state transitions
- data integrity
- financial calculations

For critical business logic:
- make the implementation explicit
- add comments where the reasoning is not obvious
- test both valid and invalid cases

## 11. Validation

Validation must exist at the correct boundary.

For important validation logic:
- explain what is being validated
- explain why
- cover edge cases
- test failure cases

Do not duplicate validation unnecessarily, but do not remove server-side validation merely because the frontend already validates the same input.

## 12. Error Handling

When an error occurs:
- identify the root cause
- explain why it happened
- explain which layer caused it
- explain the fix
- verify that the fix does not introduce a regression

Do not hide errors merely to make the application appear successful.

## 13. Comments

Use comments when they add real value, especially for:
- business logic
- validations
- workflow/state transitions
- edge cases
- non-obvious architectural decisions
- security/data-integrity decisions

Do not add comments that simply restate the code.

## 14. Testing

**Project policy (mandatory):** Do **not** create test files for this project. Do not add `*.spec.ts`, `*.e2e-spec.ts`, or other unit/integration/e2e suites unless the user explicitly asks for tests in that task.

- Do not invent a test suite “to be complete.”
- Do not spend implementation time writing Jest/Nest testing modules by default.
- Jest scripts may exist in `package.json`; that does **not** mean agents should create or maintain tests.

If the user later explicitly requests tests, follow Nest/Jest patterns and only then add the files they asked for.

## 15. Verification

After implementation:
- build the application
- verify API behavior (manual or by exercising the running app when relevant)
- verify database state where relevant
- verify important edge cases and error paths in implementation logic

Do not consider the task complete merely because the code compiles.
Do not treat “missing tests” as incomplete work for this project.

## 16. README

Keep README.md up to date.

README must provide:
- what the application does
- main technologies
- how to run the project
- development setup
- test setup
- production setup
- important environment/configuration requirements

Do not put detailed internal implementation documentation in README when it belongs in /context/.

**Project note:** Application README is `backend/README.md`. Keep run/setup there; keep architecture and rules in `/context/`.

## 17. Existing Patterns First

When implementing something new:
- search for similar functionality in the repository
- follow existing naming conventions
- follow existing folder structure
- follow existing data-access patterns
- follow existing API patterns
- reuse existing components/utilities where appropriate
- do not introduce test files or a testing pattern unless explicitly requested

Do not create a second pattern when an established pattern already exists.

## 18. Minimal Safe Diff

Keep changes focused.

Do not:
- reformat unrelated files
- rename unrelated variables
- reorganize unrelated directories
- refactor unrelated modules
- modify generated files unnecessarily

**Project note:** Do not hand-maintain `backend/prisma/schema.prisma` (it is produced by `npm run build:schema`). Do not run `build:schema` while `app.prisma` is invalid.

## 19. Security and Data Integrity

Never:
- expose secrets
- log sensitive information unnecessarily
- trust client-provided calculated financial values
- bypass server-side business rules
- weaken existing safeguards for convenience

Never copy real secret **values** from `backend/src/main.ts` (session secret), `backend/src/shared/helpers/tools.helper.ts` (SMS key literal), `.env`, JWT `secretKey`, or deploy credentials into docs, chat, or commits. Reference locations only.

## 20. AI Validation

Treat AI-generated code as a proposal, not as truth.

Before accepting generated code:
- compare it to requirements
- compare it to the actual codebase
- verify types
- verify business logic
- verify edge cases
- run the application when appropriate
- do not create tests as part of AI validation

If generated code conflicts with the requirements or architecture:
- reject it
- explain the conflict
- implement the correct approach

## 21. User Disagreement

If I disagree with your proposed implementation or change my preference:
- do not automatically change your technical conclusion just to agree with me
- explain your reasoning and evidence
- reconsider your conclusion only when new evidence, requirements, or technical facts justify so

If I explicitly approve a change that conflicts with the current project rules:
- tell me that it conflicts with the rules
- after my explicit approval, update the relevant project rules
- do not rewrite previously working code unnecessarily
- only modify existing working code when required to preserve compatibility with the approved change

## 22. No Overengineering

Choose the simplest design that:
- satisfies the requirements
- fits the existing architecture
- preserves maintainability

Do not introduce sophisticated architecture merely because it is theoretically cleaner.

## 23. Context Window Management

Keep the effective context below 800,000 tokens.

When context becomes too large:
- summarize older information
- preserve critical requirements
- preserve business rules
- preserve decisions
- preserve constraints
- preserve important file/module relationships
- preserve unresolved issues
- preserve implementation status

Do not summarize away information that can affect future implementation decisions.

## 24. Communication

At meaningful milestones, report:
- what was changed
- why it was changed
- what was validated (build / API / behavior)
- remaining risks/issues

Do not provide long explanations for trivial operations.

## 25. Final Review

Before declaring the task complete, verify:
- requirements are fully satisfied
- no unnecessary code was changed
- no forbidden packages were added
- business rules are enforced server-side
- no test files were added (unless the user explicitly requested them)
- important edge cases were checked
- README is updated
- implementation plan is updated
- codebase memory is re-indexed

These rules are mandatory unless I explicitly approve an exception.
