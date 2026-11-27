import { BottomSheets, Discord } from '@unbound-app/api/metro/components';
import { format, messages } from '@unbound-app/i18n';
import { Image, View } from 'react-native';

import useStyles from '~/components/role-sheets.style';
import type { RoleIconFields } from '~/lib/icon';
import { VIEW_SIZE, copyIconLink, roleIconUrl, saveRoleIcon } from '~/lib/save';

type IconSheetProps = { role: RoleIconFields & { name: string }; onClose: () => void };

/**
 * @description Shows a role's icon, with buttons to save it, copy its link and close.
 * @param props The role and what closes the sheet.
 * @returns The sheet.
 */
function IconSheet({ role, onClose }: IconSheetProps) {
	const styles = useStyles();
	const { ActionSheet, BottomSheetTitleHeader } = BottomSheets;
	const uri = roleIconUrl(role, VIEW_SIZE);

	return (
		<ActionSheet>
			<BottomSheetTitleHeader title={format('ICON_TITLE', { role: role.name })} />
			<View style={styles.body}>
				{uri ? <Image source={{ uri }} style={styles.icon} /> : null}
				<View style={styles.buttons}>
					<Discord.Button
						text={messages.SAVE_ICON}
						variant='primary'
						onPress={() => void saveRoleIcon(role)}
					/>
					<Discord.Button
						text={messages.COPY_ICON_LINK}
						variant='secondary'
						onPress={() => copyIconLink(role)}
					/>
					<Discord.Button text={messages.CLOSE} variant='secondary' onPress={onClose} />
				</View>
			</View>
		</ActionSheet>
	);
}

export default IconSheet;
