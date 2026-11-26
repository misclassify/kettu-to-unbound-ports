import { patcher } from '@unbound-app/api';

import { patchChannelVisibility, patchHiddenChannelOpen } from '~/patches';

export function start() {
	patchChannelVisibility();
	patchHiddenChannelOpen();
}

export function stop() {
	patcher.unpatchAll();
}
