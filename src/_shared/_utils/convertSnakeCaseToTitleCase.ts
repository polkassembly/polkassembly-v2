// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const convertSnakeCaseToTitleCase = (text: string): string => {
	if (!text) return '';
	return text.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};
