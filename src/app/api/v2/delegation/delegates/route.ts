// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NOVA_DELEGATES, PARITY_DELEGATES, W3F_DELEGATES } from '@/_shared/_constants/delegates';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { ENetwork, IDelegate, IDelegateDetails } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextResponse } from 'next/server';

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

	const w3fDelegates: IDelegate[] = (W3F_DELEGATES[network as ENetwork] || []).map((w3fDelegate) => {
		const delegate: IDelegate = {
			address: ValidatorService.isValidSubstrateAddress(w3fDelegate.address) ? getSubstrateAddress(w3fDelegate.address)! : w3fDelegate.address,
			manifesto: '',
			network,
			name: w3fDelegate.name
		};

		return delegate;
	});

	const novaDelegatesUrl = NOVA_DELEGATES[network as ENetwork];
	const novaDelegatesResponse = novaDelegatesUrl ? ((await (await fetch(novaDelegatesUrl)).json()) as INovaDelegate[]) : [];
	const novaDelegates = novaDelegatesResponse.map((novaDelegate) => {
		const delegate: IDelegate = {
			address: ValidatorService.isValidSubstrateAddress(novaDelegate.address) ? getSubstrateAddress(novaDelegate.address)! : novaDelegate.address,
			manifesto: novaDelegate.longDescription || '',
			network,
			name: novaDelegate.name,
			image: novaDelegate.image
		};

		return delegate;
	});

	const parityDelegatesUrl = PARITY_DELEGATES[network as ENetwork];
	const parityDelegatesResponse = parityDelegatesUrl ? ((await (await fetch(parityDelegatesUrl)).json()) as IParityDelegate[]) : [];
	const parityDelegates = parityDelegatesResponse.map((parityDelegate) => {
		const delegate: IDelegate = {
			address: ValidatorService.isValidSubstrateAddress(parityDelegate.address) ? getSubstrateAddress(parityDelegate.address)! : parityDelegate.address,
			manifesto: parityDelegate.manifesto || '',
			network,
			name: parityDelegate.name
		};

		return delegate;
	});

	const polkassemblyDelegates = await OffChainDbService.GetPolkassemblyDelegates(network);

	const delegates: IDelegate[] = [...w3fDelegates, ...novaDelegates, ...parityDelegates, ...polkassemblyDelegates];

	const delegateDetailsPromises = delegates.map(async (delegate) => {
		const delegateDetails = await OnChainDbService.GetConvictionVotingDelegationDetails({ network, address: delegate.address });
		const publicUser = await OffChainDbService.GetPublicUserByAddress(delegate.address);

		return {
			...delegate,
			...delegateDetails,
			publicUser: publicUser ?? undefined
		};
	});

	const delegateDetails: IDelegateDetails[] = await Promise.all(delegateDetailsPromises);

	await RedisService.SetDelegateDetails(network, delegateDetails);

	return NextResponse.json(delegateDetails);
});
