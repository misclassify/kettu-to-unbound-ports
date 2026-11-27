# Kettu to Unbound plugin ports

Ten Unbound plugins ported from Kettu/Vencord plugins. Built with `@unbound-app/cli` 3.6.2; every plugin passes `ubd check` (everything except lint, which crashed in my build sandbox) and has its built `dist/` included.

See `INSTALL_LINKS.md` for the per-plugin install links, and the plugin list below.

| Folder | Ported from |
|---|---|
| `silent-leave` | Kettu SilentLeave |
| `hidden-channels` | Kettu Hidden Channels (reworked) |
| `quick-delete` | Kettu QuickDelete |
| `no-delete` | Kettu NoDelete |
| `view-raw` | Kettu ViewRaw |
| `permission-viewer` | Kettu PermissionViewer |
| `role-tools` | Vencord betterRoleContext, plus view/save role icons |
| `review-db` | Kettu ReviewDB |
| `message-preview` | Kettu Message Preview |
| `cloud-sync-import` | Kettu Cloud Sync (read-only backup viewer, not a sync engine) |

## Rebuilding

`bun install`, then `bunx @unbound-app/cli build`. The root `package.json` pins `rollup-plugin-swc3` to 0.12.2: version 0.12.3 makes the build's minifier delete the whole plugin body, so every bundle comes out empty. Keep that override.

## Notes

- None of these have run on a device yet; the Discord-facing patches are untested.
- `src/lib/` in several plugins holds helpers copied from Unbound's first-party plugins (GPL-3.0).
- Add your own Discord user id to each `manifest.json`, then rebuild.