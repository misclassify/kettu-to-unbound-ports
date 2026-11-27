import { BottomSheets, Discord, GorhomSheet } from '@unbound-app/api/metro/components';
import { flux, metro } from '@unbound-app/api';
import { format, messages } from '@unbound-app/i18n';
import { useEffect } from 'react';

import useStyles from '~/components/role-sheets.style';
import { membersWithRole, requestMembers } from '~/lib/members';

type MembersSheetProps = { guildId: string; roleId: string; roleName: string; onClose: () => void };

type UserLike = { username?: string; globalName?: string | null };

const MemberStore = flux.getStore('GuildMember');
const UserStore = flux.getStore('User') as unknown as { getUser(id: string): UserLike | undefined };

/**
 * @description A sheet listing the loaded members of a server who have a role; pressing one opens their profile.
 * @param props The server, the role and what closes the sheet.
 * @returns The sheet.
 */
function MembersSheet({ guildId, roleId, roleName, onClose }: MembersSheetProps) {
	const styles = useStyles();
	const { ActionSheet, BottomSheetTitleHeader } = BottomSheets;
	const { BottomSheetScrollView: ScrollView } = GorhomSheet;
	const ids = flux.useStore([MemberStore], () => membersWithRole(guildId, roleId));

	useEffect(() => requestMembers(guildId), [guildId]);

	function open(userId: string) {
		onClose();
		metro.findByProps('showUserProfile')?.showUserProfile({ userId, guildId });
	}

	return (
		<ActionSheet scrollable>
			<BottomSheetTitleHeader title={format('MEMBERS_TITLE', { role: roleName })} />
			<ScrollView contentContainerStyle={styles.body}>
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
			</ScrollView>
		</ActionSheet>
	);
}

export default MembersSheet;
