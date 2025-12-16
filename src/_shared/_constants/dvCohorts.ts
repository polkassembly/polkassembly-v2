// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECohortStatus, EDVDelegateType, ENetwork, EPostOrigin, IDVCohort } from '../types';

export const DV_TRACKS = [
	EPostOrigin.TREASURER,
	EPostOrigin.SMALL_TIPPER,
	EPostOrigin.BIG_TIPPER,
	EPostOrigin.SMALL_SPENDER,
	EPostOrigin.MEDIUM_SPENDER,
	EPostOrigin.BIG_SPENDER,
	EPostOrigin.WISH_FOR_CHANGE
];

const performanceDAO = 'Permanence DAO';
const luckyFridayLabs = 'Lucky Friday Labs';

const KUSAMA_COHORT_1: IDVCohort = {
	index: 1,
	id: 1,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-round-1-candidates-announced-23d9a800b260',
	delegation: 30000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 22045831,
		blockHash: '0x2b9f61c8de7b74e01e10654e571c2443aefd22600113b925c2f2f83ac90f5bd9',
		blockTime: 1708951272000
	},
	endIndexer: {
		blockHeight: 23551323,
		blockHash: '0xd17053accc96527bcf032e022093c96441bb8083f31c388f0fc5bc2b155fc1bf',
		blockTime: 1718018862001
	},
	allReferendaCnt: 60,
	dvTrackReferendaCnt: 25,
	tracks: DV_TRACKS.filter((track) => track !== EPostOrigin.TREASURER && track !== EPostOrigin.WISH_FOR_CHANGE),
	delegates: [
		{
			address: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj',
			startBlock: 22045831,
			endBlock: 23551311,
			cohortId: 1,
			name: 'Alex PromoTeam',
			w3f: 'G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf',
			role: EDVDelegateType.DAO
		},
		{
			address: 'EocabFvqttEamwQKoFyQxLPnx9HWDdVDS9wwrUX1aKKbJ5g',
			startBlock: 22045841,
			endBlock: 23551317,
			cohortId: 1,
			name: 'Alzymologist',
			w3f: 'HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX',
			role: EDVDelegateType.DAO
		},
		{
			address: 'FDL99LDYERjevxPnXBjNGHZv13FxCGHrqh2N5zWQXx1finf',
			startBlock: 22045841,
			endBlock: 23551317,
			cohortId: 1,
			name: 'Georgii / Space Invader',
			w3f: 'JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu',
			role: EDVDelegateType.DAO
		},
		{
			address: 'J9FdcwiNLso4hcJFTeQvy7f7zszGhKoVh5hdBM2qF7joJQa',
			startBlock: 22045955,
			endBlock: 23551323,
			cohortId: 1,
			name: 'Ivy voter collective',
			w3f: 'FrRVvtUNCnLvqvJxNrKAg9KVMtS52H574NCuSv98tUwhnMn',
			role: EDVDelegateType.DAO
		},
		{
			address: 'FcjmeNzPk3vgdENm1rHeiMCxFK96beUoi2kb59FmCoZtkGF',
			startBlock: 22045955,
			endBlock: 23551323,
			cohortId: 1,
			name: 'Staker Space',
			w3f: 'DAg8ajGfKYtmsCmdFurGbZ4gnfh6DYeNHK2L9VSNrwytgHd',
			role: EDVDelegateType.DAO
		}
	]
};

