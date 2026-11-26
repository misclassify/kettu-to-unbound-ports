import PermissionsSheet from '~/components/permissions-sheet';
import { ChannelStore, GuildMemberStore, GuildStore } from '~/lib/modules';
import { openSheet } from '~/vendor/action-sheets/open-sheet';
import type { Target } from '~/lib/targets';

/**
 * @description Whether a target has something to show: a server the client knows, a member it has loaded,
 * or a channel in a server.
 * @param target The target.
 * @returns True when the row should be offered.
 */
export function hasView(target: Target): boolean {
	if (target.kind === 'guild') return Boolean(GuildStore.getGuild(target.guildId));

	if (target.kind === 'member') return Boolean(GuildMemberStore.getMember(target.guildId, target.userId));

	return Boolean(ChannelStore.getChannel(target.channelId)?.guild_id);
}

/**
 * @description Opens the permissions sheet for a target.
 * @param target A server, channel or member.
 */
export function openTarget(target: Target): void {
	openSheet(`permission-viewer-${Date.now()}`, PermissionsSheet, { target });
}
