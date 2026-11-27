import { format, messages } from '@unbound-app/i18n';
import { settings } from '@unbound-app/settings';
import { toasts } from '@unbound-app/api';

import { API_URL } from '~/lib/constants';
import type { ReviewDBUser, UserReviewsData } from '~/lib/entities';

type Body = Record<string, string | number | boolean>;

type MessageResponse = { message?: string };

let currentUser: ReviewDBUser | null = null;

function toast(content: string) {
	toasts.show({ title: messages.REVIEWDB, content });
}

/**
 * @description The signed-in ReviewDB account, once `fetchCurrentUser` has fetched it.
 * @returns The account, or null before sign-in or the first fetch.
 */
export function getCurrentUser(): ReviewDBUser | null {
	return currentUser;
}

// Resolves to the parsed body, or null after toasting a network or server failure.
async function request<T>(path: string, method = 'GET', body?: Body): Promise<T | null> {
	const headers: Record<string, string> = { Accept: 'application/json', Authorization: settings.token };

	if (body) headers['Content-Type'] = 'application/json';

	let response: Response;

	try {
		response = await fetch(`${API_URL}${path}`, { method, headers, body: body && JSON.stringify(body) });
	} catch {
		toast(messages.NETWORK_ERROR);

		return null;
	}

	const data = (await response.json().catch(() => null)) as (T & MessageResponse) | null;

	if (!response.ok) {
		toast(
			typeof data?.message === 'string' ? data.message : format('REQUEST_FAILED', { status: response.status }),
		);

		return null;
	}

	return data;
}

/**
 * @description Fetches a page of reviews on a profile or server. Reading needs no sign-in.
 * @param id The user's or server's Discord ID.
 * @param offset How many reviews to skip.
 * @returns The page, or an empty page after toasting the failure.
 */
export async function getReviews(id: string, offset: number): Promise<UserReviewsData> {
	const empty: UserReviewsData = { message: '', reviews: [], hasNextPage: false, reviewCount: 0 };
	const query = `${offset ? `offset=${offset}&` : ''}limit=50`;

	try {
		const response = await fetch(`${API_URL}/users/${id}/reviews?${query}`);

		if (!response.ok) {
			toast(response.status === 429 ? messages.RATE_LIMITED : messages.FETCH_REVIEWS_FAILED);

			return empty;
		}

		return (await response.json()) as UserReviewsData;
	} catch {
		toast(messages.NETWORK_ERROR);

		return empty;
	}
}

/**
 * @description Posts the viewer's review, which replaces their earlier one.
 * @param id The user's or server's Discord ID.
 * @param comment The review text.
 * @returns Whether it was posted.
 */
export async function addReview(id: string, comment: string): Promise<boolean> {
	if (!settings.token) {
		toast(messages.AUTHORIZE_TO_REVIEW);

		return false;
	}

	const data = await request<MessageResponse>(`/users/${id}/reviews`, 'PUT', { userid: id, comment });

	if (data?.message) toast(data.message);

	return data !== null;
}

/**
 * @description Deletes a review.
 * @param id The Discord ID of the profile it is on.
 * @param reviewId The review's ID.
 * @returns Whether it was deleted.
 */
export async function deleteReview(id: string, reviewId: number): Promise<boolean> {
	const data = await request<MessageResponse>(`/users/${id}/reviews`, 'DELETE', { reviewid: reviewId });

	if (data?.message) toast(data.message);

	return data !== null;
}

/**
 * @description Reports a review to ReviewDB's moderators.
 * @param reviewId The review's ID.
 */
export async function reportReview(reviewId: number): Promise<void> {
	const data = await request<MessageResponse>('/reports', 'PUT', { reviewid: reviewId });

	if (data?.message) toast(data.message);
}

/**
 * @description Fetches the signed-in ReviewDB account and keeps it for the session, which tells whether the viewer is an admin.
 * @returns The account, or null when not signed in or the request failed.
 */
export async function fetchCurrentUser(): Promise<ReviewDBUser | null> {
	if (!settings.token) return null;

	const user = await request<ReviewDBUser>('/users', 'POST');

	if (user) currentUser = user;

	return user;
}

/** Forgets the cached account, for when the user logs out. */
export function clearCurrentUser(): void {
	currentUser = null;
}
