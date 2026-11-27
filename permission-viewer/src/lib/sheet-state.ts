import type { Target } from '~/lib/targets';

export type SheetState = {
	/** The sheet whose row group gets the View Permissions row. */
	open: { key: string; target: Target } | null;
	/** The open server profile, which its overflow menu pairs with, since that menu carries no user. */
	profile: { key: string; guildId: string; userId: string } | null;
};

export const sheetState: SheetState = { open: null, profile: null };
