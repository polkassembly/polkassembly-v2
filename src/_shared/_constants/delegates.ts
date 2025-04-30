// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDelegateSource, ENetwork, IDelegate } from '../types';

export const W3F_DELEGATES: IDelegate[] = [
	{
		address: '13SceNt2ELz3ti4rnQbY1snpYH4XE4fLFsW8ph9rpwJd6HFC',
		name: 'Polkassembly',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '13EyMuuDHwtq5RD6w3psCJ9WvJFZzDDion6Fd2FVAqxz1g7K',
		name: 'ChaosDAO OpenGov',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '1jPw3Qo72Ahn7Ynfg8kmYNLEPvHWHhPfPNgpJfp5bkLZdrF',
		name: 'JimmyTudeski - Polkadot Resident',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '15fTH34bbKGMUjF1bLmTqxPYgpg481imThwhWcQfCyktyBzL',
		name: 'HELIKON',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '12s6UMSSfE2bNxtYrJc6eeuZ7UxQnRpUzaAh1gPQrGNFnE8h',
		name: 'Polkadotters',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '153YD8ZHD9dRh82U419bSCB5SzWhbdAFzjj4NtA5pMazR2yC',
		name: 'SAXEMBERG',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '1ZSPR3zNg5Po3obkhXTPR95DepNBzBZ3CyomHXGHK9Uvx6w',
		name: 'William',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '12mP4sjCfKbDyMRAEyLpkeHeoYtS5USY4x34n9NMwQrcEyoh',
		name: 'Polkaworld',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '1CaXBXVGNbey352w7ydA1A2yDyNQLshycom8Zyj69v5eRNK',
		name: 'BRA_16-D',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '14Gn7SEmCgMX7Ukuppnw5TRjA7pao2HFpuJo39frB42tYLEh',
		name: 'EzioRed',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '12BJTP99gUerdvBhPobiTvrWwRaj1i5eFHN9qx51JWgrBtmv',
		name: 'OneBlock',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '16XYgDGN6MxvdmjhRsHLT1oqQVDwGdEPVQqC42pRXiZrE8su',
		name: 'Irina Karagyaur',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '1E1kTJXUnAg1r8xHKvgrZmF74qcfwYAUKF1mkgqjruRDd5w',
		name: 'Scytaledigital',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '12pXignPnq8sZvPtEsC3RdhDLAscqzFQz97pX2tpiNp3xLqo',
		name: 'Lucky Friday - OpenGov',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '16Gpd7FDEMR6STGyzTqKie4Xd3AXWNCjr6K8W8kSaG1r4VTQ',
		name: 'Le Nexus',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '13yX3RzydirMBHm8g5sKrmCM7kn3gHAQpZEDj5mzjBy52syM',
		name: 'Le Nexus',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '15KHTWdJyzyxaQbBNRmQN89KmFr1jPXXsPHM5Rxvd1Tkb2XZ',
		name: 'KusDAO',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '13z9CiETVYCrxz3cghDuTyRGbaYQrwSyRnRcJX5iFbXvrwhT',
		name: 'Polkadot Hungary DAO',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F]
	},
	{
		address: '15ubZj6T7NUYyQw6j4XBkEMJ2vew5w9kqKEcN1QG7Z1weKDV',
		image: 'https://i.ibb.co/7NYxpxWs/mdx-Editor-khushy1234-k-1745921355318.jpg',
		name: 'PERMANENCE DAO/HQ',
		network: ENetwork.POLKADOT,
		sources: [EDelegateSource.W3F],
		manifesto: 'A global multi-disciplinary collective of incorporated and individual contributors committed to the growth of Polkadot.'
	}
];

export const NOVA_DELEGATES: Record<string, URL> = {
	[ENetwork.POLKADOT]: new URL('https://raw.githubusercontent.com/novasamatech/opengov-delegate-registry/refs/heads/master/registry/polkadot.json')
};

export const PARITY_DELEGATES: Record<string, URL> = {
	[ENetwork.POLKADOT]: new URL('https://paritytech.github.io/governance-ui/data/polkadot/delegates.json')
};
