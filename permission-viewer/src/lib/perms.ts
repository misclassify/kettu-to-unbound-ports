/** Discord's permission flags by name, such as `{ ADMINISTRATOR: 8n }`. */
export type Bits = Record<string, bigint>;

export type RoleLike = {
	id: string;
	name?: string;
	color?: number;
	position?: number;
	permissions?: unknown;
};

export type Overwrite = { id: string; type?: number; allow?: unknown; deny?: unknown };

export type Category = { name: string; permissions: string[] };

/** The groups Kettu's PermissionViewer shows, plus the flags newer Discord builds added. */
export const CATEGORIES: readonly Category[] = [
	{ name: 'General', permissions: ['ADMINISTRATOR', 'VIEW_AUDIT_LOG', 'MANAGE_GUILD', 'VIEW_GUILD_ANALYTICS'] },
	{
		name: 'Text',
		permissions: [
			'SEND_MESSAGES',
			'MANAGE_MESSAGES',
			'PIN_MESSAGES',
			'BYPASS_SLOWMODE',
			'MENTION_EVERYONE',
			'ATTACH_FILES',
			'ADD_REACTIONS',
			'SEND_TTS_MESSAGES',
			'USE_EXTERNAL_EMOJI',
			'USE_EXTERNAL_STICKERS',
			'USE_EXTERNAL_SOUNDS',
			'SEND_VOICE_MESSAGES',
			'SEND_POLLS',
			'EMBED_LINKS',
			'READ_MESSAGE_HISTORY',
			'USE_APPLICATION_COMMANDS',
			'USE_EXTERNAL_APPS',
		],
	},
	{
		name: 'Voice',
		permissions: [
			'CONNECT',
			'SPEAK',
			'MUTE_MEMBERS',
			'DEAFEN_MEMBERS',
			'MOVE_MEMBERS',
			'USE_VAD',
			'PRIORITY_SPEAKER',
			'STREAM',
			'USE_SOUNDBOARD',
			'USE_EMBEDDED_ACTIVITIES',
			'REQUEST_TO_SPEAK',
		],
	},
	{
		name: 'Channel',
		permissions: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'CREATE_INSTANT_INVITE', 'CREATE_EVENTS'],
	},
	{ name: 'Members', permissions: ['KICK_MEMBERS', 'BAN_MEMBERS', 'MODERATE_MEMBERS'] },
	{ name: 'Roles', permissions: ['MANAGE_ROLES', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES'] },
	{ name: 'Expressions', permissions: ['CREATE_GUILD_EXPRESSIONS', 'MANAGE_GUILD_EXPRESSIONS'] },
	{
		name: 'Misc',
		permissions: [
			'MANAGE_THREADS',
			'CREATE_PUBLIC_THREADS',
			'CREATE_PRIVATE_THREADS',
			'SEND_MESSAGES_IN_THREADS',
			'MANAGE_EVENTS',
			'VIEW_CREATOR_MONETIZATION_ANALYTICS',
			'USE_CREATED_WEBHOOKS',
		],
	},
];

/** The groups that apply to a channel overwrite, as in Kettu: server-wide ones such as Members never do. A flag Discord adds later (Other) is kept, since it only shows when set. */
const OVERWRITE_CATEGORIES = new Set(['Text', 'Voice', 'Channel', 'Roles', 'Expressions', 'Misc', 'Other']);

/**
 * @description Converts a permission value Discord stores as a number, string or bigint.
 * @param value The stored value.
 * @returns The bigint, or 0n when it is missing or malformed.
 */
export function toBigInt(value: unknown): bigint {
	if (typeof value === 'bigint') return value;

	if (typeof value !== 'string' && typeof value !== 'number') return 0n;

	try {
		return BigInt(value);
	} catch {
		return 0n;
	}
}

/**
 * @description Whether a permission set contains a flag.
 * @param perms The set.
 * @param flag The flag.
 * @returns True when every bit of the flag is set.
 */
export function has(perms: bigint, flag: bigint): boolean {
	return flag !== 0n && (perms & flag) === flag;
}

/**
 * @description Keeps the categories' permissions that this Discord build has, and adds any flag in none of them
 * to a final group, so a flag Discord adds later still shows.
 * @param bits Discord's flags.
 * @param other The name of the final group.
 * @returns The non-empty groups.
 */
export function categorize(bits: Bits, other = 'Other'): Category[] {
	const known = new Set(CATEGORIES.flatMap((category) => category.permissions));
	const groups = CATEGORIES.map((category) => ({
		name: category.name,
		permissions: category.permissions.filter((name) => bits[name] !== undefined),
	}));
	const leftovers = Object.keys(bits).filter((name) => !known.has(name));

	return [...groups, { name: other, permissions: leftovers }].filter((group) => group.permissions.length > 0);
}

/**
 * @description The permission names a channel overwrite can set.
 * @param bits Discord's flags.
 * @returns The names, in category order.
 */
export function overwriteNames(bits: Bits): string[] {
	return categorize(bits)
		.filter((category) => OVERWRITE_CATEGORIES.has(category.name))
		.flatMap((category) => category.permissions);
}

/**
 * @description Reads what an overwrite allows and denies.
 * @param overwrite The overwrite.
 * @param bits Discord's flags.
 * @returns The allowed and denied permission names.
 */
export function decodeOverwrite(overwrite: Overwrite, bits: Bits): { allowed: string[]; denied: string[] } {
	const allow = toBigInt(overwrite.allow);
	const deny = toBigInt(overwrite.deny);
	const names = overwriteNames(bits);

	return {
		allowed: names.filter((name) => has(allow, bits[name])),
		denied: names.filter((name) => has(deny, bits[name])),
	};
}

/**
 * @description Adds up the permissions of a member's roles. The owner and any administrator have every permission,
 * which is how Discord and Vencord's PermissionsViewer treat them.
 * @param roles The member's roles, with `@everyone`.
 * @param isOwner Whether the member owns the server.
 * @param bits Discord's flags.
 * @returns The member's permissions.
 */
export function memberPermissions(roles: readonly RoleLike[], isOwner: boolean, bits: Bits): bigint {
	const all = Object.values(bits).reduce((sum, flag) => sum | flag, 0n);

	if (isOwner) return all;

	const combined = roles.reduce((sum, role) => sum | toBigInt(role.permissions), 0n);

	return bits.ADMINISTRATOR !== undefined && has(combined, bits.ADMINISTRATOR) ? all : combined;
}

/**
 * @description Sorts roles from the highest position down.
 * @param roles The roles.
 * @returns A sorted copy.
 */
export function sortRoles<T extends RoleLike>(roles: readonly T[]): T[] {
	return [...roles].sort((left, right) => (right.position ?? 0) - (left.position ?? 0));
}

/**
 * @description The highest role that grants a permission.
 * @param roles The roles to look through, in any order.
 * @param flag The permission flag.
 * @returns The role, or undefined when none grants it.
 */
export function highestGranting<T extends RoleLike>(roles: readonly T[], flag: bigint): T | undefined {
	return sortRoles(roles).find((role) => has(toBigInt(role.permissions), flag));
}

/**
 * @description Writes a role color as a hex code.
 * @param color The color as an integer, 0 for none.
 * @returns `#RRGGBB`, or undefined when the role has no color.
 */
export function roleHex(color: number | null | undefined): string | undefined {
	return color ? `#${color.toString(16).padStart(6, '0').toUpperCase()}` : undefined;
}

/**
 * @description Writes a permission's name in words when Discord has no text for it.
 * @param name The flag name, like `USE_EXTERNAL_EMOJI`.
 * @returns For example `Use External Emoji`.
 */
export function titleCase(name: string): string {
	return name
		.split('_')
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(' ');
}
