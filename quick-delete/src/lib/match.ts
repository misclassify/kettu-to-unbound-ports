/** A legacy alert as Discord's alert module takes it; every field is checked before it is read. */
export type Popup = {
	onConfirm?: unknown;
	body?: unknown;
	title?: unknown;
	children?: { props?: { title?: unknown } };
};

/** The Discord strings that identify each kind of delete confirmation, in the user's language. */
export type Labels = { message: string; embed: string };

/** Which confirmations the user wants skipped. */
export type Enabled = { message: boolean; embed: boolean };

function mentions(popup: Popup, label: string): boolean {
	if (!label) return false;

	const title = popup.children?.props?.title ?? popup.title;
	const { body } = popup;

	return (
		(typeof title === 'string' && title.includes(label)) ||
		(typeof body === 'string' && body.includes(label))
	);
}

/**
 * @description Decides whether an alert is a delete confirmation the user wants skipped. Like Kettu's plugin, it matches
 * Discord's "Delete Message" or "Remove embed" text in the alert's title or body, so only alerts with a confirm action count.
 * @param popup The alert's options.
 * @param labels Discord's text for each kind of confirmation.
 * @param enabled Which kinds the user turned on.
 * @returns True when the alert should be confirmed instead of shown.
 */
export function shouldAutoConfirm(popup: Popup | undefined, labels: Labels, enabled: Enabled): boolean {
	if (!popup || typeof popup.onConfirm !== 'function') return false;

	const hasText = typeof popup.title === 'string' || typeof popup.body === 'string' || typeof popup.children?.props?.title === 'string';

	if (!hasText) return false;

	return (
		(enabled.message && mentions(popup, labels.message)) || (enabled.embed && mentions(popup, labels.embed))
	);
}
