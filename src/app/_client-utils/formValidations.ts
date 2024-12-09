// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const usernameRules = { maxLength: 30, minLength: 3, pattern: /^[A-Za-z0-9._-]*$/, required: true };
export const emailRules = {
	required: true,
	pattern: /^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i
};

export const passwordRules = { minLength: 6, required: true };
