import { metro } from '@unbound-app/api';

import type { Labels } from '~/lib/match';

// Discord's hashed message ids for the delete-message and remove-embed confirmations.
const MESSAGE_ID = 'AMvpS4';
const EMBED_ID = 'vXZ+Fo';

function read(id: string): string {
	const { i18n } = metro.common;
	const message = i18n?.t?.[id];

	if (!message) return '';

	try {
		return i18n.intl.string(message) || '';
	} catch (error) {
		logger.error(`Failed to read Discord's message ${id}:`, error);

		return '';
	}
}

/**
 * @description Reads the two confirmation texts in the user's language. Empty when Discord renamed the id,
 * which switches that kind off instead of matching every alert.
 * @returns The labels.
 */
export function readLabels(): Labels {
	return { message: read(MESSAGE_ID), embed: read(EMBED_ID) };
}
