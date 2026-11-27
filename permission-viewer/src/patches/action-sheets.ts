import { insertSheetRows } from '~/lib/sheet-rows';
import { patchLazySheets } from '~/lib/patch-lazy-sheets';
import { createSheetRenderer } from '~/lib/sheet-renderer';
import { messages } from '@unbound-app/i18n';
import { metro, patcher } from '@unbound-app/api';

import { hasView, openTarget } from '~/lib/open';
import { sheetState as state } from '~/lib/sheet-state';
import { sheetTarget, type SheetProps } from '~/lib/targets';

const ROW_KEY = 'permission-viewer';

/**
 * @description Adds a View Permissions row to server sheets, channel long-press sheets and profile sheets opened from
 * a server. Patches `openLazy` on Discord's action sheets and the sheets it opens without it, and records the open
 * server profile until it closes, so its overflow menu can offer the same view.
 */
export function patchActionSheets(): void {
	const { ActionSheets } = metro.api;

	if (!ActionSheets) {
		logger.warn('View Permissions rows skipped: Discord moved ActionSheets.');

		return;
	}

	state.open = null;
	state.profile = null;

	const renderer = createSheetRenderer(patcher, (result) => {
		const { open } = state;

		if (!open) return;

		insertSheetRows(result, [
			{
				key: ROW_KEY,
				label: messages.VIEW_PERMISSIONS,
				icon: 'ShieldUserIcon',
				onPress: () => {
					ActionSheets.hideActionSheet(open.key);
					openTarget(open.target);
				},
			},
		]);
	});

	patchLazySheets<SheetProps>(patcher, ActionSheets, (key, props) => {
		const target = sheetTarget(key, props);

		if (/^UserProfile/i.test(key)) {
			state.profile = target?.kind === 'member' ? { key, guildId: target.guildId, userId: target.userId } : null;
		}

		state.open = target && hasView(target) ? { key, target } : null;

		return state.open ? renderer.render : undefined;
	});

	patcher.before(ActionSheets, 'hideActionSheet', ({ args: [key] }) => {
		if (state.profile && (key === undefined || key === null || key === state.profile.key)) state.profile = null;
	});
}
