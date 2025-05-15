// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getFormattedAddress } from '@/_shared/_utils/getFormattedAddress';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { snakeToPascalCase } from '@/_shared/_utils/snakeToPascalCase';
import { ENetwork, EProposalStatus, EProposalType, EProxyType, IAddressRelations, IMultisigAddress, IOnChainPostInfo, IProxyAddress } from '@/_shared/types';
import { SUBSCAN_API_KEY } from '@/app/api/_api-constants/apiEnvVars';
import { APIError } from '@/app/api/_api-utils/apiError';
import { fetchSubscanData } from '@/app/api/_api-utils/fetchSubscanData';
import { StatusCodes } from 'http-status-codes';

if (!SUBSCAN_API_KEY) {
	throw new Error('SUBSCAN_API_KEY env variable is not set');
}

export class SubscanOnChainService {
	private static postDetailsRequestMap = {
		[EProposalType.BOUNTY]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/bounties/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.COUNCIL_MOTION]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/council/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.DEMOCRACY_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/democracy/proposal`,
			body: {
				democracy_id: Number(id)
			}
		}),

		[EProposalType.FELLOWSHIP_REFERENDUM]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/fellowship/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.REFERENDUM]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/referenda/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.REFERENDUM_V2]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/referenda/referendum`,
			body: {
				referendum_index: Number(id)
			}
		}),

		[EProposalType.TECH_COMMITTEE_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/techcomm/proposal`,
			body: {
				proposal_id: Number(id)
			}
		}),

		[EProposalType.TIP]: (hash: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/treasury/tip`,
			body: {
				hash
			}
		}),

		[EProposalType.TREASURY_PROPOSAL]: (id: string, network: ENetwork) => ({
			url: `https://${network}.api.subscan.io/api/scan/treasury/proposal`,
			body: {
				proposal_id: Number(id)
			}
		})
	};

	private static accountByAddressRequest = ({ network, address }: { network: ENetwork; address: string }) => ({
		url: new URL(`https://${network}.api.subscan.io/api/v2/scan/search`),
		body: {
			key: address
		}
	});

	static async GetOnChainPostInfo({
		network,
		indexOrHash,
		proposalType
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
	}): Promise<IOnChainPostInfo | null> {
		if (proposalType !== EProposalType.TIP && !ValidatorService.isValidNumber(indexOrHash)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST);
		}

		const mappedRequestObject = this.postDetailsRequestMap[proposalType as keyof typeof this.postDetailsRequestMap]?.(indexOrHash, network);

		if (!mappedRequestObject) {
			return null;
		}

		const data = await fetchSubscanData({ url: new URL(mappedRequestObject.url), network, body: mappedRequestObject.body, method: 'POST' });

		if (data?.message !== 'Success') {
			return null;
		}

		return {
			proposer: ValidatorService.isValidSubstrateAddress(data?.data?.proposer?.address) ? getSubstrateAddress(data?.data?.proposer?.address) || '' : '',
			status: data?.data?.status || '',
			createdAt: data?.data?.timeline?.[0].time ? dayjs(data?.data?.timeline?.[0].time).toDate() : undefined,
			origin: data?.data?.origins ? snakeToPascalCase(data?.data?.origins) : undefined,
			index: data?.data?.referendum_index ?? undefined,
			hash: data?.data?.info?.hash || undefined,
			reward: data?.data?.pre_image?.amount,
			timeline:
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data?.data?.timeline?.map((item: any) => ({
					status: item.status as EProposalStatus,
					timestamp: dayjs(item.time).toDate(),
					block: item.block
				})) || undefined
		} as IOnChainPostInfo;
	}

	static async GetAccountRelations({ address, network }: { address: string; network: ENetwork }): Promise<IAddressRelations> {
		let addressRelationsResponse: IAddressRelations = {
			address: getFormattedAddress(address),
			multisigAddresses: [],
			proxyAddresses: [],
			proxiedAddresses: []
		};

		const addressRequest = this.accountByAddressRequest({ network, address: getFormattedAddress(address) });

		const subscanResponse = await fetchSubscanData({ url: addressRequest.url, network, body: addressRequest.body, method: 'POST' });

		if (!subscanResponse?.data?.account) {
			return addressRelationsResponse;
		}

		// user has keys for these addresses
		const proxyAddresses: Array<IProxyAddress> =
			subscanResponse.data?.account?.proxy?.proxy_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
				address: getFormattedAddress(proxy.account_display.address),
				proxyType: proxy.proxy_type as EProxyType
			})) || [];

		// user does not have keys for these addresses
		const proxiedAddresses: Array<IProxyAddress> =
			subscanResponse.data?.account?.proxy?.real_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
				address: getFormattedAddress(proxy.account_display.address),
				proxyType: proxy.proxy_type as EProxyType
			})) || [];

		const multisigAddresses: Array<string> =
			subscanResponse.data?.account?.multisig?.multi_account?.map((multisig: { address: string }) => getFormattedAddress(multisig.address)) || [];

		// fetch for multisig details
		// eslint-disable-next-line no-restricted-syntax
		for (const multisig of multisigAddresses) {
			const multisigRequest = this.accountByAddressRequest({ network, address: multisig });
			// eslint-disable-next-line no-await-in-loop
			const data = await fetchSubscanData({ url: multisigRequest.url, network, body: multisigRequest.body, method: 'POST' });

			const multisigSignatories: Array<string> =
				data.data?.account?.multisig?.multi_account_member?.map((member: { address: string }) => getFormattedAddress(member.address)) || [];

			const pureProxies: Array<IProxyAddress> =
				data.data?.account?.proxy?.real_account?.map((proxy: { account_display: { address: string }; proxy_type: string }) => ({
					address: getFormattedAddress(proxy.account_display.address),
					proxyType: proxy.proxy_type as EProxyType
				})) || [];

			const threshold = data.data?.account?.multisig?.threshold;

			if (!ValidatorService.isValidNumber(threshold)) {
				// eslint-disable-next-line no-continue
				continue;
			}

			const multisigData: IMultisigAddress = {
				address: multisig,
				pureProxies,
				signatories: multisigSignatories,
				threshold: Number(threshold)
			};

			addressRelationsResponse = {
				...addressRelationsResponse,
				multisigAddresses: [...addressRelationsResponse.multisigAddresses, multisigData]
			};
		}

		addressRelationsResponse = {
			...addressRelationsResponse,
			proxiedAddresses,
			proxyAddresses
		};

		return addressRelationsResponse;
	}
}
