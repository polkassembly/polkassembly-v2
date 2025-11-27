// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECohortStatus, EDVDelegateType, ENetwork, EPostOrigin, IDVCohort } from '../types';

export const DV_TRACKS = [
	EPostOrigin.WISH_FOR_CHANGE,
	EPostOrigin.TREASURER,
	EPostOrigin.SMALL_TIPPER,
	EPostOrigin.BIG_TIPPER,
	EPostOrigin.SMALL_SPENDER,
	EPostOrigin.MEDIUM_SPENDER,
	EPostOrigin.BIG_SPENDER
];

const KUSAMA_COHORT_1: IDVCohort = {
	index: 1,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-02-26T18:11:12Z'),
	startBlock: 22045831,
	endTime: new Date('2024-06-10T16:57:42Z'),
	endBlock: 23551323,
	delegatesCount: 5,
	guardiansCount: 0,
	delegationPerDelegate: 30000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS.filter((track) => track !== EPostOrigin.TREASURER && track !== EPostOrigin.WISH_FOR_CHANGE),
	delegates: [
		{ address: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj', type: EDVDelegateType.DAO, startBlock: 22045831, endBlock: 23551311 },
		{ address: 'FcjmeNzPk3vgdENm1rHeiMCxFK96beUoi2kb59FmCoZtkGF', type: EDVDelegateType.DAO, startBlock: 22045955, endBlock: 23551323 },
		{ address: 'FDL99LDYERjevxPnXBjNGHZv13FxCGHrqh2N5zWQXx1finf', type: EDVDelegateType.DAO, startBlock: 22045841, endBlock: 23551317 },
		{ address: 'J9FdcwiNLso4hcJFTeQvy7f7zszGhKoVh5hdBM2qF7joJQa', type: EDVDelegateType.DAO, startBlock: 22045955, endBlock: 23551323 },
		{ address: 'EocabFvqttEamwQKoFyQxLPnx9HWDdVDS9wwrUX1aKKbJ5g', type: EDVDelegateType.DAO, startBlock: 22045841, endBlock: 23551317 }
	]
};

const KUSAMA_COHORT_2: IDVCohort = {
	index: 2,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-06-20T17:34:30Z'),
	startBlock: 23694996,
	endTime: new Date('2024-10-09T14:15:24Z'),
	endBlock: 25266052,
	delegatesCount: 9,
	guardiansCount: 0,
	delegationPerDelegate: 18000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: 'CbNFBz4eykqiGqwYTfzRcYZGDh8xhbwwy4QaeiS4ctEPvXn', type: EDVDelegateType.DAO, startBlock: 23706451, endBlock: 25266047 },
		{ address: 'DDCNPp8oeYBcBM44b32iSse4t4yfTnDJbjQxohF59Fo23EF', type: EDVDelegateType.DAO, startBlock: 23706493, endBlock: 25266038 },
		{ address: 'Hw38QgLquVjhFc6TmXKzUQie3yezV8dsaP66CnZQm6Tc75M', type: EDVDelegateType.DAO, startBlock: 23707159, endBlock: 25266004 },
		{ address: 'DG8Q1VmFkmDwuKDN9ZqdB78W6BiXTX5Z33XzZNAykuB5nFh', type: EDVDelegateType.DAO, startBlock: 23707168, endBlock: 25266047 },
		{ address: 'H1qzURXmYGLfwMsviLpMeN8S9zjAPmc1LBCSeQkCAieKUFs', type: EDVDelegateType.DAO, startBlock: 23749289, endBlock: 25266038 },
		{ address: 'FDL99LDYERjevxPnXBjNGHZv13FxCGHrqh2N5zWQXx1finf', type: EDVDelegateType.DAO, startBlock: 23706462, endBlock: 25266052 },
		{ address: 'CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp', type: EDVDelegateType.DAO, startBlock: 23694996, endBlock: 25266027 },
		{ address: 'Ftuq9bHvQb5NiU5JA7q79fxYn9FVBeRjNBHL3RH5raN9qck', type: EDVDelegateType.DAO, startBlock: 23706476, endBlock: 25266052 },
		{ address: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj', type: EDVDelegateType.DAO, startBlock: 23694996, endBlock: 25266027 }
	]
};

