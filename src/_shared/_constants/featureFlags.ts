// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EFeature, ENetwork, EWallet } from '../types';

export const CREATE_PROPOSAL_NETWORKS = [ENetwork.CERE, ENetwork.POLKADOT, ENetwork.KUSAMA, ENetwork.WESTEND, ENetwork.PASEO];
export const SET_IDENTITY_NETWORKS = [ENetwork.CERE, ENetwork.POLKADOT, ENetwork.KUSAMA, ENetwork.WESTEND, ENetwork.PASEO];
export const DELEGATE_NETWORKS = [ENetwork.CERE, ENetwork.POLKADOT, ENetwork.KUSAMA, ENetwork.WESTEND, ENetwork.PASEO];
export const BOUNTY_NETWORKS = [ENetwork.CERE, ENetwork.POLKADOT, ENetwork.KUSAMA, ENetwork.WESTEND, ENetwork.PASEO];
export const EVM_ACTION_WALLETS = [EWallet.SUBWALLET, EWallet.TALISMAN];
export const METAMASK_SUPPORTED_FEATURES = [EFeature.VOTE_ON_PROPOSAL, EFeature.LOGIN, EFeature.COMMENT];
