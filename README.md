# Kettu → Unbound ports

Standalone Unbound plugins, each in the layout `ubd create --kind plugin` generates (same files and dev dependencies, no private workspace packages).

| Folder | Ported from | Notes |
|---|---|---|
| `silent-leave` | Kettu SilentLeave | `/leave-silent` in group DMs |
| `hidden-channels` | Kettu Hidden Channels | Reworked; least certain |
| `quick-delete` | Kettu QuickDelete | Same i18n-hash matching, message and embed toggles |
| `no-delete` | Kettu NoDelete | Same AutoMod-notice trick; ignored users are a comma-separated ID setting |
| `view-raw` | Kettu ViewRaw | Messages only, like Kettu |
| `permission-viewer` | Kettu PermissionViewer | Server roles, channel overwrites and a member's permissions; reached from server, channel and profile sheets and the profile overflow menu |
| `role-tools` | Vencord betterRoleContext | Long-press a role on a profile: copy color, view/save role icon, view members |

Not yet written: Message Preview, ReviewDB, Cloud Sync.

None of these have been built or run on a device. The pure-logic tests pass under Node; the Discord-facing patches are untested.

## Use

1. `bunx --bun @unbound-app/cli create --kind plugin --shape repository`
2. Copy a folder into the generated repo's plugins folder (or use it as the plugin project directly).
3. `bun install`, `ubd check`, then `ubd debug push <id>`.

`src/vendor/` (in view-raw, permission-viewer and role-tools) holds helpers copied from Unbound's first-party plugins (GPL-3.0). Add your own Discord user id to each `manifest.json`.
