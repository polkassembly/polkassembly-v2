// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export function snakeToCamelCase(str: string) {
	if (!str) {
		return '';
	}
	return str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());
}