const KUSAMA_COHORT_2: IDVCohort = {
	index: 2,
	id: 2,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-2-b10ddb7c71cc',
	delegation: 18000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 23694996,
		blockHash: '0x4a7e5c53e81bb359d4d770b3f585fb17a5797a30a4a3de05b4ea30bb56aefa8f',
		blockTime: 1718885070000
	},
	endIndexer: {
		blockHeight: 25266052,
		blockHash: '0xd6f4c78c1a337f883967303e1bcb3d28f07f247f55c446925f3edbef4ecfa5ac',
		blockTime: 1728463524001
	},
	allReferendaCnt: 54,
	dvTrackReferendaCnt: 41,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: 'FDL99LDYERjevxPnXBjNGHZv13FxCGHrqh2N5zWQXx1finf',
			startBlock: 23706462,
			endBlock: 25266052,
			cohortId: 2,
			name: 'Georgii / Space Invader',
			w3f: 'JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu',
			role: EDVDelegateType.DAO
		},
		{
			address: 'GqC37KSFFeGAoL7YxSeP1YDwr85WJvLmDDQiSaprTDAm8Jj',
			startBlock: 23694996,
			endBlock: 25266027,
			cohortId: 2,
			name: 'Alex PromoTeam',
			w3f: 'G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf',
			role: EDVDelegateType.DAO
		},
		{
			address: 'CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp',
			startBlock: 23694996,
			endBlock: 25266027,
			cohortId: 2,
			name: 'Bruno Škvorc',
			w3f: 'EX9uchmfeSqKTM7cMMg8DkH49XV8i4R7a7rqCn8btpZBHDP',
			role: EDVDelegateType.DAO
		},
		{
			address: 'DG8Q1VmFkmDwuKDN9ZqdB78W6BiXTX5Z33XzZNAykuB5nFh',
			startBlock: 23707168,
			endBlock: 25266047,
			cohortId: 2,
			name: 'Dr. Jeff Cao',
			w3f: 'FRHfjRA7J7xufd9ZeG7g9wNdtfc1Uty7BYNJzgrVzcmQ4Mg',
			role: EDVDelegateType.DAO
		},
		{
			address: 'CbNFBz4eykqiGqwYTfzRcYZGDh8xhbwwy4QaeiS4ctEPvXn',
			startBlock: 23706451,
			endBlock: 25266047,
			cohortId: 2,
			name: 'Lorena Fabris',
			w3f: 'HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX',
			role: EDVDelegateType.DAO
		},
		{
			address: 'Ftuq9bHvQb5NiU5JA7q79fxYn9FVBeRjNBHL3RH5raN9qck',
			startBlock: 23706476,
			endBlock: 25266052,
			cohortId: 2,
			name: 'KSM Community Collective',
			w3f: 'DAg8ajGfKYtmsCmdFurGbZ4gnfh6DYeNHK2L9VSNrwytgHd',
			role: EDVDelegateType.DAO
		},
		{
			address: 'DDCNPp8oeYBcBM44b32iSse4t4yfTnDJbjQxohF59Fo23EF',
			startBlock: 23706493,
			endBlock: 25266038,
			cohortId: 2,
			name: 'Luke Schoen',
			w3f: 'FrRVvtUNCnLvqvJxNrKAg9KVMtS52H574NCuSv98tUwhnMn',
			role: EDVDelegateType.DAO
		},
		{
			address: 'H1qzURXmYGLfwMsviLpMeN8S9zjAPmc1LBCSeQkCAieKUFs',
			startBlock: 23749289,
			endBlock: 25266038,
			cohortId: 2,
			name: 'Roger Le',
			w3f: 'Emxxc2gJEw9T7FwsNr7WTyo5VueV4EjUqCuAq1pTggqQn95',
			role: EDVDelegateType.DAO
		},
		{
			address: 'Hw38QgLquVjhFc6TmXKzUQie3yezV8dsaP66CnZQm6Tc75M',
			startBlock: 23707159,
			endBlock: 25266004,
			cohortId: 2,
			name: 'Tommi/Hitchhooker | Rotko.net',
			w3f: 'GfYQKqmtjo2xnoP2XARi1Qms2Z198drsvdQBgXaUgJiQcRE',
			role: EDVDelegateType.DAO
		}
	]
};

const KUSAMA_COHORT_3: IDVCohort = {
	index: 3,
	id: 3,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-3-8acdff31bcb6',
	delegation: 30000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 25732403,
		blockHash: '0x07162110d0cdfaeb72e85f147ff4e42a3f0d1b3c31063f5a752573376b045e26',
		blockTime: 1731321426000
	},
	endIndexer: {
		blockHeight: 27921225,
		blockHash: '0x85e4113aa2db3f2d372ec2693702286051231bdbfc59caebeb6ce22e342881e0',
		blockTime: 1744617924000
	},
	allReferendaCnt: 46,
	dvTrackReferendaCnt: 34,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: 'DCZyhphXsRLcW84G9WmWEXtAA8DKGtVGSFZLJYty8Ajjyfa',
			startBlock: 25732403,
			endBlock: 27921177,
			cohortId: 3,
			name: 'ChaosDAO',
			w3f: 'G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf',
			role: EDVDelegateType.DAO
		},
		{
			address: 'JHTfbt39EL1CcbKteN6hG5L5pWo9XWi9XFiyuS9q24cAc8u',
			startBlock: 25732465,
			endBlock: 27921177,
			cohortId: 3,
			name: 'KusDAO',
			w3f: 'JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu',
			role: EDVDelegateType.DAO
		},
		{
			address: 'HYmYudY1cxN6XyY98dd82TckYF2YiPFc6sXmHqMoKifGAje',
			startBlock: 25732529,
			endBlock: 27921225,
			cohortId: 3,
			name: 'Le Nexus',
			w3f: 'DAg8ajGfKYtmsCmdFurGbZ4gnfh6DYeNHK2L9VSNrwytgHd',
			role: EDVDelegateType.DAO
		},
		{
			address: 'EPrEfsCZQtKt3Cp3vx6BSE4d9ACxMWTN2E5kQBRe612WpL2',
			startBlock: 25732403,
			endBlock: 27921177,
			cohortId: 3,
			name: luckyFridayLabs,
			w3f: 'EX9uchmfeSqKTM7cMMg8DkH49XV8i4R7a7rqCn8btpZBHDP',
			role: EDVDelegateType.DAO
		},
		{
			address: 'Hgm7ELPfRmPKbHgGZCYEZGTjJX8VicXEnFKec7YAeFgAd4d',
			startBlock: 25732465,
			endBlock: 27921177,
			cohortId: 3,
			name: 'Polkadot Hungary',
			w3f: 'HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX',
			role: EDVDelegateType.DAO
		},
		{
			address: 'HcEbeTviCK33EddVN3mfJ6WymWLyKfFuekjhjn5PFirjJ5F',
			startBlock: 25732529,
			endBlock: 27921225,
			cohortId: 3,
			name: 'Saxemberg',
			w3f: 'FrRVvtUNCnLvqvJxNrKAg9KVMtS52H574NCuSv98tUwhnMn',
			role: EDVDelegateType.DAO
		}
	]
};

