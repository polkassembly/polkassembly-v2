// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BLACKLISTED_USERNAMES } from '@shared/_constants/blacklistedUsernames';
import { getSubstrateAddress } from '@shared/_utils/getSubstrateAddress';
import { ENetwork } from '@shared/types';
import validator from 'validator';

export class ValidatorService {
	static isValidEmail(email: string): boolean {
		return validator.isEmail(email);
	}

	static isValidNetwork(network: string): boolean {
		return Object.values(ENetwork).includes(network as ENetwork);
	}

	static isValidUsername(username: string): boolean {
		const regexp = /^[A-Za-z0-9]{1}[A-Za-z0-9.-_]{2,29}$/;
		// check if username is not blacklisted and matches the regex
		return regexp.test(username) && !BLACKLISTED_USERNAMES.includes(username.toLowerCase());
	}

	static isValidPassword(password: string): boolean {
		return password.length >= 6;
	}

	static isValidSubstrateAddress(address: string): boolean {
		return getSubstrateAddress(address) !== null;
	}
}
