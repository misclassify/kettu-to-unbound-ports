import { authorize } from '~/lib/authorize';
import { readQuery } from '~/lib/query';
import { messages } from '@unbound-app/i18n';
import { settings } from '@unbound-app/settings';
import { toasts } from '@unbound-app/api';

import { AUTH_REDIRECT_URI, CLIENT_ID, CLIENT_MOD } from '~/lib/constants';
import { clearCurrentUser, fetchCurrentUser } from '~/lib/api';

type AuthPayload = { token?: unknown; message?: unknown };

function notify(content: string) {
	toasts.show({ title: messages.REVIEWDB, content });
}

async function finishLogin(location: string): Promise<boolean> {
	const { error, error_description: description } = readQuery(location);

	if (error) {
		if (error !== 'access_denied') notify(description ?? error);

		return false;
	}

	if (!location.startsWith(AUTH_REDIRECT_URI)) return false;

	const response = await fetch(`${location}&returnType=json&clientMod=${CLIENT_MOD}`, {
		headers: { Accept: 'application/json' },
	});
	const payload = (await response.json().catch(() => null)) as AuthPayload | null;

	if (!response.ok || payload === null) {
		notify(typeof payload?.message === 'string' ? payload.message : messages.LOGIN_FAILED);

		return false;
	}

	if (typeof payload.token !== 'string') {
		notify(messages.LOGIN_INVALID_PAYLOAD);

		return false;
	}

	settings.token = payload.token;
	notify(messages.LOGIN_SUCCESS);
	void fetchCurrentUser();

	return true;
}

/**
 * @description Opens Discord's authorize screen for ReviewDB and stores the token it grants, like Kettu's `showAuthModal`.
 * @param onSuccess Called once the token is stored.
 */
export async function signIn(onSuccess?: () => void): Promise<void> {
	try {
		const location = await authorize({
			clientId: CLIENT_ID,
			redirectUri: AUTH_REDIRECT_URI,
			scopes: ['identify'],
		});

		if (location && (await finishLogin(location))) onSuccess?.();
	} catch (error) {
		notify(error instanceof Error ? error.message : messages.AUTHORIZATION_FAILED);
	}
}

/** Forgets the stored token. */
export function signOut(): void {
	settings.token = '';
	clearCurrentUser();
	notify(messages.LOGGED_OUT);
}