const KUSAMA_COHORT_4: IDVCohort = {
	index: 4,
	id: 4,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-4-delegates-announced-a5a9c64927fd',
	delegation: 30000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 27921178,
		blockHash: '0xbff94ae55438c9332e71e30068092484a8525243697cb5f4a52cab295c116e31',
		blockTime: 1744617642000
	},
	endIndexer: {
		blockHeight: 29912023,
		blockHash: '0x35357a4cabb8fbae2697759d0568c4ff221a92c7ea79bf5ae1985d84d6388700',
		blockTime: 1756732224000
	},
	allReferendaCnt: 65,
	dvTrackReferendaCnt: 43,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: 'Hgm7ELPfRmPKbHgGZCYEZGTjJX8VicXEnFKec7YAeFgAd4d',
			startBlock: 27921178,
			endBlock: 29911969,
			cohortId: 4,
			name: 'Hungarian Polkadot DAO',
			w3f: 'HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX',
			role: EDVDelegateType.DAO
		},
		{
			address: 'EwWrc8UZxaLE8WqCHkygUWAz1PxLc1Jdgzq1kMd8Ac7hKqF',
			startBlock: 27921529,
			endBlock: 29912023,
			cohortId: 4,
			name: 'JAM Implementers DAO',
			w3f: 'FrRVvtUNCnLvqvJxNrKAg9KVMtS52H574NCuSv98tUwhnMn',
			role: EDVDelegateType.DAO
		},
		{
			address: 'JHTfbt39EL1CcbKteN6hG5L5pWo9XWi9XFiyuS9q24cAc8u',
			startBlock: 27921178,
			endBlock: 29911969,
			cohortId: 4,
			name: 'KusDAO',
			w3f: 'JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu',
			role: EDVDelegateType.DAO
		},
		{
			address: 'ELCdsyWFNC7twEeBcQvdpCmpJhGBgiVeWtaKqRqXGn5ATiA',
			startBlock: 27921280,
			endBlock: 29911925,
			cohortId: 4,
			name: performanceDAO,
			w3f: 'EX9uchmfeSqKTM7cMMg8DkH49XV8i4R7a7rqCn8btpZBHDP',
			role: EDVDelegateType.DAO
		},
		{
			address: 'DaCSCEQBRmMaBLRQQ5y7swdtfRzjcsewVgCCmngeigwLiax',
			startBlock: 27921459,
			endBlock: 29911925,
			cohortId: 4,
			name: 'Polkaworld',
			w3f: 'G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf',
			role: EDVDelegateType.DAO
		},
		{
			address: 'E3Ra4aGnmZGGtGaLsoCqjtJowT1qDvuLNEwB8t74M1UQrWM',
			startBlock: 27921516,
			endBlock: 29912023,
			cohortId: 4,
			name: 'Trustless Core',
			w3f: 'DAg8ajGfKYtmsCmdFurGbZ4gnfh6DYeNHK2L9VSNrwytgHd',
			role: EDVDelegateType.DAO
		}
	]
};

