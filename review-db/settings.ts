import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings(
	{
		token: setting.string({ default: '', hidden: true }),
		showWarning: setting.boolean({
			default: true,
			title: 'SHOW_WARNING',
			subtitle: 'SHOW_WARNING_SUBTITLE',
		}),
		account: setting.section(
			{ title: 'ACCOUNT' },
			{
				authorize: setting.button({
					title: 'AUTHORIZE',
					subtitle: 'AUTHORIZE_SUBTITLE',
					action: 'authorize',
					visibleWhen: (settings) => !settings.token,
				}),
				logout: setting.button({
					title: 'LOG_OUT',
					subtitle: 'LOG_OUT_SUBTITLE',
					action: 'logout',
					visibleWhen: (settings) => Boolean(settings.token),
				}),
				viewMyReviews: setting.button({
					title: 'VIEW_MY_REVIEWS',
					action: 'viewMyReviews',
				}),
			},
		),
	},
	{ title: 'PREFERENCES' },
);
