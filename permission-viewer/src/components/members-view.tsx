import { Discord } from '@unbound-app/api/metro/components';
import { flux, metro } from '@unbound-app/api';
import { messages } from '@unbound-app/i18n';
import { useEffect } from 'react';

import useStyles from '~/components/role-sheets.style';
import { membersWithRole, requestMembers } from '~/lib/members';

type UserLike = { username?: string; globalName?: string | null };

const MemberStore = flux.getStore('GuildMember');
const UserStore = flux.getStore('User') as unknown as { getUser(id: string): UserLike | undefined };

/**
 * @description The loaded members of a server who have a role; pressing one closes the sheet and opens their profile.
 * @param props The server, the role and what closes the sheet.
 * @returns The content.
 */
function MembersView({ guildId, roleId, onClose }: { guildId: string; roleId: string; onClose: () => void }) {
	const styles = useStyles();
	const ids = flux.useStore([MemberStore], () => membersWithRole(guildId, roleId));

	useEffect(() => requestMembers(guildId), [guildId]);

	function open(userId: string) {
		onClose();
		metro.findByProps('showUserProfile')?.showUserProfile({ userId, guildId });
	}

	return (
		<>
			{ids.length ? (
				<Discord.TableRowGroup>
					{ids.map((id) => {
						const user = UserStore.getUser(id);

						return (
							<Discord.TableRow
								key={id}
								label={user?.globalName || user?.username || id}
								subLabel={user?.username}
								arrow
								onPress={() => open(id)}
							/>
						);
					})}
				</Discord.TableRowGroup>
			) : null}
			<Discord.Text variant='text-sm/medium' color='text-muted' style={styles.note}>
				{ids.length ? messages.LOADED_ONLY : messages.NO_MEMBERS}
			</Discord.Text>
		</>
	);
}

export default MembersView;
