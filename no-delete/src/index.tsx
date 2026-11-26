import { patcher } from '@unbound-app/api';

import { interceptDeletions } from '~/flux/interceptors';

export function start() {
	interceptDeletions();
}

export function stop() {
	patcher.unpatchAll();
}
