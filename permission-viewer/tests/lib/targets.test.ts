import { expect, test } from 'bun:test';

import { sheetTarget } from '~/lib/targets';

test('a profile opened from a server targets the member', () => {
	expect(sheetTarget('UserProfile123', { userId: '1', guildId: '2' })).toEqual({
		kind: 'member',
		guildId: '2',
		userId: '1',
	});
});

test('a profile outside a server gets no row', () => {
	expect(sheetTarget('UserProfile123', { userId: '1' })).toBe(undefined);
});

test('server and channel sheets', () => {
	expect(sheetTarget('GuildActionSheet:99', {})).toEqual({ kind: 'guild', guildId: '99' });
	expect(sheetTarget('ChannelLongPressActionSheet', { channel: { id: '5' } })).toEqual({
		kind: 'channel',
		channelId: '5',
	});
});

test('other sheets are ignored', () => {
	expect(sheetTarget('MessageLongPressActionSheet', {})).toBe(undefined);
});
