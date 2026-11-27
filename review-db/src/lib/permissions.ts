import type { Review } from '~/lib/entities';

export type Viewer = {
	/** The viewer's Discord ID, undefined when unknown. */
	id: string | undefined;
	isAdmin: boolean;
};

export type ReviewPermissions = { delete: boolean; report: boolean };

/**
 * @description Decides what the viewer may do with a review, like Kettu's `canDeleteReview`: the author, the profile's owner
 * and ReviewDB admins may delete it, and anyone but its author may report it.
 * @param review The review.
 * @param profileId The Discord ID the review is on.
 * @param viewer The person looking.
 * @returns Whether they may delete and report it.
 */
export function getReviewPermissions(review: Review, profileId: string, viewer: Viewer): ReviewPermissions {
	if (viewer.id === undefined || review.id === 0) return { delete: false, report: false };

	const isAuthor = review.sender.discordID === viewer.id;

	return { delete: isAuthor || profileId === viewer.id || viewer.isAdmin, report: !isAuthor };
}

/**
 * @description Writes a review's time as a date in the user's language.
 * @param seconds The review's timestamp in seconds since 1970.
 * @returns The date, or an empty string for no timestamp.
 */
export function formatReviewDate(seconds: number): string {
	return seconds > 0 ? new Date(seconds * 1000).toLocaleDateString() : '';
}
