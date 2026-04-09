# Specification

## Summary
**Goal:** Build a safe, non-malicious “RAT G700” build/configuration tool with authenticated, per-user CRUD for Builds and Items, plus JSON import/export.

**Planned changes:**
- Add first-run setup flow to define what “RAT G700” stands for, what a “build” represents, and optional units/currency; persist this metadata in the Motoko canister and reuse it for UI labels/help text.
- Implement Motoko backend (single actor) data model and canister APIs for per-principal CRUD of Builds (id, name, notes, createdAt, updatedAt) and nested Items (id, label, quantity, optional cost/notes), with consistent timestamps and Result-style responses.
- Create frontend pages to list/search Builds, create/edit/delete with confirmations, and a Build detail view to add/edit/remove Items, with loading/error states for all operations.
- Integrate Internet Identity sign-in and ensure each principal only sees their own Builds; include sign-out.
- Add Build JSON export (download) and import (upload) from the Build detail view, including a stable `schemaVersion` field and validation with readable error messages.
- Apply a coherent, distinctive visual theme (not blue/purple) across navigation, forms, lists/tables, and dialogs with accessible contrast and focus states.
- Add a Help/About page in navigation that uses stored setup metadata and clearly states the app is not a remote-access tool and does not control devices.
- Wire frontend to backend using React Query for all queries/mutations with cache invalidation, and include basic developer documentation to run locally and deploy.

**User-visible outcome:** After signing in with Internet Identity, a user can set up what the app name/build means, create and manage their own Builds and Items, import/export Builds as JSON, and view a Help/About page explaining the tool and its non-malware stance in a consistently themed UI.
