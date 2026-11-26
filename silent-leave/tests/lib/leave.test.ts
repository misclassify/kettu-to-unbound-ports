import { expect, test } from 'bun:test';

import { GROUP_DM, leaveUrl } from '~/lib/leave';

test('group DMs are channel type 3', () => {
	expect(GROUP_DM).toBe(3);
});

test('leaveUrl points at the channel', () => {
	expect(leaveUrl('123')).toBe('/channels/123');
});
