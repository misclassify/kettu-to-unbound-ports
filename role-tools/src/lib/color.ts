/**
 * @description Writes a role color as a hex code.
 * @param color The role's color as an integer, 0 for none.
 * @returns `#RRGGBB`, or undefined for a role without a color.
 */
export function roleHex(color: number | null | undefined): string | undefined {
	return color ? `#${color.toString(16).padStart(6, '0').toUpperCase()}` : undefined;
}
