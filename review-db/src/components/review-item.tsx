import { Discord } from '@unbound-app/api/metro/components';
import { assets, dialogs, flux } from '@unbound-app/api';
import { Image, Pressable, View } from 'react-native';
import { messages } from '@unbound-app/i18n';
import { useState } from 'react';

import useStyles from '~/components/reviews-sheet.style';
import { COMMENT_PREVIEW_LENGTH } from '~/lib/constants';
import { UserType, type Review } from '~/lib/entities';
import { deleteReview, getCurrentUser, reportReview } from '~/lib/api';
import { formatReviewDate, getReviewPermissions } from '~/lib/permissions';

type ReviewItemProps = { review: Review; profileId: string; onChanged: () => void };

/** One review: avatar, name, date and text. Long-press for Report and Delete, as Kettu's review sheet offered. */
function ReviewItem({ review, profileId, onChanged }: ReviewItemProps) {
	const styles = useStyles();
	const [expanded, setExpanded] = useState(false);

	const myId = (flux.getStore('User') as unknown as { getCurrentUser(): { id?: string } | undefined }).getCurrentUser()?.id;
	const can = getReviewPermissions(review, profileId, {
		id: myId,
		isAdmin: getCurrentUser()?.type === UserType.Admin,
	});

	const comment = review.comment ?? '';
	const isLong = comment.length > COMMENT_PREVIEW_LENGTH;
	const date = formatReviewDate(review.timestamp);

	async function confirmDelete() {
		const confirmed = await dialogs.confirm('DELETE_REVIEW', {
			body: 'DELETE_REVIEW_BODY',
			confirm: 'DELETE_REVIEW',
			destructive: true,
		});

		if (confirmed && (await deleteReview(profileId, review.id))) onChanged();
	}

	function openActions() {
		const options = [
			can.report && {
				label: messages.REPORT,
				icon: assets.getIdByName('FlagIcon'),
				onPress: () => void reportReview(review.id),
			},
			can.delete && {
				label: messages.DELETE_REVIEW,
				icon: assets.getIdByName('TrashIcon'),
				isDestructive: true,
				onPress: () => void confirmDelete(),
			},
		].filter(Boolean);

		if (!options.length) return;

		Discord.showSimpleActionSheet({
			key: 'review-db-review-actions',
			header: { title: review.sender.username },
			options,
		});
	}

	return (
		<Pressable delayLongPress={350} onLongPress={openActions} style={styles.row}>
			<Image source={{ uri: review.sender.profilePhoto }} style={styles.avatar} />
			<View style={styles.body}>
				<View style={styles.header}>
					<Discord.Text variant='text-md/semibold' color='text-strong' numberOfLines={1} style={styles.name}>
						{review.sender.username}
					</Discord.Text>
					{date ? (
						<Discord.Text variant='text-xs/medium' color='text-muted'>
							{date}
						</Discord.Text>
					) : null}
				</View>
				<Discord.Text variant='text-md/normal' color='text-default'>
					{isLong && !expanded ? `${comment.slice(0, COMMENT_PREVIEW_LENGTH)}…` : comment}
				</Discord.Text>
				{isLong ? (
					<Pressable hitSlop={6} onPress={() => setExpanded((value) => !value)}>
						<Discord.Text variant='text-sm/semibold' color='text-link'>
							{expanded ? messages.SHOW_LESS : messages.READ_MORE}
						</Discord.Text>
					</Pressable>
				) : null}
			</View>
		</Pressable>
	);
}

export default ReviewItem;
