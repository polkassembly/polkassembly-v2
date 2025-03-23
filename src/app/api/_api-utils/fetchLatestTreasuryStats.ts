// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ENetwork, ITreasuryStats } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from './apiError';

export async function fetchLatestTreasuryStats(network: ENetwork): Promise<ITreasuryStats | null> {
	try {
		const { ApiPromise, WsProvider } = await import('@polkadot/api');
		const { BN } = await import('@polkadot/util');
		const { TREASURY_NETWORK_CONFIG } = await import('@/_shared/_constants/treasury');

		// Define the Treasury Stats structure
		const treasuryStats: ITreasuryStats = {
			network,
			createdAt: new Date(),
			updatedAt: new Date(),
			relayChain: {
				dot: '',
				myth: ''
			},
			ambassador: {
				usdt: ''
			},
			assetHub: {
				dot: '',
				usdc: '',
				usdt: ''
			},
			hydration: {
				dot: '',
				usdc: '',
				usdt: ''
			},
			bounties: {
				dot: ''
			},
			fellowship: {
				dot: '',
				usdt: ''
			},
			total: {
				totalDot: '',
				totalUsdc: '',
				totalUsdt: '',
				totalMyth: ''
			},
			loans: {
				dot: '',
				usdc: ''
			}
		};

		const config = TREASURY_NETWORK_CONFIG[network as ENetwork];
		if (!config) {
			throw new APIError(ERROR_CODES.NETWORK_NOT_SUPPORTED, StatusCodes.BAD_REQUEST);
		}

		treasuryStats.loans = {
			dot: config.loanAmounts.dot,
			usdc: config.loanAmounts.usdc
		};

		// 1. get relay chain stats
		const api = new ApiPromise({
			provider: new WsProvider(config.relayChainRpc)
		});
		await api.isReady;

		// Using type assertion with unknown as intermediate step for better safety
		const treasuryAccountInfo = await api.query.system.account(config.treasuryAccount);
		const treasuryBalance = (treasuryAccountInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString();
		treasuryStats.relayChain = {
			dot: treasuryBalance,
			myth: ''
		};

		// Function to filter bounties
		const filterBountiesData = (items: unknown[]) => {
			return items.filter((item) => {
				const { isFunded, isCuratorProposed, isActive } =
					(item as { bounty?: { status: { isFunded?: boolean; isCuratorProposed?: boolean; isActive?: boolean } } })?.bounty?.status || {};
				return isFunded || isCuratorProposed || isActive;
			});
		};

		// Cast to unknown first to avoid direct DeriveBounties type assignment
		const deriveBounties = await api?.derive.bounties?.bounties();
		const activePjsBounties = filterBountiesData(deriveBounties as unknown as unknown[]);

		const balances = await Promise.all(
			activePjsBounties.map(async (bounty) => {
				const bountyData = bounty as { index?: { toJSON: () => string } };
				const id = bountyData?.index?.toJSON();
				if (!id) return new BN(0);

				try {
					// fetch bounty data from subsquare
					const response = await fetch(`https://polkadot.subsquare.io/api/treasury/bounties/${id}`);
					if (!response.ok) {
						throw new Error(`Failed to fetch data for bounty ${id}: ${response.statusText}`);
					}
					const result = await response.json();
					const address = result?.onchainData?.address;

					if (!address) {
						const metadataValue = result?.onchainData?.meta?.value || 0;
						return new BN(metadataValue);
					}

					try {
						const accountData = await api.query.system.account(address);
						const accountInfo = accountData as unknown as { data: { free: { toString: () => string }; reserved: { toString: () => string } } };
						return new BN(accountInfo.data.free.toString()).add(new BN(accountInfo.data.reserved.toString()));
					} catch (accountError) {
						console.error(`Error fetching account data for bounty ${id}: ${accountError}, address: ${address}`);
						return new BN(0);
					}
				} catch (error) {
					console.error(`Error fetching balance for bounty index ${id}: ${error}`);
					return new BN(0);
				}
			})
		);

		const bountiesTotal = balances.reduce((acc, curr) => acc.add(curr), new BN(0)).toString();
		treasuryStats.bounties = {
			dot: bountiesTotal
		};
		await api.disconnect();

		// 2. get asset hub stats
		const assetHubApi = new ApiPromise({
			provider: new WsProvider(config.assetHubRpc)
		});
		await assetHubApi.isReady;

		// relay chain assethub dot balance
		const treasuryAddressInfo = await assetHubApi.query.system.account(config.assetHubTreasuryAddress);
		const relayChainAssethubDotBalance = (treasuryAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString();
		treasuryStats.assetHub = {
			dot: relayChainAssethubDotBalance,
			usdc: '',
			usdt: ''
		};

		// fellowship assethub dot balance
		const fellowshipAddressInfo = await assetHubApi.query.system.account(config.assetHubFellowshipAddress);
		const fellowshipAssethubDotBalance = (fellowshipAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString();
		treasuryStats.fellowship = {
			dot: fellowshipAssethubDotBalance,
			usdt: ''
		};

		// relay chain assethub usdt balance
		const relayChainAssethubUsdtBalance = await assetHubApi.query.assets.account(config.usdtIndex, config.assetHubTreasuryAddress);

		// Type safe checks with generic structure
		const getBalanceIfExists = (result: unknown): string => {
			if (!result || typeof result !== 'object') {
				return '';
			}

			// Cast to unknown first and check properties
			const resultObj = result as unknown;
			if (
				resultObj &&
				typeof resultObj === 'object' &&
				'isSome' in resultObj &&
				(resultObj as { isSome: boolean }).isSome === true &&
				'unwrap' in resultObj &&
				// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
				typeof (resultObj as { unwrap: Function }).unwrap === 'function'
			) {
				// Now safely unwrap
				const unwrapped = (resultObj as { unwrap: () => unknown }).unwrap();

				if (
					unwrapped &&
					typeof unwrapped === 'object' &&
					'balance' in unwrapped &&
					(unwrapped as { balance: unknown }).balance &&
					typeof (unwrapped as { balance: { toString: () => string } }).balance.toString === 'function'
				) {
					return (unwrapped as { balance: { toString: () => string } }).balance.toString();
				}
			}
			return '';
		};

		treasuryStats.assetHub.usdt = getBalanceIfExists(relayChainAssethubUsdtBalance);

		// fellowship assethub usdt balance
		const fellowshipAssethubUsdtBalance = await assetHubApi.query.assets.account(config.usdtIndex, config.assetHubFellowshipUsdtAddress);
		treasuryStats.fellowship.usdt = getBalanceIfExists(fellowshipAssethubUsdtBalance);

		// ambassador usdt balance
		const ambassadorUsdtBalance = await assetHubApi.query.assets.account(config.usdtIndex, config.assetHubAmbassadorAddress);
		treasuryStats.ambassador = {
			usdt: getBalanceIfExists(ambassadorUsdtBalance)
		};

		// relay chain assethub usdc balance
		const relayChainAssethubUsdcBalance = await assetHubApi.query.assets.account(config.usdcIndex, config.assetHubTreasuryAddress);
		treasuryStats.assetHub.usdc = getBalanceIfExists(relayChainAssethubUsdcBalance);

		// relay chain myth assethub dot balance
		const relayChainAssethubMythDotBalance = await assetHubApi.query.foreignAssets.account(
			{
				parents: 1,
				interior: {
					X1: [
						{
							Parachain: config.mythosParachainId
						}
					]
				}
			},
			config.assetHubMythAddress
		);
		treasuryStats.relayChain.myth = getBalanceIfExists(relayChainAssethubMythDotBalance);

		await assetHubApi.disconnect();

		// 3. get hydration stats
		const hydrationApi = new ApiPromise({
			provider: new WsProvider(config.hydrationRpc)
		});
		await hydrationApi.isReady;

		const ZERO_BN = new BN(0);
		let hydrationDotBalance = ZERO_BN;
		let hydrationUsdcBalance = ZERO_BN;
		let hydrationUsdtBalance = ZERO_BN;

		// Use Promise.all instead of a for loop to avoid linter warnings about awaits in loops
		await Promise.all(
			config.hydrationAddresses.map(async (address) => {
				// Helper function to safely get token balance
				const getTokenBalance = async (assetId: number) => {
					try {
						const tokenBalance = await hydrationApi?.query?.tokens?.accounts(address, assetId);
						if (tokenBalance && typeof tokenBalance === 'object') {
							const tokenData = tokenBalance as { free?: { toString?: () => string }; reserved?: { toString?: () => string } };
							const free = tokenData.free?.toString?.() || '0';
							const reserved = tokenData.reserved?.toString?.() || '0';
							return {
								free: new BN(free),
								reserved: new BN(reserved)
							};
						}
					} catch (error) {
						console.error(`Error fetching token balance for address ${address}, asset ${assetId}: ${error}`);
					}
					return { free: ZERO_BN, reserved: ZERO_BN };
				};

				// get dot balance
				const { free: freeDOTBalance, reserved: reservedDOTBalance } = await getTokenBalance(config.hydrationDotAssetId);
				hydrationDotBalance = hydrationDotBalance.add(freeDOTBalance).add(reservedDOTBalance);

				// get usdc balance
				const { free: freeUSDCBalance, reserved: reservedUSDCBalance } = await getTokenBalance(config.hydrationUsdcAssetId);
				hydrationUsdcBalance = hydrationUsdcBalance.add(freeUSDCBalance).add(reservedUSDCBalance);

				// get usdt balance
				const { free: freeUSDTBalance, reserved: reservedUSDTBalance } = await getTokenBalance(config.hydrationUsdtAssetId);
				hydrationUsdtBalance = hydrationUsdtBalance.add(freeUSDTBalance).add(reservedUSDTBalance);
			})
		);

		treasuryStats.hydration = {
			dot: hydrationDotBalance.isZero() ? '' : hydrationDotBalance.toString(),
			usdc: hydrationUsdcBalance.isZero() ? '' : hydrationUsdcBalance.toString(),
			usdt: hydrationUsdtBalance.isZero() ? '' : hydrationUsdtBalance.toString()
		};

		await hydrationApi.disconnect();

		// 5. add for total treasury stats
		const zeroBN = new BN(0);

		// Calculate totals
		const calculateTotal = (propertyName: 'dot' | 'usdc' | 'usdt' | 'myth'): string => {
			let total = zeroBN;

			Object.values(treasuryStats).forEach((section) => {
				if (section && typeof section === 'object' && propertyName in section) {
					const value = (section as Record<string, string>)[propertyName as keyof typeof section];
					if (value && value !== '') {
						total = total.add(new BN(value));
					}
				}
			});

			return total.toString();
		};

		treasuryStats.total = {
			totalDot: calculateTotal('dot'),
			totalUsdc: calculateTotal('usdc'),
			totalUsdt: calculateTotal('usdt'),
			totalMyth: calculateTotal('myth')
		};

		return treasuryStats;
	} catch (error) {
		console.error(`Error fetching treasury stats: ${error}`);
		return null;
	}
}
