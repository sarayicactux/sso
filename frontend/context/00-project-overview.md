# Project Overview

## Purpose

The sale frontend is a **Vue.js SPA** that provides the user interface for the sale business system.

It consumes the .NET REST API in `backend/` (Phases 1–7 implemented).

## Primary UI areas

| Area | Route | Status |
|------|-------|--------|
| Authentication | `/login` | Done |
| Dashboard | `/` | Done |
| Products catalog | `/products` | Done |
| Orders (list, detail, create, confirm, cancel) | `/orders`, `/orders/:id` | Done |
| Admin — users | `/admin` (users tab) | Done |
| Admin — roles/permissions | `/admin` (roles tab) | Done |

## Module status

| Module | Backend | Frontend |
|--------|---------|----------|
| Auth | Done | Done |
| Users | Done | Done |
| Roles | Done | Done |
| Products | Done | Done |
| Orders | Done | Done |

API contract: `context/05-api-integration.md`

## Authoritative sources

- `frontend/MEMORY.md` — status and hard rules
- `frontend/context/` — knowledge digest
- `frontend/.cursor/skills/sale-frontend/SKILL.md` — agent development guide
- Backend OpenAPI — `http://localhost:5064/swagger`

## Codebase memory

MCP project: **`C-sarayi-sale-frontend`** — index path `frontend/`

Re-index after structural changes. Use codebase-memory MCP before manual file inspection.

## Backend boundary

Backend specification: `backend/dotnet_code_agent_project_spec.md`

Do not duplicate backend business rules (order totals, status transitions, permission resolution) in the SPA.
