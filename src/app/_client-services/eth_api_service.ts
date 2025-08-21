// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ENetwork, EVoteDecision, EWallet } from '@/_shared/types';
import { Contract, ethers } from 'ethers';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import moonbeamConvictionVotingAbi from '@/app/_client-utils/moonbeamConvictionVoting.json';
import { BN } from '@polkadot/util';
import { ClientError } from '../_client-utils/clientError';

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

	static async getContract(selectedWallet: EWallet, network: ENetwork) {
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
		const { contractAddress } = NETWORKS_DETAILS[network];
		if (!contractAddress) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Vote contract address not found');
		}
		const abi = network === ENetwork.MOONBEAM ? moonbeamConvictionVotingAbi : null;
		if (!abi) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Moonbeam Conviction Voting ABI not found');
		}
		return new Contract(contractAddress, abi, signer);
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
		const contract = await this.getContract(selectedWallet, network);
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
}
