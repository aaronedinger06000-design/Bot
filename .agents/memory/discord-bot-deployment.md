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
