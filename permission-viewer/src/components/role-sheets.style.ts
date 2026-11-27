import { Discord } from '@unbound-app/api/metro/components';
import { metro } from '@unbound-app/api';

export default Discord.createStyles(() => {
	const { colors } = metro.common.Theme;

	return {
		note: { textAlign: 'center', paddingVertical: 12, paddingHorizontal: 16 },
		hint: { paddingHorizontal: 16 },
		icon: { width: 128, height: 128, borderRadius: 12, alignSelf: 'center' },
		buttons: { gap: 8, paddingHorizontal: 16 },
		card: {
			marginHorizontal: 16,
			borderRadius: 12,
			overflow: 'hidden',
			backgroundColor: colors?.BACKGROUND_SURFACE_HIGH,
		},
		row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
		rowPressed: { backgroundColor: colors?.CONTROL_SECONDARY_BACKGROUND_ACTIVE },
		divider: { borderTopWidth: 1, borderTopColor: colors?.BORDER_SUBTLE },
		dot: { width: 12, height: 12, borderRadius: 6 },
		rowText: { flex: 1 },
	};
});
