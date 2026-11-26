import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings({
	showPopup: setting.boolean({
		default: true,
		title: 'SHOW_POPUP',
		subtitle: 'SHOW_POPUP_SUBTITLE',
	}),
});
