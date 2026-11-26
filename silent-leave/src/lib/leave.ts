/** Discord's channel type for a group DM. */
export const GROUP_DM = 3;

/**
 * @description Builds the endpoint that removes you from a channel.
 * @param channelId The group DM's id.
 * @returns The API path.
 */
export function leaveUrl(channelId: string): string {
	return `/channels/${channelId}`;
}
