// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * Converts a camelCase or PascalCase string to Title Case
 * @param text The text to convert
 * @returns The converted text in Title Case
 */
export const convertCamelCaseToTitleCase = (text: string): string => {
	return text
		.replace(/([A-Z])/g, ' $1')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
};
