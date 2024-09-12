// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@shared/_constants/errorLiterals';

/**
 * @param {string} name
 * @param {string} [message]
 * @description Custom error class for client-side (react server component) errors
 * @returns {Error}
 *
 * Throws a client error with the given message and name
 * If no message is provided, it will default to the message associated with the name
 * If no name is provided, it will default to the CLIENT_ERROR name
 *
 * @example
 * throw new ClientError();
 * // is equivalent to
 * throw new ClientError(ERROR_CODES.API_FETCH_ERROR);
 * // is equivalent to
 * throw new ClientError(ERROR_CODES.API_FETCH_ERROR, ERROR_MESSAGES.API_FETCH_ERROR);
 *
 * // Always try to use a message from the ERROR_MESSAGES object
 * throw new ClientError(ERROR_CODES.API_FETCH_ERROR, ERROR_MESSAGES.INVALID_SEARCH_PARAMS_ERROR);
 *
 * // Or you can provide a custom message in scenarios like this :
 * const addressRes = await fetch(`https://example.com`).catch((e) => {
 *  throw new ClientError(ERROR_CODES.API_FETCH_ERROR, `${e?.message}`,);
	});
 */
export class ClientError extends Error {
	constructor(name?: string, message?: string) {
		super(message || ERROR_MESSAGES[String(name)] || ERROR_MESSAGES.CLIENT_ERROR);
		this.name = name || ERROR_CODES.CLIENT_ERROR;
	}
}
