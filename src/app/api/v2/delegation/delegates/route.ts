// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NOVA_DELEGATES, PARITY_DELEGATES, W3F_DELEGATES } from '@/_shared/_constants/delegates';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EDelegateSource, ENetwork, IDelegate, IDelegateDetails } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { encodeAddress, cryptoWaitReady } from '@polkadot/util-crypto';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface INovaDelegate {
	address: string;
	name?: string;
	image?: string;
	shortDescription?: string;
	longDescription?: string;
	isOrganization?: boolean;
}

interface IParityDelegate {
	name?: string;
	address: string;
	manifesto?: string;
}

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();

	const cachedDelegateDetails = await RedisService.GetDelegateDetails(network);
	if (cachedDelegateDetails) {
		return NextResponse.json(cachedDelegateDetails);
	}

	await cryptoWaitReady();

	// Fetch all delegate sources in parallel
	const [novaDelegatesResponse, parityDelegatesResponse, polkassemblyDelegates, allDelegatesWithVotingPowerAndDelegationsCount] = await Promise.all([
		// Nova delegates
		NOVA_DELEGATES[network as ENetwork] ? ((await fetch(NOVA_DELEGATES[network as ENetwork])).json() as Promise<INovaDelegate[]>) : Promise.resolve([]),
		// Parity delegates
		PARITY_DELEGATES[network as ENetwork] ? ((await fetch(PARITY_DELEGATES[network as ENetwork])).json() as Promise<IParityDelegate[]>) : Promise.resolve([]),
		// Polkassembly delegates
		OffChainDbService.GetPolkassemblyDelegates(network),
		// On-chain delegates with voting power
		OnChainDbService.GetAllDelegatesWithConvictionVotingPowerAndDelegationsCount(network)
	]);

	// Process delegate sources in parallel
	const delegatesWithSource: Record<string, IDelegate> = {};

	// Process W3F delegates
	W3F_DELEGATES.forEach((delegate) => {
		if (delegate.network === network) {
			delegatesWithSource[delegate.address] = { ...delegate };
		}
	});

	// Process Nova delegates
	novaDelegatesResponse.forEach((novaDelegate) => {
		delegatesWithSource[novaDelegate.address] = {
			address: novaDelegate.address,
			image: novaDelegate.image,
			manifesto: novaDelegate.longDescription,
			name: novaDelegate.name,
			sources: [...(delegatesWithSource[novaDelegate.address]?.sources ?? []), EDelegateSource.NOVA],
			network
		};
	});

	// Process Parity delegates
	parityDelegatesResponse.forEach((parityDelegate) => {
		delegatesWithSource[parityDelegate.address] = {
			address: parityDelegate.address,
			manifesto: parityDelegate.manifesto,
			name: parityDelegate.name,
			sources: [...(delegatesWithSource[parityDelegate.address]?.sources ?? []), EDelegateSource.PARITY],
			network
		};
	});

	// Process Polkassembly delegates
	polkassemblyDelegates.forEach((polkassemblyDelegate) => {
		delegatesWithSource[encodeAddress(polkassemblyDelegate.address, NETWORKS_DETAILS[network as ENetwork].ss58Format)] = {
			...polkassemblyDelegate,
			sources: [...(delegatesWithSource[polkassemblyDelegate.address]?.sources ?? []), EDelegateSource.POLKASSEMBLY]
		};
	});

	// Process all delegates in parallel with chunking for better performance
	const CHUNK_SIZE = 50; // Process 50 delegates at a time
	const allDelegateAddresses = new Set([...Object.keys(delegatesWithSource), ...Object.keys(allDelegatesWithVotingPowerAndDelegationsCount)]);
	const allChunkPromises: Promise<IDelegateDetails>[] = [];

	for (let i = 0; i < allDelegateAddresses.size; i += CHUNK_SIZE) {
		const chunk = Array.from(allDelegateAddresses).slice(i, i + CHUNK_SIZE);
		chunk.forEach((address) => {
			allChunkPromises.push(
				(async () => {
					const { receivedDelegationsCount = 0, votingPower = '0' } = allDelegatesWithVotingPowerAndDelegationsCount[String(address)] ?? {};
					const [last30DaysConvictionVoteCount, publicUser] = await Promise.all([
						OnChainDbService.GetLast30DaysConvictionVoteCountByAddress({ network, address }),
						OffChainDbService.GetPublicUserByAddress(address)
					]);

					return {
						address,
						sources: delegatesWithSource[String(address)]?.sources ?? [EDelegateSource.INDIVIDUAL],
						createdAt: delegatesWithSource[String(address)]?.createdAt,
						updatedAt: delegatesWithSource[String(address)]?.updatedAt,
						image: delegatesWithSource[String(address)]?.image,
						manifesto: delegatesWithSource[String(address)]?.manifesto,
						name: delegatesWithSource[String(address)]?.name,
						network,
						receivedDelegationsCount,
						votingPower,
						last30DaysVotedProposalsCount: last30DaysConvictionVoteCount,
						publicUser: publicUser ?? undefined
					};
				})()
			);
		});
	}

	const delegateDetails = await Promise.all(allChunkPromises);

	// Cache the results
	await RedisService.SetDelegateDetails(network, delegateDetails);

	return NextResponse.json(delegateDetails);
});

// Add Polkassembly delegate
export const POST = withErrorHandling(async (req: Request) => {
	const zodBodySchema = z.object({
		address: z.string().refine((addr) => ValidatorService.isValidWeb3Address(addr), 'Not a valid web3 address'),
		manifesto: z.string().min(1, 'Manifesto is required')
	});

	const { address, manifesto } = zodBodySchema.parse(await getReqBody(req));

	const network = await getNetworkFromHeaders();

	const { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// check if address belongs to the user
	const user = await OffChainDbService.GetUserByAddress(address);
	if (!user || user.id !== AuthService.GetUserIdFromAccessToken(newAccessToken)) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'You are not allowed to add this address as a delegate.');
	}

	const newPolkassemblyDelegateId = await OffChainDbService.AddPolkassemblyDelegate({ network, address, manifesto });

	// invalidate delegate details cache
	await RedisService.DeleteDelegateDetails(network);

	const response = NextResponse.json({ id: newPolkassemblyDelegateId });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));
	return response;
});
