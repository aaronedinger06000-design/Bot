---
name: Discord bot 24/7 deployment in pnpm workspace
description: How to make a Discord bot (background worker) stay online 24/7 when the repl is closed, in the pnpm-workspace artifact template.
---

# Discord bot must be a deployable artifact + Reserved VM

A Discord bot run only as a manual workflow stops the moment the user closes Replit / the dev container sleeps. To stay online 24/7 it must be **deployed** as a **Reserved VM** (always-on, paid).

**Why:** Workflows live only in the dev environment. Deployment is a separate production environment. Autoscale scales to zero with no HTTP traffic, which kills a long-running bot — so a bot needs VM (always running), never autoscale or scheduled.

**How to apply (this template specifics):**
- Deployment in the pnpm workspace is artifact-based (`.replit` has `router = "application"`). `.replit`'s `deployment.run` is ignored; each artifact's `.replit-artifact/artifact.toml` `[services.production]` provides the run command. A bot created as a raw workflow is NOT an artifact and would not be deployed at all.
- `.replit` cannot be edited directly (blocked) and there is no `deployConfig()` callback. `deploymentTarget` stays whatever `.replit` says (often `autoscale`); the **user must select Reserved VM in the Publish UI** — that selection overrides the default. Always tell them this explicitly.
- To make a non-web worker deployable: hand-create `artifacts/<slug>/.replit-artifact/artifact.toml` (model it on `artifacts/api-server`), then register it with `verifyAndReplaceArtifactToml` (the real `artifact.toml` must already exist on disk first, or verify fails with ENOENT on realpath). `createArtifact` has no bot/worker type, so this manual route is required.
- Use `kind = "api"`, give it a unique `localPort`/`PORT` and a `[services.production.run]` with `args = ["node", "<path>/index.mjs"]`. Add `[services.production.health.startup]` with a `path` that the bot's keep-alive HTTP server answers 200 on (match it to the service `paths`, e.g. `/bot`).
- Registering the artifact auto-creates a dev workflow `artifacts/<slug>: <service name>`. **Remove the old manual bot workflow** (`removeWorkflow`) or two bot instances run in dev → duplicate command responses.

**Privileged intents gotcha:** discord.js `GuildMembers` / `MessageContent` intents crash with "Used disallowed intents" unless the user enables them in the Discord Developer Portal (Bot → Privileged Gateway Intents). Without them, anti-join / anti-bot / content-based anti-spam cannot function.

**"Could not find run command" on Publish (app-router):** In an app-router pnpm workspace, the publish flow needs exactly one artifact at `previewPath = "/"` (the artifacts skill states one artifact MUST be root). If every artifact sits on a sub-path (`/bot`, `/api`, `/__mockup`) the router cannot resolve a primary run command and Publish fails with "could not find run command". **Fix:** make the bot the root artifact (`previewPath = "/"`, service `paths = ["/"]`, health `path = "/"`) via `verifyAndReplaceArtifactToml`. The bot's keep-alive HTTP server already answers 200 on all paths, so root health passes. **Why root = the bot specifically:** a Reserved VM runs the root/primary process, so the bot must be root for the VM to actually run the bot (not the api-server).
- `design` artifacts (mockup-sandbox / Canvas) have only `[services.development]` and no `[services.production]` block — that absence is exactly how a service is excluded from production; no separate "exclude" flag exists.
- `.replit` `[[ports]]` (incl. which `localPort` owns `externalPort = 80`) is auto-managed and NOT editable directly, and changing an artifact's `previewPath` does NOT reassign `externalPort 80`. There is no exposed tool to remap external ports. Production app-router routing is by `previewPath`, not by the dev-proxy `[[ports]]` map.
