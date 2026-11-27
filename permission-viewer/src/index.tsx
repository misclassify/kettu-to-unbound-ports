import { patcher } from '@unbound-app/api';

import { patchActionSheets } from '~/patches/action-sheets';
import { patchContextMenus } from '~/patches/context-menus';
import { patchRolePills } from '~/patches/role-pills';

export function start() {
	patchActionSheets();
	patchContextMenus();
	patchRolePills();
}

export function stop() {
	patcher.unpatchAll();
}
