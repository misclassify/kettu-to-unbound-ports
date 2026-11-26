import { patcher } from '@unbound-app/api';

import { registerLeaveSilent } from '~/commands';

export function start() {
	registerLeaveSilent();
}

export function stop() {
	patcher.unpatchAll();
}
