import { Discord } from '@unbound-app/api/metro/components';
import { flux, metro, patcher, toasts } from '@unbound-app/api';
import { format, messages } from '@unbound-app/i18n';
import { isValidElement, type ReactElement } from 'react';
import { settings } from '@unbound-app/settings';

import IconSheet from '~/components/icon-sheet';
import MembersSheet from '~/components/members-sheet';
import { roleHex } from '~/lib/perms';
import { hasImageIcon } from '~/lib/icon';
import { saveRoleIcon } from '~/lib/save';
import { openSheet } from '~/lib/open-sheet';
import { openTarget } from '~/lib/open';

const ROLES_CARD = 'modules/user_profile/native/UserProfileRolesCard.tsx';
const MENU_KEY = 'permission-viewer-role';

type Role = {
	id: string;
	name: string;
	color?: number;
	icon?: string | null;
	unicodeEmoji?: string | null;
};

type RolePillProps = { role?: Role; guildId?: string };

type Pressable = ReactElement<{ onLongPress?: () => void }>;

type RoleItemComponent = (props: RolePillProps) => ReactElement | null;

type AnyComponent = (props: object) => unknown;

type RoleStore = { getRole?(guildId: string, roleId: string): Role | undefined };

/** The pill's role may carry fewer fields than the role store's, so the stored one fills in the icon. */
function fullRole(role: Role, guildId: string): Role {
	const stored = (flux.getStore('GuildRole') as unknown as RoleStore).getRole?.(guildId, role.id);

	return { ...role, ...stored };
}

function toast(content: string): void {
	toasts.show({ title: messages.ROLE_MENU_TITLE, content });
}

function copyColor(role: Role): void {
	const hex = roleHex(role.color);

	if (!hex) return toast(messages.NO_COLOR_TOAST);

	metro.common.Clipboard.setString(hex);
	toast(format('COPIED_COLOR', { color: hex }));
}

function iconOptions(role: Role) {
	if (hasImageIcon(role)) {
		return [
			{
				label: messages.VIEW_ICON,
				onPress: () => openSheet(`${MENU_KEY}-icon`, IconSheet, { role }),
			},
			{ label: messages.SAVE_ICON, onPress: () => void saveRoleIcon(role) },
		];
	}

	if (role.unicodeEmoji) {
		const emoji = role.unicodeEmoji;

		return [
			{
				label: messages.COPY_EMOJI,
				onPress: () => {
					metro.common.Clipboard.setString(emoji);
					toast(format('COPIED_EMOJI', { emoji }));
				},
			},
		];
	}

	return [];
}

function openRoleMenu(pillRole: Role, guildId: string): void {
	const role = fullRole(pillRole, guildId);

	Discord.showSimpleActionSheet({
		key: MENU_KEY,
		header: { title: role.name },
		options: [
			{
				label: messages.VIEW_ROLE_PERMISSIONS,
				onPress: () => openTarget({ kind: 'guild', guildId, roleId: role.id }),
			},
			{ label: messages.COPY_COLOR, onPress: () => copyColor(role) },
			...iconOptions(role),
			{
				label: messages.VIEW_MEMBERS,
				onPress: () =>
					openSheet(`${MENU_KEY}-members`, MembersSheet, {
						guildId,
						roleId: role.id,
						roleName: role.name,
					}),
			},
		],
	});
}

const pillWrappers = new WeakMap<RoleItemComponent, RoleItemComponent>();

function withLongPress(RoleItem: RoleItemComponent): RoleItemComponent {
	const existing = pillWrappers.get(RoleItem);

	if (existing) return existing;

	const Wrapped: RoleItemComponent = (props) => {
		const result = RoleItem(props);
		const { role, guildId } = props;

		if (!settings.roleMenu || !role || !guildId || !isValidElement(result)) return result;

		const pressable = result as Pressable;

		return {
			...pressable,
			props: { ...pressable.props, onLongPress: () => openRoleMenu(role, guildId) },
		};
	};

	pillWrappers.set(RoleItem, Wrapped);

	return Wrapped;
}

function isRoleItem(node: unknown): node is ReactElement<RolePillProps> {
	if (!isValidElement(node) || typeof node.type !== 'function') return false;

	const props = node.props as RolePillProps;

	return Boolean(props.role?.id && props.guildId);
}

function isRolesList(node: unknown): node is ReactElement<{ guildMemberRoleIds?: unknown }> {
	return (
		isValidElement(node) &&
		typeof node.type === 'function' &&
		Array.isArray((node.props as { guildMemberRoleIds?: unknown }).guildMemberRoleIds)
	);
}

const listWrappers = new WeakMap<AnyComponent, AnyComponent>();

function withWrappedItems(List: AnyComponent): AnyComponent {
	const existing = listWrappers.get(List);

	if (existing) return existing;

	const Wrapped: AnyComponent = (props) => wrapRoleItems(List(props));

	listWrappers.set(List, Wrapped);

	return Wrapped;
}

function wrapRoleItems(node: unknown, depth = 0): unknown {
	if (depth > 8 || !isValidElement(node)) return node;

	if (isRoleItem(node)) return { ...node, type: withLongPress(node.type as RoleItemComponent) };

	if (isRolesList(node)) return { ...node, type: withWrappedItems(node.type as AnyComponent) };

	const { children } = node.props as { children?: unknown };

	if (children === undefined) return node;

	const next = Array.isArray(children)
		? children.map((child) => wrapRoleItems(child, depth + 1))
		: wrapRoleItems(children, depth + 1);

	return { ...node, props: { ...(node.props as object), children: next } };
}

/**
 * @description Long-pressing a role on a profile opens a menu while the Role menu setting is on: View Role Permissions, Copy Role Color,
 * View and Save Role Icon (or Copy Role Emoji), and View Members. Patches the render of Discord's profile roles card and gives each role pill a long-press.
 * Vencord's "Edit Role" is left out: it opens desktop server settings, which phones don't have.
 */
export function patchRolePills(): void {
	const RolesCard = metro.findByFilePath(ROLES_CARD);

	if (typeof RolesCard?.default !== 'function') {
		logger.warn('Role menu skipped: Discord moved the profile roles card.');

		return;
	}

	patcher.after(RolesCard, 'default', ({ result }) => wrapRoleItems(result));
}
