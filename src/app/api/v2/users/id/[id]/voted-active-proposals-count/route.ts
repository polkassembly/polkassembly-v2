// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { encodeAddress } from '@polkadot/util-crypto';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const addresses = await OffChainDbService.GetAddressesForUserId(id);
	if (!addresses?.length) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'No addresses found for user');
	}

	const encodedAddresses = addresses
		.filter((address) => ValidatorService.isValidSubstrateAddress(address.address))
		.map((address) => encodeAddress(address.address, NETWORKS_DETAILS[network as ENetwork].ss58Format));

	const { activeProposalsCount, votedProposalsCount } = await OnChainDbService.GetActiveVotedProposalsCount({
		addresses: encodedAddresses,
		network
	});

	return NextResponse.json({ activeProposalsCount, votedProposalsCount });
});
