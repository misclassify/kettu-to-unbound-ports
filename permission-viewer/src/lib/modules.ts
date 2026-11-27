import { flux, metro } from '@unbound-app/api';

import { titleCase, type Bits } from '~/lib/perms';

export const { Constants } = metro.common;

export const GuildStore = flux.getStore('Guild');
export const GuildRoleStore = flux.getStore('GuildRole') as unknown as {
	getRole?(guildId: string, roleId: string): Role | undefined;
	getSortedRoles?(guildId: string): Role[] | undefined;
	getRolesSnapshot?(guildId: string): Record<string, Role> | undefined;
};
export const GuildMemberStore = flux.getStore('GuildMember') as unknown as {
	getMember(guildId: string, userId: string): { nick?: string | null; roles?: string[] } | undefined;
};
export const ChannelStore = flux.getStore('Channel') as unknown as {
	getChannel(id: string): Channel | undefined;
};
export const UserStore = flux.getStore('User') as unknown as {
	getUser(id: string): { username?: string; globalName?: string | null } | undefined;
};

export type Role = {
	id: string;
	name: string;
	color?: number;
	position?: number;
	permissions?: unknown;
	icon?: string | null;
	unicodeEmoji?: string | null;
};

export type Channel = {
	id: string;
	name?: string;
	guild_id?: string;
	permissionOverwrites?: unknown;
};

/**
 * @description Reads Discord's permission flags as bigints.
 * @returns Each flag by name, or an empty object when Discord moved its constants.
 */
export function permissionBits(): Bits {
	const flags = (Constants?.Permissions ?? {}) as Record<string, unknown>;
	const bits: Bits = {};

	for (const [name, value] of Object.entries(flags)) {
		if (typeof value === 'bigint') bits[name] = value;
	}

	return bits;
}

const getPermissionName = metro.findByProps('getPermissionName')?.getPermissionName as
	| ((bit: bigint) => string | undefined)
	| undefined;

/**
 * @description Names a permission the way Discord does in the user's language, or in words when Discord has no text for it.
 * @param name The flag name.
 * @param bits Discord's flags.
 * @returns The label.
 */
export function permissionLabel(name: string, bits: Bits): string {
	const bit = bits[name];

	if (bit !== undefined && getPermissionName) {
		try {
			const text = getPermissionName(bit);

			if (text) return text;
		} catch {
			// Discord has no text for this flag, so the words stand in.
		}
	}

	return titleCase(name);
}
