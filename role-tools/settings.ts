import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings({
	iconFormat: setting.choice({
		default: 'png',
		title: 'ICON_FORMAT',
		options: {
			png: { title: 'FORMAT_PNG' },
			webp: { title: 'FORMAT_WEBP' },
			jpg: { title: 'FORMAT_JPG' },
		},
	}),
});
