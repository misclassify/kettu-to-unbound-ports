import { messages } from '@unbound-app/i18n';
import { flux } from '@unbound-app/api';

import { openReviewsSheet } from '~/components/reviews-sheet';
import { signIn, signOut } from '~/lib/login';

export async function authorize() {
	await signIn();
}

export function logout() {
	signOut();
}

export function viewMyReviews() {
	const myId = (flux.getStore('User') as unknown as { getCurrentUser(): { id?: string } | undefined }).getCurrentUser()?.id;

	if (myId) openReviewsSheet(myId, messages.YOU);
}
