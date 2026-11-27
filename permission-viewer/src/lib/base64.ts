const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * @description Encodes bytes as base64, which is how the file manager takes binary data. Written out so it does not
 * depend on `btoa`, which not every JavaScript runtime has.
 * @param bytes The bytes.
 * @returns The base64 text, padded with `=`.
 */
export function toBase64(bytes: Uint8Array): string {
	let out = '';

	for (let index = 0; index < bytes.length; index += 3) {
		const first = bytes[index];
		const second = bytes[index + 1];
		const third = bytes[index + 2];
		const chunk = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

		out += ALPHABET[(chunk >> 18) & 63] + ALPHABET[(chunk >> 12) & 63];
		out += second === undefined ? '=' : ALPHABET[(chunk >> 6) & 63];
		out += third === undefined ? '=' : ALPHABET[chunk & 63];
	}

	return out;
}
