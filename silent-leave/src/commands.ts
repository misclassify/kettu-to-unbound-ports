import { commands, metro } from '@unbound-app/api';

import { GROUP_DM, leaveUrl } from '~/lib/leave';

/**
 * @description Adds `/leave-silent`. It only works in a group DM, and calls Discord's own "leave channel" endpoint
 * with `silent=true`, the same call the Discord app makes when you leave without the system message.
 */
export function registerLeaveSilent(): void {
	commands.register({
		'leave-silent': {
			description: 'LEAVE_SILENT_DESC',
			execute: async (_options, { channel }) => {
				if (channel.type !== GROUP_DM) {
					return { ephemeral: true, content: 'This only works in a group DM.' };
				}

				const { REST } = metro.common;

				if (!REST?.del) {
					logger.warn('Silent leave failed: Discord moved its REST client.');

					return { ephemeral: true, content: 'Could not leave: Discord changed its API client.' };
				}

				try {
					await REST.del({ url: leaveUrl(channel.id), query: 'silent=true' });
				} catch (error) {
					logger.error('Silent leave failed:', error);

					return { ephemeral: true, content: 'Failed to leave the group DM.' };
				}

				return { ephemeral: true, content: 'Left the group DM silently.' };
			},
		},
	});
}
