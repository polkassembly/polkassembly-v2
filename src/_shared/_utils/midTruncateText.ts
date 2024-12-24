// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

interface Params {
	text: string;
	startChars: number;
	endChars: number;
	separator?: string;
}

/**
 * Truncate text in the middle of the string.
 * Example: "Hello World" -> "He...ld"
 *
 * @export
 * @param {Params} { text, startChars, endChars }
 * @return {string}
 */

export default function midTruncateText({ text, startChars, endChars, separator = '...' }: Params): string {
	const maxLength = startChars + endChars;

	return text.length > maxLength ? `${text.slice(0, startChars)}${separator}${text.slice(-endChars)}` : text;
}
