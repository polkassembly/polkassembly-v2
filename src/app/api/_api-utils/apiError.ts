// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

/**
 *
 * @param {string} name
 * @param {number} [status]
 * @param {string} [message]
 *
 * @description Custom error class for server-side (api backend) errors
 *
 * @returns {Error}
 * Throws a server error with the given name, status code and message
 * If no message is provided, it will default to the message associated with the name
 * If no name is provided, it will default to the API_FETCH_ERROR name
 * If no status is provided, it will default to the INTERNAL_SERVER_ERROR(500) status
 *
 * @example
 * throw new APIError();
 * // is equivalent to
 * throw new APIError(ERROR_CODES.API_FETCH_ERROR);
 * // is equivalent to
 * throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.API_FETCH_ERROR);
 *
 * //Always use status code from the http-status-codes package
 * throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
 *
 * // Always try to use a message from the ERROR_MESSAGES object
 * throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INVALID_SEARCH_PARAMS_ERROR);
 *
 * // Or you can provide a custom message in scenarios like this :
 * const addressRes = await fetch(`https://example.com`).catch((e) => {
 *  throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `${e?.message}`,);
 * });
 */
export class APIError extends Error {
	status: StatusCodes;

	constructor(name?: string, status?: StatusCodes, message?: string) {
		super(message || ERROR_MESSAGES[String(name)] || ERROR_MESSAGES.API_FETCH_ERROR);
		this.name = name || ERROR_CODES.API_FETCH_ERROR;
		this.status = status || StatusCodes.INTERNAL_SERVER_ERROR;
	}
}
