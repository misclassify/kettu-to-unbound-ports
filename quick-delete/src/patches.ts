import { metro, patcher } from '@unbound-app/api';
import { settings } from '@unbound-app/settings';

import { readLabels } from '~/lib/labels';
import { shouldAutoConfirm, type Popup } from '~/lib/match';

/**
 * @description Confirms Discord's delete-message and remove-embed alerts instead of showing them. Patches `show` on
 * Discord's legacy alert module; every other alert shows as before.
 */
export function patchDeleteConfirmation(): void {
	const Alerts = metro.findByProps('show', 'openLazy', 'confirm');

	if (!Alerts) {
		logger.warn('Quick delete skipped: Discord moved its alert module.');

		return;
	}

	patcher.instead(Alerts, 'show', ({ args, original }) => {
		const popup = args[0] as Popup | undefined;
		const enabled = { message: settings.autoConfirmMessage, embed: settings.autoConfirmEmbed };

		if (!shouldAutoConfirm(popup, readLabels(), enabled)) return original(...args);

		(popup!.onConfirm as () => void)();
	});
}
