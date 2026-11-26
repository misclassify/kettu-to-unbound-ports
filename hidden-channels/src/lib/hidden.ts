import { flux, metro } from '@unbound-app/api';

/** Discord's channel types that never hide: DMs, group DMs and categories. */
const SKIPPED_TYPES = new Set([1, 3, 4]);

/** `VIEW_CHANNEL` is bit 10 of Discord's permission flags. */
const VIEW_CHANNEL_FALLBACK = 1n << 10n;

/** The channel the real permission check is running for, so our own patch doesn't answer it. */
const realChecks = new WeakSet<object>();

/**
 * @description Discord's `VIEW_CHANNEL` flag.
 * @returns The flag from Discord's constants, or bit 10 when the constants moved.
 */
export function viewChannelFlag(): bigint {
	return metro.common.Constants?.Permissions?.VIEW_CHANNEL ?? VIEW_CHANNEL_FALLBACK;
}

/**
 * @description Whether our patch should answer a permission check instead of Discord.
 * @param flag The permission asked about.
 * @param channel The channel it is asked for.
 * @returns True for a `VIEW_CHANNEL` check that is not the plugin's own real check.
 */
export function shouldForceView(flag: unknown, channel: unknown): boolean {
	return flag === viewChannelFlag() && !(typeof channel === 'object' && channel && realChecks.has(channel));
}

/**
 * @description Whether the user really lacks permission to see a channel, asking Discord's unpatched check.
 * @param channelOrId A channel, or its id.
 * @returns True when Discord would hide it.
 */
export function isHidden(channelOrId: unknown): boolean {
	const Permissions = metro.findByProps('getChannelPermissions', 'can', { lazy: false });
	const channel =
		typeof channelOrId === 'string' ? flux.getStore('Channel').getChannel(channelOrId) : (channelOrId as any);

	if (!Permissions || !channel || SKIPPED_TYPES.has(channel.type)) return false;

	realChecks.add(channel);

	try {
		return !Permissions.can(viewChannelFlag(), channel);
	} finally {
		realChecks.delete(channel);
	}
}

/**
 * @description Reads a Discord snowflake's creation time.
 * @param id The snowflake.
 * @returns The time it was created.
 */
export function snowflakeDate(id: string): Date {
	return new Date(Number((BigInt(id) >> 22n) + 1420070400000n));
}

/**
 * @description Describes a hidden channel for the popup.
 * @param channel The channel.
 * @returns The popup's body text.
 */
export function describeChannel(channel: {
	topic?: string | null;
	id: string;
	lastMessageId?: string | null;
	lastPinTimestamp?: string | null;
}): string {
	const when = (date: Date) => date.toLocaleString();

	return [
		`Topic: ${channel.topic || 'No topic.'}`,
		`Created: ${when(snowflakeDate(channel.id))}`,
		`Last message: ${channel.lastMessageId ? when(snowflakeDate(channel.lastMessageId)) : 'No messages.'}`,
		`Last pin: ${channel.lastPinTimestamp ? when(new Date(channel.lastPinTimestamp)) : 'No pins.'}`,
	].join('\n\n');
}
