// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable camelcase */

import { z } from 'zod';
import { ESocial } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { redirect } from 'next/navigation';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ClientError } from '../_client-utils/clientError';
import { getNetworkFromHeaders } from '../api/_api-utils/getNetworkFromHeaders';
import ConfirmVerfication from './Components/ConfirmVerfication';

const searchParamsSchema = z.object({
	token: z.string().optional(),
	social: z.enum([ESocial.EMAIL, ESocial.TWITTER, ESocial.RIOT] as const).optional(),
	oauth_verifier: z.string().optional(),
	oauth_token: z.string().optional(),
	network: z
		.string()
		.optional()
		.refine((val) => val && ValidatorService.isValidNetwork(val), {
			message: 'Invalid network'
		})
});

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ConfirmVerificationPage({ searchParams }: PageProps) {
	try {
		const validatedParams = searchParamsSchema.parse(searchParams);
		const { token, social, oauth_verifier, oauth_token, network } = validatedParams;

		const currentNetwork = await getNetworkFromHeaders();

		if (network && ValidatorService.isValidNetwork(network) && currentNetwork !== network) {
			// route to the correct network
			redirect(`https://${network}.polkassembly.io/confirm-verification?social=${social}&token=${token}&oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`);
		}

		if (!social || (social === ESocial.TWITTER && !oauth_token) || (social === ESocial.EMAIL && !token)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Missing required parameters');
		}

		return (
			<ConfirmVerfication
				token={social === ESocial.TWITTER && oauth_token ? oauth_token : (token ?? '')}
				social={social as ESocial}
				twitterOauthVerifier={oauth_verifier ?? ''}
			/>
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('Invalid search parameters:', error.errors);
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid verification parameters');
		}
		throw error;
	}
}

export default ConfirmVerificationPage;
