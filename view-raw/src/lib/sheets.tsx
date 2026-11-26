import { messages } from '@unbound-app/i18n';
import { metro, toasts } from '@unbound-app/api';

import RawSheet from '~/components/raw-sheet';
import { ActionSheets } from '~/lib/modules';

function copy(value: string, content: string) {
	void Promise.resolve(metro.common.Clipboard.setString(value)).then(() =>
		toasts.show({ title: messages.VIEW_RAW, content }),
	);
}

/**
 * @description Opens the sheet that shows a message's raw JSON, with buttons to copy it.
 * @param json The cleaned message as pretty JSON.
 * @param content The message's text, or an empty string.
 */
export function openRawSheet(json: string, content: string): void {
	const key = `view-raw-${Date.now()}`;
	const close = () => ActionSheets.hideActionSheet(key);

	ActionSheets.openLazy(
		Promise.resolve({
			default: () => <RawSheet json={json} content={content} onCopy={copy} onClose={close} />,
		}),
		key,
		{ onClose: close },
		{ initialSnapIndex: 1 },
	);
}