const KUSAMA_COHORT_3: IDVCohort = {
	index: 3,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-11-11T16:07:06Z'),
	startBlock: 25732403,
	endTime: new Date('2025-04-14T13:35:24Z'),
	endBlock: 27921225,
	delegatesCount: 6,
	guardiansCount: 0,
	delegationPerDelegate: 30000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: 'DCZyhphXsRLcW84G9WmWEXtAA8DKGtVGSFZLJYty8Ajjyfa', type: EDVDelegateType.DAO, startBlock: 25732403, endBlock: 27921177 },
		{ address: 'JHTfbt39EL1CcbKteN6hG5L5pWo9XWi9XFiyuS9q24cAc8u', type: EDVDelegateType.DAO, startBlock: 25732465, endBlock: 27921177 },
		{ address: 'HcEbeTviCK33EddVN3mfJ6WymWLyKfFuekjhjn5PFirjJ5F', type: EDVDelegateType.DAO, startBlock: 25732529, endBlock: 27921225 },
		{ address: 'HYmYudY1cxN6XyY98dd82TckYF2YiPFc6sXmHqMoKifGAje', type: EDVDelegateType.DAO, startBlock: 25732529, endBlock: 27921225 },
		{ address: 'EPrEfsCZQtKt3Cp3vx6BSE4d9ACxMWTN2E5kQBRe612WpL2', type: EDVDelegateType.DAO, startBlock: 25732403, endBlock: 27921177 },
		{ address: 'Hgm7ELPfRmPKbHgGZCYEZGTjJX8VicXEnFKec7YAeFgAd4d', type: EDVDelegateType.DAO, startBlock: 25732465, endBlock: 27921177 }
	]
};

const KUSAMA_COHORT_4: IDVCohort = {
	index: 4,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2025-04-14T13:30:42Z'),
	startBlock: 27921178,
	endTime: new Date('2025-09-01T18:40:24Z'),
	endBlock: 29912023,
	delegatesCount: 6,
	guardiansCount: 0,
	delegationPerDelegate: 30000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: 'JHTfbt39EL1CcbKteN6hG5L5pWo9XWi9XFiyuS9q24cAc8u', type: EDVDelegateType.DAO, startBlock: 27921178, endBlock: 29911969 },
		{ address: 'ELCdsyWFNC7twEeBcQvdpCmpJhGBgiVeWtaKqRqXGn5ATiA', type: EDVDelegateType.DAO, startBlock: 27921280, endBlock: 29911925 },
		{ address: 'E3Ra4aGnmZGGtGaLsoCqjtJowT1qDvuLNEwB8t74M1UQrWM', type: EDVDelegateType.DAO, startBlock: 27921516, endBlock: 29912023 },
		{ address: 'Hgm7ELPfRmPKbHgGZCYEZGTjJX8VicXEnFKec7YAeFgAd4d', type: EDVDelegateType.DAO, startBlock: 27921178, endBlock: 29911969 },
		{ address: 'EwWrc8UZxaLE8WqCHkygUWAz1PxLc1Jdgzq1kMd8Ac7hKqF', type: EDVDelegateType.DAO, startBlock: 27921529, endBlock: 29912023 },
		{ address: 'DaCSCEQBRmMaBLRQQ5y7swdtfRzjcsewVgCCmngeigwLiax', type: EDVDelegateType.DAO, startBlock: 27921459, endBlock: 29911925 }
	]
};