const KUSAMA_COHORT_5: IDVCohort = {
	index: 5,
	id: 5,
	network: ENetwork.KUSAMA,
	status: ECohortStatus.ONGOING,
	startTime: new Date('2025-09-01T19:06:30Z'),
	startBlock: 29912282,
	delegatesCount: 7,
	guardiansCount: 5,
	delegationPerDelegate: 30000,
	delegationPerGuardian: 5000,
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-5-announced-45fbf1c017ad',
	delegation: 30000000000000000,
	guardianDelegation: 5000000000000000,
	startIndexer: {
		blockHeight: 29912282,
		blockHash: '0x79b3fe6849a13f953f230890ff61e91b7a7349b66405dfecbeef45dae7eecea9',
		blockTime: 1756733790000
	},
	endIndexer: null,
	allReferendaCnt: 44,
	dvTrackReferendaCnt: 27,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: 'HYmYudY1cxN6XyY98dd82TckYF2YiPFc6sXmHqMoKifGAje',
			startBlock: 29912325,
			endBlock: null,
			cohortId: 5,
			name: 'Le Nexus',
			w3f: 'HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX',
			role: EDVDelegateType.DAO
		},
		{
			address: 'ELCdsyWFNC7twEeBcQvdpCmpJhGBgiVeWtaKqRqXGn5ATiA',
			startBlock: 29912282,
			endBlock: null,
			cohortId: 5,
			name: performanceDAO,
			w3f: 'EX9uchmfeSqKTM7cMMg8DkH49XV8i4R7a7rqCn8btpZBHDP',
			role: EDVDelegateType.DAO
		},
		{
			address: 'EYSyMJjPk5HJb2ZDAYmEpBu7ZgWm7hZ5b1BE88uCifynRgt',
			startBlock: 29912374,
			endBlock: null,
			cohortId: 5,
			name: 'Polkadot Poland DAO',
			w3f: 'Emxxc2gJEw9T7FwsNr7WTyo5VueV4EjUqCuAq1pTggqQn95',
			role: EDVDelegateType.DAO
		},
		{
			address: 'GykHmXkXiMHV2hnsMdZ7xE7zgd9tiwT8k787MovVavAVmTH',
			startBlock: 29912282,
			endBlock: null,
			cohortId: 5,
			name: 'REEEEEEEEEE DAO',
			w3f: 'G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf',
			role: EDVDelegateType.DAO
		},
		{
			address: 'HcEbeTviCK33EddVN3mfJ6WymWLyKfFuekjhjn5PFirjJ5F',
			startBlock: 29912325,
			endBlock: null,
			cohortId: 5,
			name: 'Saxemberg',
			w3f: 'JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu',
			role: EDVDelegateType.DAO
		},
		{
			address: 'DvJWp99ooffSqbTaM3sCYCxLUWbz2eEVqra9oeUZZYbMY14',
			startBlock: 29912340,
			endBlock: null,
			cohortId: 5,
			name: 'PBA Alumni Voting DAO',
			w3f: 'FrRVvtUNCnLvqvJxNrKAg9KVMtS52H574NCuSv98tUwhnMn',
			role: EDVDelegateType.DAO
		},
		{
			address: 'D8LipdVuWD5tT3jCjt4WmYMfHi1vRVjpfbK9cz2G2HrWRLw',
			startBlock: 29912340,
			endBlock: null,
			cohortId: 5,
			name: 'Trustless Core - Cohort 5',
			w3f: 'DAg8ajGfKYtmsCmdFurGbZ4gnfh6DYeNHK2L9VSNrwytgHd',
			role: EDVDelegateType.DAO
		},

		{
			address: 'EyPcJsHXv86Snch8GokZLZyrucug3gK1RAghBD2HxvL1YRZ',
			startBlock: 29912423,
			endBlock: null,
			cohortId: 5,
			name: 'Cybergov — AI Agents',
			w3f: 'CwCxSRmEQybec5sgiZuDxpYeSdusNcUXeTTB2RCsmiaWHxi',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: 'EvoLanodoqDsgHb98Ymbu41uXXKfCPDKxeM6dXHyJ2JoVus',
			startBlock: 29912400,
			endBlock: null,
			cohortId: 5,
			name: 'Daniel Olano',
			w3f: 'FRHfjRA7J7xufd9ZeG7g9wNdtfc1Uty7BYNJzgrVzcmQ4Mg',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: 'DuCg7rhST4TX6DWsyePUjntsmJd6UNyQVTHWD5BFjcgmgWp',
			startBlock: 29912400,
			endBlock: null,
			cohortId: 5,
			name: 'Flez',
			w3f: 'GfYQKqmtjo2xnoP2XARi1Qms2Z198drsvdQBgXaUgJiQcRE',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: 'GNdJk9L6P84JXu6wibTzwPiB3vt2rwMjzGEETchf87uNuyW',
			startBlock: 29912423,
			endBlock: null,
			cohortId: 5,
			name: 'GoverNoun AI (Governance Agent) — AI Agent',
			w3f: 'CwCxSRmEQybec5sgiZuDxpYeSdusNcUXeTTB2RCsmiaWHxi',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: 'FPznjjQJpHieoy3TUruw9YT6DDRETkBxWv3yFEVUMCgn8q8',
			startBlock: 29912374,
			endBlock: null,
			cohortId: 5,
			name: 'The White Rabbit',
			w3f: 'DMHW1yWZS4qingUwcJRjZSJ8SvbvMUEKZL1oMiwcUXHBGWA',
			role: EDVDelegateType.GUARDIAN
		}
	]
};

