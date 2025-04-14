// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@/_shared/types';
import { promisify } from 'util';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { getOauthConsumer } from './getOauthConsumer';
import { APIError } from './apiError';

// of the Apache-2.0 license. See the LICENSE file for details.
async function oauthGetUserById({
	twitterUserId,
	network,
	oauthAccessToken,
	oauthAccessTokenSecret
}: {
	twitterUserId: number;
	network: ENetwork;
	oauthAccessToken: string;
	oauthAccessTokenSecret: string;
}) {
	const oauthConsumer = getOauthConsumer(network);

	if (!oauthConsumer) return null;

	return promisify(oauthConsumer.get.bind(oauthConsumer))(
		`https://api.twitter.com/1.1/account/verify_credentials.json?user_id=${twitterUserId}`,
		oauthAccessToken,
		oauthAccessTokenSecret
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	).then((body: any) => JSON.parse(body));
}

async function getOAuthAccessTokenWith({
	network,
	oauthRequestToken,
	oauthRequestTokenSecret,
	oauthVerifier
}: {
	network: ENetwork;
	oauthRequestToken: string;
	oauthRequestTokenSecret: string;
	oauthVerifier: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
	const oauthConsumer = getOauthConsumer(network);

	if (!oauthConsumer) return null;

	return new Promise((resolve, reject) => {
		console.log('oauthRequestToken', oauthRequestToken);
		console.log('oauthRequestTokenSecret', oauthRequestTokenSecret);
		console.log('oauthVerifier', oauthVerifier);
		oauthConsumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, oauthVerifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
			console.log('error', error);
			return error
				? reject(new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Error in getting oauth access token'))
				: resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
		});
	});
}

export const confirmTwitterVerification = async ({
	network,
	oauthVerifier,
	oauthRequestToken,
	twitterHandle,
	oauthRequestTokenSecret
}: {
	network: ENetwork;
	oauthVerifier?: string;
	oauthRequestToken: string;
	twitterHandle: string;
	oauthRequestTokenSecret?: string;
}): Promise<{ data: string | null; error: unknown }> => {
	try {
		if (!oauthVerifier || !oauthRequestToken || !oauthRequestTokenSecret) throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid params in req body');

		const { oauthAccessToken, oauthAccessTokenSecret, results } = await getOAuthAccessTokenWith({ network, oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });

		const { user_id: twitterUserId } = results;
		const twitterUser = await oauthGetUserById({ twitterUserId, network, oauthAccessToken, oauthAccessTokenSecret });

		if (twitterHandle.toLowerCase() !== `${twitterUser?.screen_name.toLowerCase()}`)
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Twitter handle does not match');

		return {
			data: twitterUser.screen_name.toLowerCase(),
			error: null
		};
	} catch (error) {
		return {
			data: null,
			error
		};
	}
};
