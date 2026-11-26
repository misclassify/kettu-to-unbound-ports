import { assets } from '@unbound-app/api';
import { Image } from 'react-native';

import useStyles from '~/components/permissions-sheet.style';

/** A check or cross that shows whether a permission is allowed. */
function StateIcon({ allowed }: { allowed: boolean }) {
	const styles = useStyles();
	const source = assets.getIdByName(allowed ? 'CheckmarkLargeIcon' : 'XLargeIcon');

	return <Image source={source} style={[styles.state, allowed ? styles.allowed : styles.denied]} />;
}

export default StateIcon;
