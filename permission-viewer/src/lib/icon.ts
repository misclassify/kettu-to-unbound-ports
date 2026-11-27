export type IconFormat = 'png' | 'webp' | 'jpg';

export type RoleIconFields = { id: string; icon?: string | null; unicodeEmoji?: string | null };

const CDN = 'https://cdn.discordapp.com';

/**
 * @description Whether a role has an uploaded icon image; a role may instead have a Unicode emoji, which is text.
 * @param role The role.
 * @returns True for an uploaded icon.
 */
export function hasImageIcon(role: RoleIconFields): boolean {
	return typeof role.icon === 'string' && role.icon.length > 0;
}

/**
 * @description Builds a role icon's link on Discord's CDN, as Vencord's betterRoleContext does.
 * @param role The role.
 * @param format The file format.
 * @param size The side length in pixels.
 * @returns The link, or undefined when the role has no uploaded icon.
 */
export function iconUrl(role: RoleIconFields, format: IconFormat, size: number): string | undefined {
	return hasImageIcon(role) ? `${CDN}/role-icons/${role.id}/${role.icon}.${format}?size=${size}` : undefined;
}

/**
 * @description Names the file a saved icon gets.
 * @param role The role.
 * @param format The file format.
 * @returns For example `role-icon-123.png`.
 */
export function iconFileName(role: RoleIconFields, format: IconFormat): string {
	return `role-icon-${role.id}.${format}`;
}
