/** ReviewDB's OAuth application, as in Kettu's plugin. */
export const CLIENT_ID = '915703782174752809';

export const API_URL = 'https://manti.vendicated.dev/api/reviewdb';
export const AUTH_REDIRECT_URI = `${API_URL}/auth`;

export const COMMENT_MAX_LENGTH = 1000;
export const COMMENT_PREVIEW_LENGTH = 200;

/** Sent to ReviewDB's auth endpoint so it knows which client mod signed in. */
export const CLIENT_MOD = 'enmity';