export const DV_COHORTS_KUSAMA: IDVCohort[] = [KUSAMA_COHORT_1, KUSAMA_COHORT_2, KUSAMA_COHORT_3, KUSAMA_COHORT_4, KUSAMA_COHORT_5];

const POLKADOT_COHORT_1: IDVCohort = {
	index: 1,
	id: 1,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-round-1-candidates-announced-23d9a800b260',
	delegation: 60000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 19653189,
		blockHash: '0xbbaa11785a3d4df0cc7dcc2ab3d20514c2422117a27c53341ba1f68a5a0851c9',
		blockTime: 1708953606000
	},
	endIndexer: {
		blockHeight: 21157754,
		blockHash: '0xe7b3d9ae448720a07d17c1b98e05445d376bee2afc7e30f335e295d46135c37e',
		blockTime: 1718032902000
	},
	allReferendaCnt: 380,
	dvTrackReferendaCnt: 380,
	tracks: DV_TRACKS.filter((track) => track !== EPostOrigin.TREASURER && track !== EPostOrigin.WISH_FOR_CHANGE),
	delegates: [
		{
			address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K',
			startBlock: 19653189,
			endBlock: 21157749,
			cohortId: 1,
			name: 'ChaosDAO',
			w3f: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
			role: EDVDelegateType.DAO
		},
		{
			address: '1jPw3Qo72Ahn7Ynfg8kmYNLEPvHWHhPfPNgpJfp5bkLZdrF',
			startBlock: 19653189,
			endBlock: 21157749,
			cohortId: 1,
			name: 'Jimmy Tudeski',
			w3f: '13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '15fTH34bbKGMUjF1bLmTqxPYgpg481imThwhWcQfCyktyBzL',
			startBlock: 19653237,
			endBlock: 21157738,
			cohortId: 1,
			name: 'Kukabi|Helikon',
			w3f: '12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn',
			role: EDVDelegateType.DAO
		},
		{
			address: '12s6UMSSfE2bNxtYrJc6eeuZ7UxQnRpUzaAh1gPQrGNFnE8h',
			startBlock: 19653237,
			endBlock: 21157738,
			cohortId: 1,
			name: 'Polkadotters',
			w3f: '13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK',
			role: EDVDelegateType.DAO
		},
		{
			address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC',
			startBlock: 19653264,
			endBlock: 21157744,
			cohortId: 1,
			name: 'Saxemberg',
			w3f: '14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ',
			role: EDVDelegateType.DAO
		},
		{
			address: '1ZSPR3zNg5Po3obkhXTPR95DepNBzBZ3CyomHXGHK9Uvx6w',
			startBlock: 19653264,
			endBlock: 21157744,
			cohortId: 1,
			name: 'William',
			w3f: '16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B',
			role: EDVDelegateType.DAO
		},
		{
			address: '12mP4sjCfKbDyMRAEyLpkeHeoYtS5USY4x34n9NMwQrcEyoh',
			startBlock: 19653280,
			endBlock: 21157754,
			cohortId: 1,
			name: 'Polkaworld',
			w3f: '12RYJb5gG4hfoWPK3owEYtmWoko8G6zwYpvDYTyXFVSfJr8Y',
			role: EDVDelegateType.DAO
		}
	]
};

