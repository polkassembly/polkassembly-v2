// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ENetwork, EVoteDecision, EWallet } from '@/_shared/types';
import { Contract, ethers } from 'ethers';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import votingAbi from '@/app/_client-utils/abi/voting.json';
import { BN, BN_ZERO } from '@polkadot/util';
import { ClientError } from '../_client-utils/clientError';

export enum EConviction {
	NONE = 0,
	LOCKED1X = 1,
	LOCKED2X = 2,
	LOCKED3X = 3,
	LOCKED4X = 4,
	LOCKED5X = 5,
	LOCKED6X = 6
}
export interface IDelegateParams {
	trackId: number;
	representative: string;
	conviction: EConviction;
	amount: BN;
	selectedWallet: EWallet;
	network: ENetwork;
}

// Interface for undelegate parameters
export interface IUndelegateParams {
	trackId: number;
	selectedWallet: EWallet;
	network: ENetwork;
}

export class EthApiService {
	// eslint-disable-next-line class-methods-use-this
	private static async switchNetwork(provider: ethers.BrowserProvider, targetChainId: number, network: ENetwork) {
		const chainIdHex = `0x${targetChainId.toString(16)}`;

		try {
			await provider.send('wallet_switchEthereumChain', [{ chainId: chainIdHex }]);
		} catch (switchError: any) {
			if (switchError.code === 4902) {
				const networkDetails = NETWORKS_DETAILS[network];

				try {
					await provider.send('wallet_addEthereumChain', [
						{
							chainId: chainIdHex,
							chainName: networkDetails.name,
							nativeCurrency: {
								name: networkDetails.tokenSymbol,
								symbol: networkDetails.tokenSymbol,
								decimals: networkDetails.tokenDecimals
							},
							rpcUrls: networkDetails.rpcEndpoints.map((rpcEndpoint) => rpcEndpoint.url),
							blockExplorerUrls: networkDetails.socialLinks?.[0]?.href || null
						}
					]);
				} catch (addError) {
					throw new Error(`Failed to add network to wallet: ${(addError as Error).message}`);
				}
			} else {
				throw new Error(`Failed to switch network: ${switchError.message}`);
			}
		}
	}

	static async getContract(selectedWallet: EWallet, network: ENetwork, abi: any) {
		const wallet = selectedWallet === EWallet.METAMASK ? window.ethereum : selectedWallet === EWallet.TALISMAN ? (window as any).talismanEth : window.SubWallet;
		let web3 = new ethers.BrowserProvider(wallet);
		const { chainId: id } = await web3.getNetwork();
		const chainId = Number(id.toString());
		const networkChainId = NETWORKS_DETAILS[network].chainId;

		if (networkChainId && chainId !== networkChainId) {
			await this.switchNetwork(web3, networkChainId, network);
			web3 = new ethers.BrowserProvider(wallet);
		}
		const signer = await web3.getSigner();
		const { contractAddresses } = NETWORKS_DETAILS[network];
		if (!contractAddresses?.votingAddress) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Vote contract address not found');
		}
		if (!abi) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Moonbeam Conviction Voting ABI not found');
		}
		return new Contract(contractAddresses.votingAddress, abi, signer);
	}

	static async vote(
		vote: EVoteDecision,
		referendumId: number,
		conviction: number,
		selectedWallet: EWallet,
		network: ENetwork,
		lockedBalance?: BN,
		ayeVoteValue?: BN,
		nayVoteValue?: BN,
		abstainVoteValue?: BN
	) {
		const contract = await this.getContract(selectedWallet, network, votingAbi);
		if (!contract) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'contract not found');
		}
		if (vote === EVoteDecision.AYE) {
			if (!lockedBalance) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'lockedBalance cannot be undefined for AYE vote');
			}
			return contract.voteYes(referendumId, lockedBalance.toString(), conviction);
		}
		if (vote === EVoteDecision.NAY) {
			if (!lockedBalance) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'lockedBalance cannot be undefined for NAY vote');
			}
			return contract.voteNo(referendumId, lockedBalance.toString(), conviction);
		}
		if (vote === EVoteDecision.SPLIT) {
			if (!ayeVoteValue || !nayVoteValue) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'ayeVoteValue and nayVoteValue cannot be undefined for SPLIT vote');
			}
			return contract.voteSplit.toString();
		}
		if (vote === EVoteDecision.SPLIT_ABSTAIN) {
			if (!ayeVoteValue || !nayVoteValue || !abstainVoteValue) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'ayeVoteValue, nayVoteValue, and abstainVoteValue cannot all be undefined for SPLIT_ABSTAIN vote');
			}
			return contract.voteSplitAbstain(referendumId, ayeVoteValue.toString(), nayVoteValue.toString(), abstainVoteValue.toString());
		}

		throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid vote type');
	}

	static async delegate(params: IDelegateParams) {
		const { trackId, representative, conviction, amount, selectedWallet, network } = params;

		if (!representative || !ethers.isAddress(representative)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid representative address');
		}

		if (Number.isNaN(trackId)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid track ID');
		}

		if (amount.lte(BN_ZERO)) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Delegation amount must be greater than 0');
		}

		const contract = await this.getContract(selectedWallet, network, votingAbi);
		if (!contract) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Contract not found');
		}

		return contract.delegate(trackId, representative, conviction, amount.toString());
	}
}
