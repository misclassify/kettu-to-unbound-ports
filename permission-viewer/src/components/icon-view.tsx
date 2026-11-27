import { Discord } from '@unbound-app/api/metro/components';
import { messages } from '@unbound-app/i18n';
import { Image, View } from 'react-native';

import useStyles from '~/components/role-sheets.style';
import type { RoleIconFields } from '~/lib/icon';
import { VIEW_SIZE, copyIconLink, roleIconUrl, saveRoleIcon } from '~/lib/save';

/**
 * @description A role's icon with buttons to save it and copy its link. Drawn inside the permissions sheet, under its Back button.
 * @param props The role.
 * @returns The content.
 */
function IconView({ role }: { role: RoleIconFields }) {
	const styles = useStyles();
	const uri = roleIconUrl(role, VIEW_SIZE);

	return (
		<>
			{uri ? <Image source={{ uri }} style={styles.icon} /> : null}
			<View style={styles.buttons}>
				<Discord.Button text={messages.SAVE_ICON} variant='primary' onPress={() => void saveRoleIcon(role)} />
				<Discord.Button text={messages.COPY_ICON_LINK} variant='secondary' onPress={() => copyIconLink(role)} />
			</View>
		</>
	);
}

export default IconView;