const KUSAMA_COHORT_5: IDVCohort = {
	index: 5,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.ONGOING,
	startTime: new Date('2025-09-01T19:06:30Z'),
	startBlock: 29912282,
	delegatesCount: 7,
	guardiansCount: 5,
	delegationPerDelegate: 30000,
	delegationPerGuardian: 5000,
	tracks: DV_TRACKS,
	delegates: [
		{ address: 'GykHmXkXiMHV2hnsMdZ7xE7zgd9tiwT8k787MovVavAVmTH', type: EDVDelegateType.DAO, startBlock: 29912282, endBlock: null },
		{ address: 'DvJWp99ooffSqbTaM3sCYCxLUWbz2eEVqra9oeUZZYbMY14', type: EDVDelegateType.DAO, startBlock: 29912340, endBlock: null },
		{ address: 'D8LipdVuWD5tT3jCjt4WmYMfHi1vRVjpfbK9cz2G2HrWRLw', type: EDVDelegateType.DAO, startBlock: 29923134, endBlock: null },
		{ address: 'HYmYudY1cxN6XyY98dd82TckYF2YiPFc6sXmHqMoKifGAje', type: EDVDelegateType.DAO, startBlock: 29912325, endBlock: null },
		{ address: 'ELCdsyWFNC7twEeBcQvdpCmpJhGBgiVeWtaKqRqXGn5ATiA', type: EDVDelegateType.DAO, startBlock: 29912282, endBlock: null },
		{ address: 'HcEbeTviCK33EddVN3mfJ6WymWLyKfFuekjhjn5PFirjJ5F', type: EDVDelegateType.DAO, startBlock: 29912325, endBlock: null },
		{ address: 'EYSyMJjPk5HJb2ZDAYmEpBu7ZgWm7hZ5b1BE88uCifynRgt', type: EDVDelegateType.DAO, startBlock: 29912374, endBlock: null },

		{ address: 'EvoLanodoqDsgHb98Ymbu41uXXKfCPDKxeM6dXHyJ2JoVus', type: EDVDelegateType.GUARDIAN, startBlock: 29912400, endBlock: null },
		{ address: 'DuCg7rhST4TX6DWsyePUjntsmJd6UNyQVTHWD5BFjcgmgWp', type: EDVDelegateType.GUARDIAN, startBlock: 29912400, endBlock: null },
		{ address: 'EyPcJsHXv86Snch8GokZLZyrucug3gK1RAghBD2HxvL1YRZ', type: EDVDelegateType.GUARDIAN, startBlock: 29912423, endBlock: null },
		{ address: 'GNdJk9L6P84JXu6wibTzwPiB3vt2rwMjzGEETchf87uNuyW', type: EDVDelegateType.GUARDIAN, startBlock: 29912423, endBlock: null },
		{ address: 'FPznjjQJpHieoy3TUruw9YT6DDRETkBxWv3yFEVUMCgn8q8', type: EDVDelegateType.GUARDIAN, startBlock: 29912374, endBlock: null }
	]
};

export const DV_COHORTS_KUSAMA: IDVCohort[] = [KUSAMA_COHORT_1, KUSAMA_COHORT_2, KUSAMA_COHORT_3, KUSAMA_COHORT_4, KUSAMA_COHORT_5];

