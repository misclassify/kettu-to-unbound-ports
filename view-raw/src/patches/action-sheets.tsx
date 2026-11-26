import { getActionSheetRow } from '~/vendor/action-sheets/action-sheet-row';
import { patchLazySheets } from '~/vendor/action-sheets/patch-lazy-sheets';
import { createSheetRenderer } from '~/vendor/action-sheets/sheet-renderer';
import { isActionSheetRowGroup } from '~/vendor/action-sheets/row-group';
import { findElement, isElementNode } from '~/vendor/react/find-element';
import { messages } from '@unbound-app/i18n';
import { patcher } from '@unbound-app/api';

import RawIcon from '~/components/raw-icon';
import { ActionSheets } from '~/lib/modules';
import { asText, cleanMessage, isRecord } from '~/lib/raw-data';
import { openRawSheet } from '~/lib/sheets';

const ROW_KEY = 'view-raw';

type SheetProps = { message?: unknown };

/** The message the open long-press sheet is for, and the key that closes the sheet. */
let open: { key: string; message: Record<string, unknown> } | null = null;

/**
 * @description Adds a "View Raw" row to the message long-press sheet. Patches `openLazy` on Discord's action sheet module
 * and the long-press sheet it renders, and puts the row second in the first row group, like Unbound's own View Raw.
 */
export function patchMessageSheet(): void {
	if (!ActionSheets) {
		logger.warn('View Raw skipped: Discord moved ActionSheets.');

		return;
	}

	// UNKNOWN: an action sheet may render any node.
	function addRow(result: unknown) {
		if (!open) return;

		const rows = findElement(result, isActionSheetRowGroup)?.props?.children;

		if (!Array.isArray(rows) || rows.some((row) => isElementNode(row) && row.key === ROW_KEY)) return;

		const { key, message } = open;
		const ActionSheetRow = getActionSheetRow();

		rows.splice(
			1,
			0,
			<ActionSheetRow
				key={ROW_KEY}
				label={messages.VIEW_RAW}
				icon={<RawIcon />}
				onPress={() => {
					ActionSheets.hideActionSheet(key);
					openRawSheet(JSON.stringify(cleanMessage(message), null, 4), asText(message.content));
				}}
			/>,
		);
	}

	const renderer = createSheetRenderer(patcher, addRow);

	patchLazySheets<SheetProps>(patcher, ActionSheets, (key, props) => {
		const isMessageSheet = /MessageLongPressActionSheet$/i.test(key);

		open = isMessageSheet && isRecord(props.message) ? { key, message: props.message } : null;

		return open ? renderer.render : undefined;
	});
}
