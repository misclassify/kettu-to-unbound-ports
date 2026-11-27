import { Discord } from '@unbound-app/api/metro/components';
import { metro } from '@unbound-app/api';

export default Discord.createStyles(() => {
	const { colors } = metro.common.Theme;

	return {
		body: { gap: 16, paddingTop: 8, paddingBottom: 16 },
		note: { textAlign: 'center', paddingHorizontal: 16, paddingVertical: 8 },
		back: { alignSelf: 'flex-start', marginHorizontal: 16 },
		state: { width: 20, height: 20 },
		allowed: { tintColor: colors?.TEXT_FEEDBACK_POSITIVE },
		denied: { tintColor: colors?.TEXT_FEEDBACK_CRITICAL },
	};
});
