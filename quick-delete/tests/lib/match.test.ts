import { expect, test } from 'bun:test';

import { shouldAutoConfirm } from '~/lib/match';

const labels = { message: 'Delete Message', embed: 'Remove embed' };
const both = { message: true, embed: true };

test('confirms a delete-message alert', () => {
	expect(shouldAutoConfirm({ title: 'Delete Message', onConfirm: () => {} }, labels, both)).toBe(true);
});

test('confirms by body text and by children title', () => {
	expect(shouldAutoConfirm({ body: 'Remove embed?', onConfirm: () => {} }, labels, both)).toBe(true);
	expect(
		shouldAutoConfirm({ children: { props: { title: 'Delete Message' } }, onConfirm: () => {} }, labels, both),
	).toBe(true);
});

test('leaves other alerts, alerts without a confirm, and disabled kinds', () => {
	expect(shouldAutoConfirm({ title: 'Leave server', onConfirm: () => {} }, labels, both)).toBe(false);
	expect(shouldAutoConfirm({ title: 'Delete Message' }, labels, both)).toBe(false);
	expect(
		shouldAutoConfirm({ title: 'Delete Message', onConfirm: () => {} }, labels, { message: false, embed: true }),
	).toBe(false);
});

test('an empty label never matches', () => {
	expect(shouldAutoConfirm({ title: 'anything', onConfirm: () => {} }, { message: '', embed: '' }, both)).toBe(false);
});
