import { Discord } from '@unbound-app/api/metro/components';
import { messages } from '@unbound-app/i18n';
import { Pressable, View } from 'react-native';

import useStyles from '~/components/role-sheets.style';
import type { Role } from '~/lib/modules';
import { roleHex } from '~/lib/perms';

type RoleRowProps = {
	role: Role;
	first: boolean;
	onPress: () => void;
	/** Left out when the Role menu setting is off. */
	onLongPress?: () => void;
};

/**
 * @description One role in the server's list: a dot in its color, its name and color code. Tapping opens its permissions
 * and holding opens its options. Discord's table rows have no long-press, so this draws the row itself.
 * @param props The role and what the presses do.
 * @returns The row.
 */
function RoleRow({ role, first, onPress, onLongPress }: RoleRowProps) {
	const styles = useStyles();
	const hex = roleHex(role.color);

	return (
		<Pressable
			accessibilityRole='button'
			delayLongPress={350}
			onPress={onPress}
			onLongPress={onLongPress}
			style={({ pressed }) => [styles.row, !first && styles.divider, pressed && styles.rowPressed]}
		>
			<View style={[styles.dot, { backgroundColor: hex ?? '#99AAB5' }]} />
			<View style={styles.rowText}>
				<Discord.Text variant='text-md/semibold' color='text-strong' numberOfLines={1}>
					{role.name}
				</Discord.Text>
				<Discord.Text variant='text-sm/normal' color='text-muted'>
					{hex ?? messages.NO_COLOR}
				</Discord.Text>
			</View>
			<Discord.TableRow.Arrow />
		</Pressable>
	);
}

export default RoleRow;
