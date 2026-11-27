import { patcher } from '@unbound-app/api';

import { fetchCurrentUser } from '~/lib/api';
import { patchGuildMenu, patchGuildSheet, patchUserProfileCard } from '~/patches';

export function start() {
	void fetchCurrentUser();
	patchUserProfileCard();
	patchGuildSheet();
	patchGuildMenu();
}

export function stop() {
	patcher.unpatchAll();
}
