import { fs, metro, toasts } from '@unbound-app/api';
import { format, messages } from '@unbound-app/i18n';
import { settings } from '@unbound-app/settings';
import { Share } from 'react-native';

import { toBase64 } from '~/lib/base64';
import { iconFileName, iconUrl, type RoleIconFields } from '~/lib/icon';

/** Saved icons are fetched this large; Discord stores them at up to 128 pixels, so this keeps all the detail. */
export const SAVE_SIZE = 512;

/** The size the viewing sheet shows. */
export const VIEW_SIZE = 256;

async function readBytes(response: Response): Promise<Uint8Array> {
	try {
		return new Uint8Array(await response.arrayBuffer());
	} catch {
		// Older React Native fetch has no `arrayBuffer`, so read the blob as a data URL instead.
		const blob = await response.blob();
		const dataUrl = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();

			reader.onloadend = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});

		const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);

		return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
	}
}

/**
 * @description Links to a role's icon in the format the user picked.
 * @param role The role.
 * @param size The side length in pixels.
 * @returns The link, or undefined for a role without an uploaded icon.
 */
export function roleIconUrl(role: RoleIconFields, size: number): string | undefined {
	return iconUrl(role, settings.iconFormat, size);
}

/**
 * @description Copies the link to a role's icon.
 * @param role The role.
 */
export function copyIconLink(role: RoleIconFields): void {
	const url = roleIconUrl(role, SAVE_SIZE);

	if (!url) return;

	metro.common.Clipboard.setString(url);
	toasts.show({ title: messages.ROLE_MENU_TITLE, content: messages.COPIED_LINK });
}

/**
 * @description Saves a role's icon. Downloads it, writes it to the app's documents folder, and opens the system share sheet
 * on that file, where "Save Image" puts it in Photos and "Save to Files" keeps it, then removes the temporary copy.
 * @param role The role.
 */
export async function saveRoleIcon(role: RoleIconFields): Promise<void> {
	const url = roleIconUrl(role, SAVE_SIZE);

	if (!url) return;

	const name = iconFileName(role, settings.iconFormat);

	try {
		const response = await fetch(url);

		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		await fs.writeFile(name, toBase64(await readBytes(response)), 'base64');

		const root = fs.documentsPath.endsWith('/') ? fs.documentsPath : `${fs.documentsPath}/`;

		await Share.share({ url: `file://${root}${name}` });
	} catch (error) {
		logger.error('Failed to save a role icon:', error);
		toasts.show({
			title: messages.ROLE_MENU_TITLE,
			content: format('SAVE_FAILED', { reason: (error as Error)?.message ?? String(error) }),
		});
	} finally {
		void fs.removeFile(name).catch(() => undefined);
	}
}
