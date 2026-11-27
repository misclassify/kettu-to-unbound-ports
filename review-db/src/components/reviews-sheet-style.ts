import { Discord } from '@unbound-app/api/metro/components';
import { metro } from '@unbound-app/api';

export default Discord.createStyles(() => {
	const { colors } = metro.common.Theme;

	return {
		list: { paddingHorizontal: 16, paddingBottom: 32, rowGap: 8 },
		empty: { alignItems: 'center', rowGap: 4, paddingVertical: 24 },
		composer: { rowGap: 12, paddingTop: 8 },
		row: { flexDirection: 'row', columnGap: 12, paddingVertical: 8 },
		avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors?.BACKGROUND_MOD_SUBTLE },
		body: { flex: 1, rowGap: 2 },
		header: { flexDirection: 'row', alignItems: 'center', columnGap: 6, flexWrap: 'wrap' },
		name: { flexShrink: 1 },
	};
});