const POLKADOT_COHORT_1: IDVCohort = {
	index: 1,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-02-26T18:50:06Z'),
	startBlock: 19653189,
	endTime: new Date('2024-06-10T20:51:42Z'),
	endBlock: 21157754,
	delegatesCount: 7,
	guardiansCount: 0,
	delegationPerDelegate: 6000000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS.filter((track) => track !== EPostOrigin.TREASURER && track !== EPostOrigin.WISH_FOR_CHANGE),
	delegates: [
		{ address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K', type: EDVDelegateType.DAO, startBlock: 19653189, endBlock: 21157749 },
		{ address: '15fTH34bbKGMUjF1bLmTqxPYgpg481imThwhWcQfCyktyBzL', type: EDVDelegateType.DAO, startBlock: 19653237, endBlock: 21157738 },
		{ address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC', type: EDVDelegateType.DAO, startBlock: 19653264, endBlock: 21157744 },
		{ address: '1jPw3Qo72Ahn7Ynfg8kmYNLEPvHWHhPfPNgpJfp5bkLZdrF', type: EDVDelegateType.DAO, startBlock: 19653189, endBlock: 21157749 },
		{ address: '12s6UMSSfE2bNxtYrJc6eeuZ7UxQnRpUzaAh1gPQrGNFnE8h', type: EDVDelegateType.DAO, startBlock: 19653237, endBlock: 21157738 },
		{ address: '1ZSPR3zNg5Po3obkhXTPR95DepNBzBZ3CyomHXGHK9Uvx6w', type: EDVDelegateType.DAO, startBlock: 19653264, endBlock: 21157744 },
		{ address: '12mP4sjCfKbDyMRAEyLpkeHeoYtS5USY4x34n9NMwQrcEyoh', type: EDVDelegateType.DAO, startBlock: 19653280, endBlock: 21157754 }
	]
};

const POLKADOT_COHORT_2: IDVCohort = {
	index: 2,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-06-11T22:01:30Z'),
	startBlock: 21172801,
	endTime: new Date('2024-10-09T19:15:30Z'),
	endBlock: 22891629,
	delegatesCount: 10,
	guardiansCount: 0,
	delegationPerDelegate: 4200000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K', type: EDVDelegateType.DAO, startBlock: 21172801, endBlock: 22891629 },
		{ address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC', type: EDVDelegateType.DAO, startBlock: 21172834, endBlock: 22888566 },
		{ address: '12pXignPnq8sZvPtEsC3RdhDLAscqzFQz97pX2tpiNp3xLqo', type: EDVDelegateType.DAO, startBlock: 21172834, endBlock: 22888566 },
		{ address: '13Bf8PY8dks2EecNFW7hrqJ7r1aj7iEFFUudFJFvoprXdUiH', type: EDVDelegateType.DAO, startBlock: 21172851, endBlock: 22888555 },
		{ address: '1CaXBXVGNbey352w7ydA1A2yDyNQLshycom8Zyj69v5eRNK', type: EDVDelegateType.DAO, startBlock: 21172801, endBlock: 22891629 },
		{ address: '14Gn7SEmCgMX7Ukuppnw5TRjA7pao2HFpuJo39frB42tYLEh', type: EDVDelegateType.DAO, startBlock: 21172820, endBlock: 22891621 },
		{ address: '13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t', type: EDVDelegateType.DAO, startBlock: 21172851, endBlock: 22888555 },
		{ address: '16XYgDGN6MxvdmjhRsHLT1oqQVDwGdEPVQqC42pRXiZrE8su', type: EDVDelegateType.DAO, startBlock: 21173594, endBlock: 22888546 },
		{ address: '15TzZpYZa2rwfBNKhkDzuU1JApgACxD3m6pcaNt4SZneYTV5', type: EDVDelegateType.DAO, startBlock: 21172820, endBlock: 22891621 },
		{ address: '12BJTP99gUerdvBhPobiTvrWwRaj1i5eFHN9qx51JWgrBtmv', type: EDVDelegateType.DAO, startBlock: 21173594, endBlock: 22888546 }
	]
};

const POLKADOT_COHORT_3: IDVCohort = {
	index: 3,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2024-11-11T16:31:24Z'),
	startBlock: 23363983,
	endTime: new Date('2025-04-14T13:50:24Z'),
	endBlock: 25571026,
	delegatesCount: 6,
	guardiansCount: 0,
	delegationPerDelegate: 6000000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K', type: EDVDelegateType.DAO, startBlock: 23363983, endBlock: 25570898 },
		{ address: '12pXignPnq8sZvPtEsC3RdhDLAscqzFQz97pX2tpiNp3xLqo', type: EDVDelegateType.DAO, startBlock: 23363983, endBlock: 25570891 },
		{ address: '15KHTWdJyzyxaQbBNRmQN89KmFr1jPXXsPHM5Rxvd1Tkb2XZ', type: EDVDelegateType.DAO, startBlock: 23364955, endBlock: 25571026 },
		{ address: '16Gpd7FDEMR6STGyzTqKie4Xd3AXWNCjr6K8W8kSaG1r4VTQ', type: EDVDelegateType.DAO, startBlock: 23364976, endBlock: 25570912 },
		{ address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC', type: EDVDelegateType.DAO, startBlock: 23364976, endBlock: 25570905 },
		{ address: '13z9CiETVYCrxz3cghDuTyRGbaYQrwSyRnRcJX5iFbXvrwhT', type: EDVDelegateType.DAO, startBlock: 23364955, endBlock: 25571026 }
	]
};

const POLKADOT_COHORT_4: IDVCohort = {
	index: 4,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.CLOSED,
	startTime: new Date('2025-04-14T13:50:24Z'),
	startBlock: 25571026,
	endTime: new Date('2025-09-01T18:15:42Z'),
	endBlock: 27578624,
	delegatesCount: 6,
	guardiansCount: 0,
	delegationPerDelegate: 6000000,
	delegationPerGuardian: 0,
	tracks: DV_TRACKS,
	delegates: [
		{ address: '15KHTWdJyzyxaQbBNRmQN89KmFr1jPXXsPHM5Rxvd1Tkb2XZ', type: EDVDelegateType.DAO, startBlock: 25571027, endBlock: 27578617 },
		{ address: '14ZaBmSkr6JWf4fUDHbApqHBvbeeAEBSAARxgzXHcSruLELJ', type: EDVDelegateType.DAO, startBlock: 25571026, endBlock: 27578561 },
		{ address: '13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ', type: EDVDelegateType.DAO, startBlock: 25571091, endBlock: 27578624 },
		{ address: '13vYFRVn6d4e3vQtrFJppQKN9qhatbCLwci2JQdWuNoXw8i7', type: EDVDelegateType.DAO, startBlock: 25571060, endBlock: 27578624 },
		{ address: '13z9CiETVYCrxz3cghDuTyRGbaYQrwSyRnRcJX5iFbXvrwhT', type: EDVDelegateType.DAO, startBlock: 25571027, endBlock: 27578617 },
		{ address: '12mP4sjCfKbDyMRAEyLpkeHeoYtS5USY4x34n9NMwQrcEyoh', type: EDVDelegateType.DAO, startBlock: 25571048, endBlock: 27578561 }
	]
};

const POLKADOT_COHORT_5: IDVCohort = {
	index: 5,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.ONGOING,
	startTime: new Date('2025-09-01T18:11:12Z'),
	startBlock: 27578579,
	delegatesCount: 7,
	guardiansCount: 5,
	delegationPerDelegate: 2000000,
	delegationPerGuardian: 200000,
	tracks: DV_TRACKS,
	delegates: [
		{ address: '11fx8xKPNd4zVSBxkpN8qhhaGEmNJvPgKqwhDATZQXs7dkM', type: EDVDelegateType.DAO, startBlock: 27578766, endBlock: null },
		{ address: '14ZaBmSkr6JWf4fUDHbApqHBvbeeAEBSAARxgzXHcSruLELJ', type: EDVDelegateType.DAO, startBlock: 27578579, endBlock: null },
		{ address: '16Gpd7FDEMR6STGyzTqKie4Xd3AXWNCjr6K8W8kSaG1r4VTQ', type: EDVDelegateType.DAO, startBlock: 27578766, endBlock: null },
		{ address: '1313ciB4VzPeH3n1QKJym1brBmzRdfHBEctWipgH4uGsyF6n', type: EDVDelegateType.DAO, startBlock: 27578868, endBlock: null },
		{ address: '16m5p2WXqhRtYZFxzR4VUCBu9h9VDgg8AP1DzqUfduT4pdjD', type: EDVDelegateType.DAO, startBlock: 27578820, endBlock: null },
		{ address: '15EVjoms1KvEAvZaaNYYvnWHmc3Xg1Du3ECuARHyXdPyh1bs', type: EDVDelegateType.DAO, startBlock: 27578820, endBlock: null },
		{ address: '13du3Rt2CAV9L1v1QXTeYosuKaiBSYiPWpa2B4nxzfSdEAF1', type: EDVDelegateType.DAO, startBlock: 27578579, endBlock: null },

		{ address: '14oJnm4XKoNbzR6B8eqRF8rrt5eHvVgKN79y16L6jQvvp3pt', type: EDVDelegateType.GUARDIAN, startBlock: 27578931, endBlock: null },
		{ address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K', type: EDVDelegateType.GUARDIAN, startBlock: 27579005, endBlock: null },
		{ address: '1haHsRuCUCkbkPRmSrnfP8ps6cTaR2b5JCU5uNPUbxsVPbf', type: EDVDelegateType.GUARDIAN, startBlock: 27578931, endBlock: null },
		{ address: '13Q56KnUmLNe8fomKD3hoY38ZwLKZgRGdY4RTovRNFjMSwKw', type: EDVDelegateType.GUARDIAN, startBlock: 27579005, endBlock: null },
		{ address: '15oLanodWWweiZJSoDTEBtrX7oGfq6e8ct5y5E6fVRDPhUgj', type: EDVDelegateType.GUARDIAN, startBlock: 27578868, endBlock: null }
	]
};

export const DV_COHORTS_POLKADOT: IDVCohort[] = [POLKADOT_COHORT_1, POLKADOT_COHORT_2, POLKADOT_COHORT_3, POLKADOT_COHORT_4, POLKADOT_COHORT_5];