const POLKADOT_COHORT_2: IDVCohort = {
	index: 2,
	id: 2,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-2-b10ddb7c71cc',
	delegation: 42000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 21172801,
		blockHash: '0xe8393fef49cc75304a37639fdbc505a93daf9ae8f27691d403ad0bd0fe013edc',
		blockTime: 1718123490000
	},
	endIndexer: {
		blockHeight: 22891629,
		blockHash: '0xed90bc6beca7f7f0dbb3f5518d731fcdd7b88e7e99ea70b872d19bf3a77ac9af',
		blockTime: 1728481530000
	},
	allReferendaCnt: 312,
	dvTrackReferendaCnt: 312,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: '1CaXBXVGNbey352w7ydA1A2yDyNQLshycom8Zyj69v5eRNK',
			startBlock: 21172801,
			endBlock: 22891629,
			cohortId: 2,
			name: 'BRA_16 Collective',
			w3f: '13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K',
			startBlock: 21172801,
			endBlock: 22891629,
			cohortId: 2,
			name: 'ChaosDAO',
			w3f: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
			role: EDVDelegateType.DAO
		},
		{
			address: '14Gn7SEmCgMX7Ukuppnw5TRjA7pao2HFpuJo39frB42tYLEh',
			startBlock: 21172820,
			endBlock: 22891621,
			cohortId: 2,
			name: 'Ezio Rojas',
			w3f: '13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK',
			role: EDVDelegateType.DAO
		},
		{
			address: '16XYgDGN6MxvdmjhRsHLT1oqQVDwGdEPVQqC42pRXiZrE8su',
			startBlock: 21173594,
			endBlock: 22888546,
			cohortId: 2,
			name: 'Irina Karagyaur',
			w3f: '14gAowz3LaAqYkRjqUZkjZUxKFUzLtN2oZJSfr3ziHBRhwgc',
			role: EDVDelegateType.DAO
		},
		{
			address: '12pXignPnq8sZvPtEsC3RdhDLAscqzFQz97pX2tpiNp3xLqo',
			startBlock: 21172834,
			endBlock: 22888566,
			cohortId: 2,
			name: luckyFridayLabs,
			w3f: '16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B',
			role: EDVDelegateType.DAO
		},
		{
			address: '15TzZpYZa2rwfBNKhkDzuU1JApgACxD3m6pcaNt4SZneYTV5',
			startBlock: 21172820,
			endBlock: 22891621,
			cohortId: 2,
			name: 'Mexican Collective',
			w3f: '12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn',
			role: EDVDelegateType.DAO
		},
		{
			address: '12BJTP99gUerdvBhPobiTvrWwRaj1i5eFHN9qx51JWgrBtmv',
			startBlock: 21173594,
			endBlock: 22888546,
			cohortId: 2,
			name: 'OneBlock+',
			w3f: '13c1FsantxSuaNocA6pUsAxiinHSVp2m7hUVg1EJSwxf2L2j',
			role: EDVDelegateType.DAO
		},
		{
			address: '13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t',
			startBlock: 21172851,
			endBlock: 22888555,
			cohortId: 2,
			name: 'Polkassembly',
			w3f: '12RYJb5gG4hfoWPK3owEYtmWoko8G6zwYpvDYTyXFVSfJr8Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC',
			startBlock: 21172834,
			endBlock: 22888566,
			cohortId: 2,
			name: 'Saxemberg',
			w3f: '14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ',
			role: EDVDelegateType.DAO
		},
		{
			address: '13Bf8PY8dks2EecNFW7hrqJ7r1aj7iEFFUudFJFvoprXdUiH',
			startBlock: 21172851,
			endBlock: 22888555,
			cohortId: 2,
			name: 'Scytale Digital',
			w3f: '15fUbpx8ooAWN1mZK6jN4cjeAS3a5remWPmctDu9KRBshhqA',
			role: EDVDelegateType.DAO
		}
	]
};

const POLKADOT_COHORT_3: IDVCohort = {
	index: 3,
	id: 3,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-3-8acdff31bcb6',
	delegation: 60000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 23363983,
		blockHash: '0x783180e1e8520b71742f154df4c722da5b4cefe903b0ddf093b28406302236b8',
		blockTime: 1731322884001
	},
	endIndexer: {
		blockHeight: 25571026,
		blockHash: '0xf08e99db347e207c0539d1c7c8dc4ab4b443c3fb74c5d8bef8722f71e5b43edb',
		blockTime: 1744618824000
	},
	allReferendaCnt: 260,
	dvTrackReferendaCnt: 228,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K',
			startBlock: 23363983,
			endBlock: 25570898,
			cohortId: 3,
			name: 'ChaosDAO',
			w3f: '13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '15KHTWdJyzyxaQbBNRmQN89KmFr1jPXXsPHM5Rxvd1Tkb2XZ',
			startBlock: 23364955,
			endBlock: 25571026,
			cohortId: 3,
			name: 'KusDAO',
			w3f: '13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK',
			role: EDVDelegateType.DAO
		},
		{
			address: '16Gpd7FDEMR6STGyzTqKie4Xd3AXWNCjr6K8W8kSaG1r4VTQ',
			startBlock: 23364976,
			endBlock: 25570912,
			cohortId: 3,
			name: 'Le Nexus',
			w3f: '14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ',
			role: EDVDelegateType.DAO
		},
		{
			address: '12pXignPnq8sZvPtEsC3RdhDLAscqzFQz97pX2tpiNp3xLqo',
			startBlock: 23363983,
			endBlock: 25570891,
			cohortId: 3,
			name: luckyFridayLabs,
			w3f: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
			role: EDVDelegateType.DAO
		},
		{
			address: '13z9CiETVYCrxz3cghDuTyRGbaYQrwSyRnRcJX5iFbXvrwhT',
			startBlock: 23364955,
			endBlock: 25571026,
			cohortId: 3,
			name: 'Polkadot Hungary',
			w3f: '12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn',
			role: EDVDelegateType.DAO
		},
		{
			address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC',
			startBlock: 23364976,
			endBlock: 25570905,
			cohortId: 3,
			name: 'Saxemberg',
			w3f: '16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B',
			role: EDVDelegateType.DAO
		}
	]
};

