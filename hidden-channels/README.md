# Unbound ports

Two plugins ported from Kettu, written in Unbound's plugin layout (see `packages/plugins/quick-delete` in the Unbound repo for the reference shape).

- `silent-leave`: `/leave-silent` for group DMs. Ported from Kettu's SilentLeave.
- `hidden-channels`: shows hidden channels and warns before opening them. Reworked from Kettu's Hidden Channels. Untested.

Neither has been built or run on a device. To use them, scaffold a repo with `bunx --bun @unbound-app/cli create --kind plugin --shape repository`, copy each folder's `manifest.json`, `settings.ts`, `i18n/` and `src/` over the generated plugin, then `ubd check` and `ubd debug push <id>`.
