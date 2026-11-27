import { format, messages } from '@unbound-app/i18n';
import { metro, toasts } from '@unbound-app/api';

import { roleHex } from '~/lib/perms';

type RoleFields = { color?: number; unicodeEmoji?: string | null };

function toast(content: string): void {
	toasts.show({ title: messages.ROLE_MENU_TITLE, content });
}

/**
 * @description Copies a role's color as a hex code, or says the role has none.
 * @param role The role.
 */
export function copyColor(role: RoleFields): void {
	const hex = roleHex(role.color);

	if (!hex) return toast(messages.NO_COLOR_TOAST);

	metro.common.Clipboard.setString(hex);
	toast(format('COPIED_COLOR', { color: hex }));
}

/**
 * @description Copies the Unicode emoji a role uses as its icon.
 * @param role The role.
 */
export function copyEmoji(role: RoleFields): void {
	const emoji = role.unicodeEmoji;

	if (!emoji) return;

	metro.common.Clipboard.setString(emoji);
	toast(format('COPIED_EMOJI', { emoji }));
}
