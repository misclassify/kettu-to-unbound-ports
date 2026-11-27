import { openSheet, type SheetProps } from '~/lib/open-sheet';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Discord } from '@unbound-app/api/metro/components';
import { format, messages } from '@unbound-app/i18n';
import { useSetting } from '@unbound-app/settings';
import { useCallback, useEffect, useState } from 'react';
import { flux } from '@unbound-app/api';

import ReviewComposer from '~/components/review-composer';
import ReviewItem from '~/components/review-item';
import useStyles from '~/components/reviews-sheet.style';
import { fetchCurrentUser, getReviews } from '~/lib/api';
import { ReviewType, type UserReviewsData } from '~/lib/entities';
import { signIn } from '~/lib/login';

type ReviewsSheetProps = { id: string; name: string; server?: boolean } & SheetProps;

/** The reviews on a profile or server, with a box to write one. */
function ReviewsSheet({ id, name, server = false, onClose }: ReviewsSheetProps) {
	const styles = useStyles();
	const showWarning = useSetting('showWarning');
	const authorized = Boolean(useSetting('token'));
	const [data, setData] = useState<UserReviewsData | null>(null);
	const [loading, setLoading] = useState(true);

	const myId = (flux.getStore('User') as unknown as { getCurrentUser(): { id?: string } | undefined }).getCurrentUser()?.id;
	const isOwnProfile = id === myId;

	const load = useCallback(
		async (offset: number) => {
			setLoading(true);

			const page = await getReviews(id, offset);

			setData((previous) =>
				offset && previous ? { ...page, reviews: [...previous.reviews, ...page.reviews] } : page,
			);
			setLoading(false);
		},
		[id],
	);

	useEffect(() => {
		void load(0);
		void fetchCurrentUser();
	}, [load]);

	const all = data?.reviews ?? [];
	const notices = showWarning ? all.filter((review) => review.type === ReviewType.System) : [];
	const reviews = all.filter((review) => review.type !== ReviewType.System);
	const hasOwnReview = reviews.some((review) => review.sender.discordID === myId);

	return (
		<Discord.ActionSheet startExpanded>
			<Discord.BottomSheetTitleHeader
				title={format(server ? 'SERVER_REVIEWS_FOR' : 'REVIEWS_FOR', { name })}
				subtitle={format('REVIEW_COUNT', { count: data?.reviewCount ?? reviews.length })}
			/>
			<ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps='handled'>
				{notices.map((review) => (
					<Discord.InlineNotice
						key={review.id}
						type='info'
						title={review.sender.username}
						message={review.comment ?? ''}
					/>
				))}

				{loading ? <ActivityIndicator /> : null}

				{!loading && !reviews.length ? (
					<View style={styles.empty}>
						<Discord.Text variant='heading-md/semibold' color='text-strong'>
							{messages.NO_REVIEWS}
						</Discord.Text>
						<Discord.Text variant='text-sm/normal' color='text-muted'>
							{messages.NO_REVIEWS_SUBTITLE}
						</Discord.Text>
					</View>
				) : null}

				{reviews.map((review) => (
					<ReviewItem key={review.id} review={review} profileId={id} onChanged={() => void load(0)} />
				))}

				{data?.hasNextPage && !loading ? (
					<Discord.Button
						text={messages.LOAD_MORE}
						variant='secondary'
						onPress={() => void load(data.reviews.length)}
					/>
				) : null}

				{!isOwnProfile && authorized ? (
					<ReviewComposer id={id} name={name} isUpdate={hasOwnReview} onSubmitted={() => void load(0)} />
				) : null}

				{!isOwnProfile && !authorized ? (
					<Discord.Button
						text={messages.SIGN_IN_TO_REVIEW}
						variant='secondary'
						onPress={() => {
							onClose();
							void signIn(() => openReviewsSheet(id, name, server));
						}}
					/>
				) : null}
			</ScrollView>
		</Discord.ActionSheet>
	);
}

/**
 * @description Opens the reviews sheet for a user or a server.
 * @param id The user's or server's Discord ID.
 * @param name The name shown in the title.
 * @param server Whether the id is a server's.
 */
export function openReviewsSheet(id: string, name: string, server = false): void {
	openSheet(`review-db-${id}-${Date.now()}`, ReviewsSheet, { id, name, server });
}

export default ReviewsSheet;
