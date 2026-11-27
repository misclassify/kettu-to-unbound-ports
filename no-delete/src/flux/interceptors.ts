import { flux } from '@unbound-app/api';
import { settings } from '@unbound-app/settings';

import { deletedNotice, parseIds } from '~/lib/notice';

type DeleteAction = { id?: string; channelId?: string };

/** Messages already replaced by a notice. Deleting one of these again, such as with Dismiss message, lets it go. */
const shown = new Set<string>();

/**
 * @description Keeps deleted messages on screen. Intercepts `MESSAGE_DELETE`, drops it, and shows the message again as a
 * failed AutoMod edit with a "This message was deleted" notice, which is how Kettu's NoDelete did it. A second delete of the same
 * message goes through, which removes it. Messages from ignored users, and from bots when that is on, are deleted normally.
 */
export function interceptDeletions(): void {
	const Messages = flux.getStore('Message') as unknown as {
		getMessage(channelId: string, id: string): { author?: { id?: string; bot?: boolean } } | undefined;
	};

	flux.interceptAction('MESSAGE_DELETE', (action) => {
		const { id, channelId } = action as DeleteAction;

		if (!id || !channelId) return false;

		const message = Messages.getMessage(channelId, id);
		const author = message?.author;

		if (author?.id && parseIds(settings.filters.ignoredUsers).includes(author.id)) return false;
		if (settings.filters.ignoreBots && author?.bot) return false;

		if (shown.delete(id)) return false;

		shown.add(id);

		const notice = deletedNotice({
			timestamps: settings.display.timestamps,
			twelveHour: settings.display.twelveHour,
			now: new Date(),
		});

		void flux.dispatch({
			type: 'MESSAGE_EDIT_FAILED_AUTOMOD',
			messageData: { type: 1, message: { channelId, messageId: id } },
			errorResponseBody: { code: 200000, message: notice },
		} as never);

		return true;
	});
}