const POLKADOT_COHORT_4: IDVCohort = {
	index: 4,
	id: 4,
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
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-4-delegates-announced-a5a9c64927fd',
	delegation: 60000000000000000,
	guardianDelegation: 0,
	startIndexer: {
		blockHeight: 25571026,
		blockHash: '0xf08e99db347e207c0539d1c7c8dc4ab4b443c3fb74c5d8bef8722f71e5b43edb',
		blockTime: 1744618824000
	},
	endIndexer: {
		blockHeight: 27578624,
		blockHash: '0x4d430c136270f5f171cde72f493d5ff351e008203d4e41fbd0ea3096f52f5d23',
		blockTime: 1756730742001
	},
	allReferendaCnt: 194,
	dvTrackReferendaCnt: 174,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: '13z9CiETVYCrxz3cghDuTyRGbaYQrwSyRnRcJX5iFbXvrwhT',
			startBlock: 25571027,
			endBlock: 27578617,
			cohortId: 4,
			name: 'Hungarian Polkadot DAO',
			w3f: '12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn',
			role: EDVDelegateType.DAO
		},
		{
			address: '13NCLd3foNpsv1huPDzvvfyKh37NEEkGFotZnP52CTR98YFJ',
			startBlock: 25571091,
			endBlock: 27578624,
			cohortId: 4,
			name: 'JAM Implementers DAO',
			w3f: '16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B',
			role: EDVDelegateType.DAO
		},
		{
			address: '15KHTWdJyzyxaQbBNRmQN89KmFr1jPXXsPHM5Rxvd1Tkb2XZ',
			startBlock: 25571027,
			endBlock: 27578617,
			cohortId: 4,
			name: 'KusDAO',
			w3f: '13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK',
			role: EDVDelegateType.DAO
		},
		{
			address: '14ZaBmSkr6JWf4fUDHbApqHBvbeeAEBSAARxgzXHcSruLELJ',
			startBlock: 25571026,
			endBlock: 27578561,
			cohortId: 4,
			name: performanceDAO,
			w3f: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
			role: EDVDelegateType.DAO
		},
		{
			address: '12mP4sjCfKbDyMRAEyLpkeHeoYtS5USY4x34n9NMwQrcEyoh',
			startBlock: 25571048,
			endBlock: 27578561,
			cohortId: 4,
			name: 'Polkaworld',
			w3f: '13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '13vYFRVn6d4e3vQtrFJppQKN9qhatbCLwci2JQdWuNoXw8i7',
			startBlock: 25571060,
			endBlock: 27578624,
			cohortId: 4,
			name: 'Trustless Core',
			w3f: '14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ',
			role: EDVDelegateType.DAO
		}
	]
};

