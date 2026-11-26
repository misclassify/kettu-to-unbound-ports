import { expect, test } from 'bun:test';

import { cleanMessage } from '~/lib/raw-data';

test('removes the author private fields and keeps the rest', () => {
	const cleaned = cleanMessage({
		id: '1',
		content: 'hi',
		author: { id: '2', username: 'a', email: 'x@y.z', phone: '1', mfaEnabled: true, hasBouncedEmail: false },
	});

	expect(cleaned).toEqual({ id: '1', content: 'hi', author: { id: '2', username: 'a' } });
});

test('does not change the original message', () => {
	const message = { author: { email: 'x@y.z' } };

	cleanMessage(message);

	expect(message.author.email).toBe('x@y.z');
});
