import { patchLazySheets } from '~/lib/patch-lazy-sheets';
import { createSheetRenderer } from '~/lib/sheet-renderer';
import { patchAboutCard } from '~/lib/patch-about-card';
import { insertSheetRows } from '~/lib/sheet-rows';
import { AboutSection } from '~/lib/about-section';
import { asId } from '~/lib/as-id';
import { flux, metro, patcher } from '@unbound-app/api';
import { messages } from '@unbound-app/i18n';

import { openReviewsSheet } from '~/components/reviews-sheet';

const UserStore = flux.getStore('User') as unknown as {
	getUser(id: string): { username?: string; globalName?: string | null } | undefined;
};
const GuildStore = flux.getStore('Guild') as unknown as { getGuild(id: string): { name?: string } | undefined };

function openReviews(userId: string): void {
	const user = UserStore.getUser(userId);

	openReviewsSheet(userId, user?.globalName ?? user?.username ?? messages.USER);
}

/**
 * @description Adds a Reviews section to every profile's About card; tapping it opens that user's reviews. Kettu put the
 * list inline on the profile, which breaks whenever Discord rearranges it; a sheet does not.
 */
export function patchUserProfileCard(): void {
	const found = patchAboutCard({
		key: 'review-db-reviews',
		render: ({ userId }) => (
			<AboutSection title={messages.REVIEWS_TITLE} icon='StarIcon' link onPress={() => openReviews(userId)}>
				{messages.VIEW_REVIEWS}
			</AboutSection>
		),
	});

	if (!found) logger.warn('Reviews section skipped: Discord moved UserProfileAboutMeCard.');
}

type GuildSheetProps = { guild?: { id?: unknown } | null; guildId?: unknown };

type MenuItem = { label?: string; IconComponent?: unknown; action?: () => void };

type ContextMenuHost = {
	showContextMenu: (menu?: { key?: unknown; items?: MenuItem[] }) => void;
	hideContextMenu: () => void;
};

function openGuildReviews(guildId: string): void {
	openReviewsSheet(guildId, GuildStore.getGuild(guildId)?.name ?? messages.SERVER_REVIEWS, true);
}

function guildSheetId(key: string, props: GuildSheetProps): string | undefined {
	if (!/^GuildActionSheet:/i.test(key)) return undefined;

	return asId(props.guild?.id) ?? asId(props.guildId) ?? asId(key.slice(key.indexOf(':') + 1));
}

/** Adds a Server Reviews row to each server's long-press sheet, where Kettu replaced a progress card with the reviews. */
export function patchGuildSheet(): void {
	const { ActionSheets } = metro.api;

	if (!ActionSheets) {
		logger.warn('Server Reviews row skipped: Discord moved its action sheets.');

		return;
	}

	let open: { key: string; guildId: string } | undefined;

	const { render } = createSheetRenderer(patcher, (result) => {
		const current = open;

		if (!current) return;

		insertSheetRows(result, [
			{
				key: 'review-db-server-reviews',
				label: messages.SERVER_REVIEWS,
				icon: 'StarIcon',
				onPress: () => {
					ActionSheets.hideActionSheet(current.key);
					openGuildReviews(current.guildId);
				},
			},
		]);
	});

	patchLazySheets<GuildSheetProps>(patcher, ActionSheets, (key, props) => {
		const guildId = guildSheetId(key, props);

		open = guildId ? { key, guildId } : undefined;

		return guildId ? render : undefined;
	});
}

/** Adds a Server Reviews item to a server's context menu, which some builds open on long-press instead of the sheet. */
export function patchGuildMenu(): void {
	const ContextMenus: ContextMenuHost | undefined = metro.findByProps('showContextMenu', 'hideContextMenu');
	const Icons = metro.findByProps('StarIcon');

	if (!ContextMenus || !Icons) {
		logger.warn('Server Reviews item skipped: Discord moved showContextMenu or StarIcon.');

		return;
	}

	patcher.before(ContextMenus, 'showContextMenu', ({ args: [menu] }) => {
		const guildId = asId(menu?.key);

		if (!menu || !Array.isArray(menu.items) || !guildId || !GuildStore.getGuild(guildId)) return;
		if (menu.items.some((item) => item.label === messages.SERVER_REVIEWS)) return;

		menu.items.push({
			label: messages.SERVER_REVIEWS,
			IconComponent: Icons.StarIcon,
			action: () => {
				ContextMenus.hideContextMenu();
				openGuildReviews(guildId);
			},
		});
	});
}
