import { expect, test } from 'bun:test';

import { formatReviewDate, getReviewPermissions } from '~/lib/permissions';

const review = { id: 5, comment: 'hi', timestamp: 0, sender: { discordID: 'author', username: 'a', profilePhoto: '' } };

test('the author may delete but not report their own review', () => {
	expect(getReviewPermissions(review, 'profile', { id: 'author', isAdmin: false })).toEqual({ delete: true, report: false });
});

test('the profile owner and admins may delete, and anyone else may only report', () => {
	expect(getReviewPermissions(review, 'me', { id: 'me', isAdmin: false })).toEqual({ delete: true, report: true });
	expect(getReviewPermissions(review, 'x', { id: 'someone', isAdmin: true })).toEqual({ delete: true, report: true });
	expect(getReviewPermissions(review, 'x', { id: 'someone', isAdmin: false })).toEqual({ delete: false, report: true });
});

test('system reviews and unknown viewers get no actions', () => {
	expect(getReviewPermissions({ ...review, id: 0 }, 'x', { id: 'me', isAdmin: true })).toEqual({ delete: false, report: false });
	expect(getReviewPermissions(review, 'x', { id: undefined, isAdmin: true })).toEqual({ delete: false, report: false });
});

test('formatReviewDate is empty without a timestamp', () => {
	expect(formatReviewDate(0)).toBe('');
	expect(formatReviewDate(1700000000).length > 0).toBe(true);
});
