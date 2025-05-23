// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import crypto from 'crypto';
import { encode } from 'hi-base32';

export function generateRandomBase32() {
	const buffer = crypto.randomBytes(15);
	return encode(buffer).replace(/=/g, '').substring(0, 24);
}
