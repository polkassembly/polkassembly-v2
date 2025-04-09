// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const ERROR_CODES = {
	API_FETCH_ERROR: 'API_FETCH_ERROR',
	INVALID_PARAMS_ERROR: 'INVALID_PARAMS_ERROR',
	INVALID_SEARCH_PARAMS_ERROR: 'INVALID_SEARCH_PARAMS_ERROR',
	SUBSQUID_FETCH_ERROR: 'SUBSQUID_FETCH_ERROR',
	GITHUB_FETCH_ERROR: 'GITHUB_FETCH_ERROR',
	REQ_BODY_ERROR: 'REQ_BODY_ERROR',
	CLIENT_ERROR: 'CLIENT_ERROR',
	POST_NOT_FOUND_ERROR: 'POST_NOT_FOUND_ERROR',
	REACTION_ACTION_ERROR: 'REACTION_ACTION_ERROR',
	ADDRESS_NOT_FOUND_ERROR: 'ADDRESS_NOT_FOUND_ERROR',
	USER_NOT_FOUND_ERROR: 'USER_NOT_FOUND_ERROR',
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
	NOT_FOUND: 'NOT_FOUND',
	BAD_REQUEST: 'BAD_REQUEST',
	MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
	INVALID_REQUIRED_FIELDS: 'INVALID_REQUIRED_FIELDS',
	INVALID_NETWORK: 'INVALID_NETWORK',
	COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	CONTENT_SUMMARY_NOT_FOUND_ERROR: 'CONTENT_SUMMARY_NOT_FOUND_ERROR',
	FORBIDDEN: 'FORBIDDEN',
	ALREADY_EXISTS: 'ALREADY_EXISTS',
	NETWORK_NOT_SUPPORTED: 'NETWORK_NOT_SUPPORTED',
	INVALID_INDEX_OR_HASH: 'INVALID_INDEX_OR_HASH'
};

export const ERROR_MESSAGES = {
	[ERROR_CODES.API_FETCH_ERROR]: 'Something went wrong while fetching data. Please try again later.',
	[ERROR_CODES.INVALID_PARAMS_ERROR]: 'Invalid parameters passed to the url.',
	[ERROR_CODES.INVALID_SEARCH_PARAMS_ERROR]: 'Invalid parameters passed to the url.',
	[ERROR_CODES.SUBSQUID_FETCH_ERROR]: 'Something went wrong while fetching onchain data. Please try again later.',
	[ERROR_CODES.REQ_BODY_ERROR]: 'Something went wrong while parsing the request body.',
	[ERROR_CODES.CLIENT_ERROR]: 'Something went wrong while fetching data on the client. Please try again later.',
	[ERROR_CODES.REACTION_ACTION_ERROR]: 'Something went wrong while doing reaction action. Please try again later.',
	[ERROR_CODES.POST_NOT_FOUND_ERROR]: 'Post not found.',
	[ERROR_CODES.ADDRESS_NOT_FOUND_ERROR]: 'Address not found.',
	[ERROR_CODES.USER_NOT_FOUND_ERROR]: 'User not found.',
	[ERROR_CODES.GITHUB_FETCH_ERROR]: 'Something went wrong while fetching data from github. Please try again later.',
	[ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Something went wrong on the server. Please try again later.',
	[ERROR_CODES.UNAUTHORIZED]: 'Unauthorized request.',
	[ERROR_CODES.NOT_FOUND]: 'Resource not found.',
	[ERROR_CODES.BAD_REQUEST]: 'Bad request.',
	[ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Missing required fields.',
	[ERROR_CODES.INVALID_REQUIRED_FIELDS]: 'Invalid required fields.',
	[ERROR_CODES.INVALID_NETWORK]: 'Invalid network.',
	[ERROR_CODES.COMMENT_NOT_FOUND]: 'Comment not found.',
	[ERROR_CODES.USER_NOT_FOUND]: 'User not found.',
	[ERROR_CODES.CONTENT_SUMMARY_NOT_FOUND_ERROR]: 'Content summary not found and/or could not be generated.',
	[ERROR_CODES.FORBIDDEN]: 'You are not allowed to do this action.',
	[ERROR_CODES.ALREADY_EXISTS]: 'This resource already exists.',
	[ERROR_CODES.NETWORK_NOT_SUPPORTED]: 'Network not supported for this action.',
	[ERROR_CODES.INVALID_INDEX_OR_HASH]: 'Invalid index or hash.'
};
