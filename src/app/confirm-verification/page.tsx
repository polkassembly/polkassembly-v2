// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable camelcase */

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ESocial } from '@/_shared/types';
import { ClientError } from '../_client-utils/clientError';
import ConfirmVerfication from './Components/ConfirmVerfication';

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ConfirmVerificationPage({ searchParams }: PageProps) {
	const { token, social, oauth_verifier, oauth_token } = await searchParams;

	if (!social || (social === ESocial.TWITTER && !oauth_token) || (social === ESocial.EMAIL && !token)) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Missing required parameters');
	}

	return (
		<ConfirmVerfication
			token={social === ESocial.TWITTER ? (oauth_token as string) : (token as string)}
			social={social as ESocial}
			twitterOauthVerifier={oauth_verifier as string}
		/>
	);
}

export default ConfirmVerificationPage;
