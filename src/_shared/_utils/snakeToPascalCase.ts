// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { snakeToCamelCase } from './snakeToCamelCase';

export function snakeToPascalCase(str: string) {
	if (!str) {
		return '';
	}
	const camelCase = snakeToCamelCase(str);
	return camelCase[0].toUpperCase() + camelCase.substring(1);
}
