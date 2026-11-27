import { Discord } from '@unbound-app/api/metro/components';

export default Discord.createStyles({
	body: { gap: 16, paddingTop: 8, paddingBottom: 16 },
	note: { textAlign: 'center', paddingVertical: 12, paddingHorizontal: 16 },
	icon: { width: 128, height: 128, borderRadius: 12, alignSelf: 'center' },
	buttons: { gap: 8, paddingHorizontal: 16 },
});
