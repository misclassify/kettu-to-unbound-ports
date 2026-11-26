import { dialogs, flux, metro, patcher } from '@unbound-app/api';
import { settings } from '@unbound-app/settings';

import { describeChannel, isHidden, shouldForceView } from '~/lib/hidden';

/**
 * @description Makes Discord treat every channel as viewable, so hidden ones show in the channel list.
 * Patches the permission check's `can` and answers `VIEW_CHANNEL` only. Every other permission is Discord's.
 */
export function patchChannelVisibility(): void {
	const Permissions = metro.findByProps('getChannelPermissions', 'can');

	if (!Permissions) {
		logger.warn('Hidden channels skipped: Discord moved its permission module.');

		return;
	}

	patcher.after(Permissions, 'can', ({ args, result }) => {
		const [flag, channel] = args;

		return shouldForceView(flag, channel) ? true : result;
	});
}

/**
 * @description Asks before opening a hidden channel, showing its topic and dates. Discord's router has several
 * entry points that all end at the same place, so every function on it is wrapped, as the Kettu plugin did.
 */
export function patchHiddenChannelOpen(): void {
	const Router = metro.findByProps('transitionToGuild');

	if (!Router) {
		logger.warn('Hidden channel popup skipped: Discord moved its router.');

		return;
	}

	for (const key of Object.keys(Router)) {
		if (typeof Router[key] !== 'function') continue;

		patcher.instead(Router, key, ({ args, original }) => {
			if (!settings.showPopup || typeof args[0] !== 'string') return original(...args);

			const channelId = args[0].match(/(\d+)$/)?.[1];
			const channel = channelId ? flux.getStore('Channel').getChannel(channelId) : undefined;

			if (!channel || !isHidden(channel)) return original(...args);

			dialogs.showDialog({
				title: 'This channel is hidden.',
				body: describeChannel(channel),
				buttons: [{ label: 'View Anyway', onPress: () => original(...args) }],
				cancel: 'Cancel',
			});
		});
	}
}
