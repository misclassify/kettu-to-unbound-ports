import { expect, test } from 'bun:test';

import {
	categorize,
	decodeOverwrite,
	has,
	highestGranting,
	memberPermissions,
	overwriteNames,
	roleHex,
	titleCase,
	toBigInt,
} from '~/lib/perms';

const bits = {
	ADMINISTRATOR: 8n,
	VIEW_CHANNEL: 1024n,
	SEND_MESSAGES: 2048n,
	KICK_MEMBERS: 2n,
	BRAND_NEW_FLAG: 1n << 60n,
};

test('toBigInt accepts numbers, strings and bigints and shrugs off junk', () => {
	expect(toBigInt('2048') === 2048n).toBe(true);
	expect(toBigInt(8) === 8n).toBe(true);
	expect(toBigInt(5n) === 5n).toBe(true);
	expect(toBigInt('x') === 0n).toBe(true);
	expect(toBigInt(undefined) === 0n).toBe(true);
});

test('has needs every bit of the flag, and never matches 0', () => {
	expect(has(3072n, 1024n)).toBe(true);
	expect(has(1024n, 3072n)).toBe(false);
	expect(has(0n, 0n)).toBe(false);
});

test('categorize drops missing flags and keeps new ones in Other', () => {
	const groups = categorize(bits);
	const names = groups.map((group) => group.name);

	expect(names.includes('General')).toBe(true);
	expect(names.includes('Voice')).toBe(false);
	expect(groups[groups.length - 1].permissions).toEqual(['BRAND_NEW_FLAG']);
});

test('overwrites only decode channel permissions', () => {
	expect(overwriteNames(bits)).toEqual(['SEND_MESSAGES', 'VIEW_CHANNEL', 'BRAND_NEW_FLAG']);
	expect(decodeOverwrite({ id: '1', allow: '2048', deny: '1024' }, bits)).toEqual({
		allowed: ['SEND_MESSAGES'],
		denied: ['VIEW_CHANNEL'],
	});
});

test('member permissions: roles combine, administrator and owner get everything', () => {
	const everyone = { id: 'g', permissions: '1024' };
	const mod = { id: 'm', permissions: '2' };
	const admin = { id: 'a', permissions: '8' };
	const all = Object.values(bits).reduce((a, b) => a | b, 0n);

	expect(memberPermissions([everyone, mod], false, bits) === 1026n).toBe(true);
	expect(memberPermissions([everyone, admin], false, bits) === all).toBe(true);
	expect(memberPermissions([everyone], true, bits) === all).toBe(true);
});

test('highestGranting picks the top role', () => {
	const roles = [
		{ id: 'low', position: 1, permissions: '2' },
		{ id: 'high', position: 5, permissions: '2' },
	];

	expect(highestGranting(roles, 2n)?.id).toBe('high');
	expect(highestGranting(roles, 4n)).toBe(undefined);
});

test('roleHex and titleCase', () => {
	expect(roleHex(0xff00aa)).toBe('#FF00AA');
	expect(roleHex(0)).toBe(undefined);
	expect(titleCase('USE_EXTERNAL_EMOJI')).toBe('Use External Emoji');
});