const POLKADOT_COHORT_5: IDVCohort = {
	index: 5,
	id: 5,
	network: ENetwork.POLKADOT,
	status: ECohortStatus.ONGOING,
	startTime: new Date('2025-09-01T18:11:12Z'),
	startBlock: 27578579,
	delegatesCount: 7,
	guardiansCount: 5,
	delegationPerDelegate: 2000000,
	delegationPerGuardian: 200000,
	announcementLink: 'https://medium.com/web3foundation/decentralized-voices-cohort-5-announced-45fbf1c017ad',
	delegation: 20000000000000000,
	guardianDelegation: 2000000000000000,
	startIndexer: {
		blockHeight: 27578579,
		blockHash: '0xf06ea543532302ca642f46f7c27722882d0410970f49bd5a0e5f0d620ec161e4',
		blockTime: 1756730472000
	},
	endIndexer: null,
	allReferendaCnt: 103,
	dvTrackReferendaCnt: 80,
	tracks: DV_TRACKS,
	delegates: [
		{
			address: '16Gpd7FDEMR6STGyzTqKie4Xd3AXWNCjr6K8W8kSaG1r4VTQ',
			startBlock: 27578766,
			endBlock: null,
			cohortId: 5,
			name: 'Le Nexus',
			w3f: '12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn',
			role: EDVDelegateType.DAO
		},
		{
			address: '14ZaBmSkr6JWf4fUDHbApqHBvbeeAEBSAARxgzXHcSruLELJ',
			startBlock: 27578579,
			endBlock: null,
			cohortId: 5,
			name: performanceDAO,
			w3f: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
			role: EDVDelegateType.DAO
		},
		{
			address: '1313ciB4VzPeH3n1QKJym1brBmzRdfHBEctWipgH4uGsyF6n',
			startBlock: 27578868,
			endBlock: null,
			cohortId: 5,
			name: 'Polkadot Poland DAO',
			w3f: '12RYJb5gG4hfoWPK3owEYtmWoko8G6zwYpvDYTyXFVSfJr8Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '13du3Rt2CAV9L1v1QXTeYosuKaiBSYiPWpa2B4nxzfSdEAF1',
			startBlock: 27578579,
			endBlock: null,
			cohortId: 5,
			name: 'REEEEEEEEEE DAO',
			w3f: '13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y',
			role: EDVDelegateType.DAO
		},
		{
			address: '11fx8xKPNd4zVSBxkpN8qhhaGEmNJvPgKqwhDATZQXs7dkM',
			startBlock: 27578766,
			endBlock: null,
			cohortId: 5,
			name: 'Saxemberg',
			w3f: '13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK',
			role: EDVDelegateType.DAO
		},
		{
			address: '16m5p2WXqhRtYZFxzR4VUCBu9h9VDgg8AP1DzqUfduT4pdjD',
			startBlock: 27578820,
			endBlock: null,
			cohortId: 5,
			name: 'Trustless Core - Cohort 5',
			w3f: '14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ',
			role: EDVDelegateType.DAO
		},
		{
			address: '15EVjoms1KvEAvZaaNYYvnWHmc3Xg1Du3ECuARHyXdPyh1bs',
			startBlock: 27578820,
			endBlock: null,
			cohortId: 5,
			name: 'PBA Alumni Voting DAO',
			w3f: '16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B',
			role: EDVDelegateType.DAO
		},

		{
			address: '13Q56KnUmLNe8fomKD3hoY38ZwLKZgRGdY4RTovRNFjMSwKw',
			startBlock: 27579005,
			endBlock: null,
			cohortId: 5,
			name: 'Cybergov — AI Agents',
			w3f: '13Fv7btqKR2NQVZSaJAK1DhxKpxgjzE8twaWnwDk8B1u6voR',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: '15oLanodWWweiZJSoDTEBtrX7oGfq6e8ct5y5E6fVRDPhUgj',
			startBlock: 27578868,
			endBlock: null,
			cohortId: 5,
			name: 'Daniel Olano',
			w3f: '15fUbpx8ooAWN1mZK6jN4cjeAS3a5remWPmctDu9KRBshhqA',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: '1haHsRuCUCkbkPRmSrnfP8ps6cTaR2b5JCU5uNPUbxsVPbf',
			startBlock: 27578931,
			endBlock: null,
			cohortId: 5,
			name: 'Flez',
			w3f: '13c1FsantxSuaNocA6pUsAxiinHSVp2m7hUVg1EJSwxf2L2j',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: '14oJnm4XKoNbzR6B8eqRF8rrt5eHvVgKN79y16L6jQvvp3pt',
			startBlock: 27578931,
			endBlock: null,
			cohortId: 5,
			name: 'GoverNoun AI (Governance Agent) — AI Agent',
			w3f: '14gAowz3LaAqYkRjqUZkjZUxKFUzLtN2oZJSfr3ziHBRhwgc',
			role: EDVDelegateType.GUARDIAN
		},
		{
			address: '13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K',
			startBlock: 27579005,
			endBlock: null,
			cohortId: 5,
			name: 'The White Rabbit',
			w3f: '15FZotswrG9r6KQvBPb5Y3ybs6CA5FLbFbyzhk4ABfgDup22',
			role: EDVDelegateType.GUARDIAN
		}
	]
};

export const DV_COHORTS_POLKADOT: IDVCohort[] = [POLKADOT_COHORT_1, POLKADOT_COHORT_2, POLKADOT_COHORT_3, POLKADOT_COHORT_4, POLKADOT_COHORT_5];
