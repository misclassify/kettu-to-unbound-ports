import { expect, test } from 'bun:test';

import { deletedNotice, formatStamp, parseIds } from '~/lib/notice';

const at = (h: number, m: number, s: number, ms: number) => new Date(2026, 0, 1, h, m, s, ms);

test('24-hour stamp uses hundredths', () => {
	expect(formatStamp(at(15, 4, 5, 129), false)).toBe('15:04:05.12');
});

test('12-hour stamp', () => {
	expect(formatStamp(at(15, 4, 5, 129), true)).toBe('03:04:05.12 pm');
	expect(formatStamp(at(0, 4, 5, 0), true)).toBe('12:04:05.00 am');
});

test('notice with and without time', () => {
	const now = at(9, 0, 0, 0);

	expect(deletedNotice({ timestamps: false, twelveHour: false, now })).toBe('This message was deleted');
	expect(deletedNotice({ timestamps: true, twelveHour: false, now })).toBe('This message was deleted (09:00:00.00)');
});

test('parseIds keeps only snowflakes', () => {
	expect(parseIds('123, 456\n789 abc')).toEqual(['123', '456', '789']);
	expect(parseIds('')).toEqual([]);
});
