import { expect, test } from 'bun:test';

import { toBase64 } from '~/lib/base64';
import { hasImageIcon, iconFileName, iconUrl } from '~/lib/icon';

const bytes = (text: string) => new Uint8Array([...text].map((char) => char.charCodeAt(0)));

test('toBase64 matches the standard encoding, padding included', () => {
	expect(toBase64(bytes(''))).toBe('');
	expect(toBase64(bytes('f'))).toBe('Zg==');
	expect(toBase64(bytes('fo'))).toBe('Zm8=');
	expect(toBase64(bytes('foo'))).toBe('Zm9v');
	expect(toBase64(bytes('foobar'))).toBe('Zm9vYmFy');
});

test('toBase64 handles every byte value', () => {
	const all = new Uint8Array(256).map((_, index) => index);
	const expected = Buffer.from(all).toString('base64');

	expect(toBase64(all)).toBe(expected);
});

test('role icon links', () => {
	expect(iconUrl({ id: '1', icon: 'abc' }, 'png', 512)).toBe(
		'https://cdn.discordapp.com/role-icons/1/abc.png?size=512',
	);
	expect(iconUrl({ id: '1', icon: null, unicodeEmoji: '🔥' }, 'png', 512)).toBe(undefined);
	expect(hasImageIcon({ id: '1', icon: '' })).toBe(false);
	expect(iconFileName({ id: '9' }, 'webp')).toBe('role-icon-9.webp');
});

