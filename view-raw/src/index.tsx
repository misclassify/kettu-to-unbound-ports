import { patcher } from '@unbound-app/api';

import { patchMessageSheet } from '~/patches/action-sheets';

export function start() {
	patchMessageSheet();
}

export function stop() {
	patcher.unpatchAll();
}
