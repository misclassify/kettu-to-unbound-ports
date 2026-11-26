type Obj = Record<string, unknown>;

const isRecord = (value: unknown): value is Obj =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Account fields of the message author that are private to the user, so they never show in the sheet. */
const PRIVATE_AUTHOR_FIELDS = ['email', 'phone', 'mfaEnabled', 'hasBouncedEmail', 'personalConnectionId'];

/**
 * @description Copies a message as plain JSON without the author's private account fields, like Kettu's `cleanMessage`.
 * The JSON round trip also turns timestamps into strings.
 * @param message The message record from the action sheet.
 * @returns A JSON-safe copy.
 */
export function cleanMessage(message: unknown): Obj {
	const clone = JSON.parse(JSON.stringify(message)) as Obj;

	if (isRecord(clone.author)) {
		for (const field of PRIVATE_AUTHOR_FIELDS) delete clone.author[field];
	}

	return clone;
}

/**
 * @description Reads a string field.
 * @param value Anything.
 * @returns The string, or an empty one.
 */
export function asText(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export { isRecord };
