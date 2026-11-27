import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings({
	roleMenu: setting.boolean({
		default: true,
		title: 'ROLE_MENU',
		subtitle: 'ROLE_MENU_SUBTITLE',
	}),
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
