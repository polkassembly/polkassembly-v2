// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import oauth from 'oauth';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ENetwork, ESocial } from '@/_shared/types';
import { TWITTER_CONSUMER_API_KEY, TWITTER_CONSUMER_API_SECRET_KEY, VERIFICATION_CALLBACK_URL } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from './apiError';

const OAUTH_CONSUMER_ERROR = 'TWITTER_CONSUMER_API_KEY or TWITTER_CONSUMER_API_SECRET_KEY missing in env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const getOauthConsumer = (network: ENetwork) => {
	if (!TWITTER_CONSUMER_API_KEY || !TWITTER_CONSUMER_API_SECRET_KEY) throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, OAUTH_CONSUMER_ERROR);

	return new oauth.OAuth(
		'https://twitter.com/oauth/request_token',
		'https://twitter.com/oauth/access_token',
		TWITTER_CONSUMER_API_KEY,
		TWITTER_CONSUMER_API_SECRET_KEY,
		'1.0A',
		`${VERIFICATION_CALLBACK_URL}?social=${ESocial.TWITTER}`,
		'HMAC-SHA1'
	);
};
