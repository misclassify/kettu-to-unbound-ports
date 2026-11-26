import { expect, test } from 'bun:test';

import { snowflakeDate } from '~/lib/hidden';

test('snowflakeDate reads the creation time', () => {
	// Discord's example snowflake, created 2016-04-30 11:18:25.796 UTC.
	expect(snowflakeDate('175928847299117063').toISOString()).toBe('2016-04-30T11:18:25.796Z');
});
