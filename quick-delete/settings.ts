import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings({
	autoConfirmMessage: setting.boolean({
		default: true,
		title: 'MESSAGES',
		subtitle: 'MESSAGES_SUBTITLE',
	}),
	autoConfirmEmbed: setting.boolean({
		default: true,
		title: 'EMBEDS',
		subtitle: 'EMBEDS_SUBTITLE',
	}),
});
