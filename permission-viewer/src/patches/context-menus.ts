import { messages } from '@unbound-app/i18n';
import { metro, patcher } from '@unbound-app/api';

import { openTarget } from '~/lib/open';
import { sheetState as state } from '~/lib/sheet-state';
import { isProfileMenu } from '~/lib/profile-menu';

type MenuItem = { label?: string; IconComponent?: unknown; action?: () => void };
type ContextMenu = { items?: MenuItem[] };

/**
 * @description Adds View Permissions to the overflow menu of a profile opened from a server, as Kettu's PermissionViewer did.
 * The menu carries no user, so it is recognized by its items and paired with the open server profile.
 * Patches `showContextMenu` on Discord's context menu module.
 */
export function patchContextMenus(): void {
	const ContextMenus = metro.findByProps('showContextMenu', 'hideContextMenu');
	const Icons = metro.findByProps('ShieldUserIcon');

	if (!ContextMenus) {
		logger.warn('Profile menu item skipped: Discord moved showContextMenu.');

		return;
	}

	patcher.before(ContextMenus, 'showContextMenu', ({ args: [menu] }: { args: [ContextMenu?] }) => {
		const { profile } = state;

		if (!profile || !menu || !Array.isArray(menu.items) || !isProfileMenu(menu.items)) return;

		const label = messages.VIEW_PERMISSIONS;

		if (menu.items.some((item) => item.label === label)) return;

		menu.items.push({
			label,
			...(Icons?.ShieldUserIcon ? { IconComponent: Icons.ShieldUserIcon } : {}),
			action: () => {
				ContextMenus.hideContextMenu();
				openTarget({ kind: 'member', guildId: profile.guildId, userId: profile.userId });
			},
		});
	});
}
