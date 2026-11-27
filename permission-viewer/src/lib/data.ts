import { messages } from '@unbound-app/i18n';

import {
	decodeOverwrite,
	has,
	highestGranting,
	memberPermissions,
	sortRoles,
	type Bits,
	type Overwrite,
} from '~/lib/perms';
import {
	ChannelStore,
	GuildMemberStore,
	GuildRoleStore,
	GuildStore,
	UserStore,
	permissionBits,
	type Role,
} from '~/lib/modules';

/**
 * @description Lists a server's roles from the highest down, from the role store or, on older builds, its snapshot.
 * @param guildId The server.
 * @returns The roles, `@everyone` included.
 */
export function guildRoles(guildId: string): Role[] {
	const sorted = GuildRoleStore.getSortedRoles?.(guildId);

	if (Array.isArray(sorted)) return sorted;

	return sortRoles(Object.values(GuildRoleStore.getRolesSnapshot?.(guildId) ?? {}));
}

/**
 * @description Reads one role.
 * @param guildId The server.
 * @param roleId The role.
 * @returns The role, or undefined when it is gone.
 */
export function getRole(guildId: string, roleId: string): Role | undefined {
	return GuildRoleStore.getRole?.(guildId, roleId) ?? guildRoles(guildId).find((role) => role.id === roleId);
}

/**
 * @description A member's display name: nickname, then global name, then username.
 * @param guildId The server.
 * @param userId The member.
 * @returns The name.
 */
export function memberName(guildId: string, userId: string): string {
	const user = UserStore.getUser(userId);

	return GuildMemberStore.getMember(guildId, userId)?.nick || user?.globalName || user?.username || messages.UNKNOWN_USER;
}

/** What the member sheet shows. */
export type MemberData = {
	name: string;
	roles: Role[];
	isOwner: boolean;
	isAdmin: boolean;
	has: (flag: string) => boolean;
	grantedBy: (flag: string) => Role | undefined;
	bits: Bits;
};

/**
 * @description Works out a member's permissions from their roles.
 * @param guildId The server.
 * @param userId The member.
 * @returns The data, or undefined when the user is not a member the client knows.
 */
export function memberData(guildId: string, userId: string): MemberData | undefined {
	const member = GuildMemberStore.getMember(guildId, userId);
	const guild = GuildStore.getGuild(guildId) as { ownerId?: string } | undefined;

	if (!member) return undefined;

	const bits = permissionBits();
	const everyone = getRole(guildId, guildId);
	const own = (member.roles ?? []).map((id) => getRole(guildId, id)).filter((role): role is Role => Boolean(role));
	const all = everyone ? [everyone, ...own] : own;
	const isOwner = guild?.ownerId === userId;
	const permissions = memberPermissions(all, isOwner, bits);
	const isAdmin = bits.ADMINISTRATOR !== undefined && has(permissions, bits.ADMINISTRATOR) && !isOwner;

	return {
		name: memberName(guildId, userId),
		roles: sortRoles(own),
		isOwner,
		isAdmin,
		bits,
		has: (flag) => bits[flag] !== undefined && has(permissions, bits[flag]),
		grantedBy: (flag) => (bits[flag] === undefined ? undefined : highestGranting(all, bits[flag])),
	};
}

export type OverwriteEntry = {
	id: string;
	name: string;
	allowed: string[];
	denied: string[];
};

/** What the channel sheet shows. */
export type ChannelData = {
	name: string;
	roles: OverwriteEntry[];
	members: OverwriteEntry[];
	bits: Bits;
};

function overwritesOf(channel: { permissionOverwrites?: unknown }): Overwrite[] {
	const raw = channel.permissionOverwrites;

	if (Array.isArray(raw)) return raw as Overwrite[];

	return raw && typeof raw === 'object' ? (Object.values(raw) as Overwrite[]) : [];
}

/**
 * @description Reads a channel's permission overwrites, split into roles and members.
 * @param channelId The channel.
 * @returns The data, or undefined when the channel is unknown or not in a server.
 */
export function channelData(channelId: string): ChannelData | undefined {
	const channel = ChannelStore.getChannel(channelId);

	if (!channel?.guild_id) return undefined;

	const bits = permissionBits();
	const guildId = channel.guild_id;
	const entries = overwritesOf(channel);

	return {
		name: channel.name ?? '',
		bits,
		roles: entries
			.filter((entry) => entry.type === 0)
			.map((entry) => ({
				id: entry.id,
				name: getRole(guildId, entry.id)?.name ?? messages.UNKNOWN_ROLE,
				...decodeOverwrite(entry, bits),
			})),
		members: entries
			.filter((entry) => entry.type === 1)
			.map((entry) => ({
				id: entry.id,
				name: memberName(guildId, entry.id),
				...decodeOverwrite(entry, bits),
			})),
	};
}
