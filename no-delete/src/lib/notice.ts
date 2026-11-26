const pad = (value: number, width = 2) => String(value).padStart(width, '0');

/**
 * @description Formats a time the way Kettu's NoDelete did with moment: `HH:mm:ss.SS`, or `hh:mm:ss.SS a` in 12-hour mode.
 * `SS` is hundredths of a second.
 * @param date The time.
 * @param twelveHour Whether to use the 12-hour clock.
 * @returns The formatted time.
 */
export function formatStamp(date: Date, twelveHour: boolean): string {
	const hundredths = pad(Math.floor(date.getMilliseconds() / 10));
	const clock = `${pad(date.getMinutes())}:${pad(date.getSeconds())}.${hundredths}`;

	if (!twelveHour) return `${pad(date.getHours())}:${clock}`;

	const hours = date.getHours() % 12 || 12;

	return `${pad(hours)}:${clock} ${date.getHours() < 12 ? 'am' : 'pm'}`;
}

/**
 * @description Builds the text Discord shows in place of a deleted message.
 * @param options Whether to add the time, which clock to use, and the time itself.
 * @returns The notice.
 */
export function deletedNotice(options: { timestamps: boolean; twelveHour: boolean; now: Date }): string {
	const base = 'This message was deleted';

	return options.timestamps ? `${base} (${formatStamp(options.now, options.twelveHour)})` : base;
}

/**
 * @description Splits the ignored-users setting into ids.
 * @param raw Ids separated by commas, spaces or new lines.
 * @returns The ids, without blanks or anything that is not a snowflake.
 */
export function parseIds(raw: string): string[] {
	return raw
		.split(/[\s,]+/)
		.map((id) => id.trim())
		.filter((id) => /^\d+$/.test(id));
}
