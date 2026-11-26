import { defineSettings, setting } from '@unbound-app/settings/schema';

export default defineSettings({
	display: setting.section(
		{ title: 'DISPLAY' },
		{
			timestamps: setting.boolean({
				default: false,
				title: 'TIMESTAMPS',
				subtitle: 'TIMESTAMPS_SUBTITLE',
			}),
			twelveHour: setting.boolean({
				default: false,
				title: 'TWELVE_HOUR',
				subtitle: 'TWELVE_HOUR_SUBTITLE',
			}),
		},
	),
	filters: setting.section(
		{ title: 'FILTERS' },
		{
			ignoreBots: setting.boolean({
				default: false,
				title: 'IGNORE_BOTS',
				subtitle: 'IGNORE_BOTS_SUBTITLE',
			}),
			ignoredUsers: setting.string({
				default: '',
				displayAs: 'multiline',
				title: 'IGNORED_USERS',
				subtitle: 'IGNORED_USERS_SUBTITLE',
				placeholder: 'IGNORED_USERS_PLACEHOLDER',
			}),
		},
	),
});
