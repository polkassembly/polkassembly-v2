// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@shared/_constants/errorLiterals';

export async function getReqBody(req: Request) {
	try {
		return await req.json();
	} catch (error) {
		console.log(`${ERROR_CODES.REQ_BODY_ERROR} : ${error}`);
		return {};
	}
}
