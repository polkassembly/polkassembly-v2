// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ENetwork, ITreasuryStats } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from './apiError';

interface CoinGeckoResponse {
	[network: string]: { usd: number; usd_24h_change: number };
}

export async function fetchLatestTreasuryStats(network: ENetwork): Promise<ITreasuryStats | null> {
	try {
		const { ApiPromise, WsProvider } = await import('@polkadot/api');
		const { BN } = await import('@polkadot/util');
		const { TREASURY_NETWORK_CONFIG } = await import('@/_shared/_constants/treasury');

		const config = TREASURY_NETWORK_CONFIG[network as ENetwork];
		if (!config) {
			throw new APIError(ERROR_CODES.NETWORK_NOT_SUPPORTED, StatusCodes.BAD_REQUEST);
		}

		// Initialize treasury stats structure
		let treasuryStats: ITreasuryStats = {
			network,
			createdAt: new Date(),
			updatedAt: new Date(),
			relayChain: { dot: '', myth: '' },
			ambassador: { usdt: '' },
			assetHub: { dot: '', usdc: '', usdt: '' },
			hydration: { dot: '', usdc: '', usdt: '' },
			bounties: { dot: '' },
			fellowship: { dot: '', usdt: '' },
			total: { totalDot: '', totalUsdc: '', totalUsdt: '', totalMyth: '' },
			loans: {
				dot: config.loanAmounts.dot,
				usdc: config.loanAmounts.usdc
			}
		};

		// Helper function to safely extract balance from results
		const getBalanceIfExists = (result: unknown): string => {
			if (!result || typeof result !== 'object') return '';

			const resultObj = result as unknown;
			if (
				resultObj &&
				typeof resultObj === 'object' &&
				'isSome' in resultObj &&
				(resultObj as { isSome: boolean }).isSome === true &&
				'unwrap' in resultObj &&
				typeof (resultObj as { unwrap: () => unknown }).unwrap === 'function'
			) {
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

		// Initialize all API connections
		const apiProviders = {
			relayChain: new WsProvider(config.relayChainRpc),
			assetHub: new WsProvider(config.assetHubRpc),
			hydration: new WsProvider(config.hydrationRpc)
		};

		const [relayChainApi, assetHubApi, hydrationApi] = await Promise.all([
			ApiPromise.create({ provider: apiProviders.relayChain }),
			ApiPromise.create({ provider: apiProviders.assetHub }),
			ApiPromise.create({ provider: apiProviders.hydration })
		]);

		// Fetch relay chain data
		const relayChainTasks = [
			// Treasury balance
			relayChainApi.query.system.account(config.treasuryAccount).then((accountInfo) => {
				treasuryStats = {
					...treasuryStats,
					relayChain: {
						...treasuryStats.relayChain,
						dot: (accountInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString()
					}
				};
			}),

			// Bounties data
			(async () => {
				try {
					const deriveBounties = await relayChainApi.derive.bounties?.bounties();
					const activeBounties = (deriveBounties as unknown as unknown[]).filter((item) => {
						const { isFunded, isCuratorProposed, isActive } =
							(item as { bounty?: { status: { isFunded?: boolean; isCuratorProposed?: boolean; isActive?: boolean } } })?.bounty?.status || {};
						return isFunded || isCuratorProposed || isActive;
					});

					// Process active bounties
					const balances = await Promise.all(
						activeBounties.map(async (bounty) => {
							const bountyData = bounty as { index?: { toJSON: () => string } };
							const id = bountyData?.index?.toJSON();
							if (!id) return new BN(0);

							try {
								const response = await fetch(`https://polkadot.subsquare.io/api/treasury/bounties/${id}`);
								if (!response.ok) return new BN(0);

								const result = await response.json();
								const address = result?.onchainData?.address;

								if (!address) {
									const metadataValue = result?.onchainData?.meta?.value || 0;
									return new BN(metadataValue);
								}

								try {
									const accountData = await relayChainApi.query.system.account(address);
									const accountInfo = accountData as unknown as {
										data: { free: { toString: () => string }; reserved: { toString: () => string } };
									};
									return new BN(accountInfo.data.free.toString()).add(new BN(accountInfo.data.reserved.toString()));
								} catch {
									return new BN(0);
								}
							} catch {
								return new BN(0);
							}
						})
					);

					treasuryStats = {
						...treasuryStats,
						bounties: {
							...treasuryStats.bounties,
							dot: balances.reduce((acc, curr) => acc.add(curr), new BN(0)).toString()
						}
					};
				} catch (error) {
					console.error(`Error processing bounties: ${error}`);
					treasuryStats = {
						...treasuryStats,
						bounties: {
							...treasuryStats.bounties,
							dot: ''
						}
					};
				}
			})()
		];

		// Fetch asset hub data
		const assetHubTasks = [
			// Relay chain assethub DOT balance
			assetHubApi.query.system.account(config.assetHubTreasuryAddress).then((treasuryAddressInfo) => {
				treasuryStats = {
					...treasuryStats,
					assetHub: {
						...treasuryStats.assetHub,
						dot: (treasuryAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString()
					}
				};
			}),

			// Fellowship assethub DOT balance
			assetHubApi.query.system.account(config.assetHubFellowshipAddress).then((fellowshipAddressInfo) => {
				treasuryStats = {
					...treasuryStats,
					fellowship: {
						...treasuryStats.fellowship,
						dot: (fellowshipAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString()
					}
				};
			}),

			// Asset Hub USDT balance
			assetHubApi.query.assets.account(config.usdtIndex, config.assetHubTreasuryAddress).then((balance) => {
				treasuryStats = {
					...treasuryStats,
					assetHub: {
						...treasuryStats.assetHub,
						usdt: getBalanceIfExists(balance)
					}
				};
			}),

			// Fellowship USDT balance
			assetHubApi.query.assets.account(config.usdtIndex, config.assetHubFellowshipUsdtAddress).then((balance) => {
				treasuryStats = {
					...treasuryStats,
					fellowship: {
						...treasuryStats.fellowship,
						usdt: getBalanceIfExists(balance)
					}
				};
			}),

			// Ambassador USDT balance
			assetHubApi.query.assets.account(config.usdtIndex, config.assetHubAmbassadorAddress).then((balance) => {
				treasuryStats = {
					...treasuryStats,
					ambassador: {
						...treasuryStats.ambassador,
						usdt: getBalanceIfExists(balance)
					}
				};
			}),

			// Asset Hub USDC balance
			assetHubApi.query.assets.account(config.usdcIndex, config.assetHubTreasuryAddress).then((balance) => {
				treasuryStats = {
					...treasuryStats,
					assetHub: {
						...treasuryStats.assetHub,
						usdc: getBalanceIfExists(balance)
					}
				};
			}),

			// Mythos assets
			assetHubApi.query.foreignAssets
				.account(
					{
						parents: 1,
						interior: {
							X1: [{ Parachain: config.mythosParachainId }]
						}
					},
					config.assetHubMythAddress
				)
				.then((balance) => {
					treasuryStats = {
						...treasuryStats,
						relayChain: {
							...treasuryStats.relayChain,
							myth: getBalanceIfExists(balance)
						}
					};
				})
		];

		// Fetch hydration data
		const fetchHydrationBalances = async () => {
			const ZERO_BN = new BN(0);
			let hydrationDotBalance = ZERO_BN;
			let hydrationUsdcBalance = ZERO_BN;
			let hydrationUsdtBalance = ZERO_BN;

			// Process all hydration addresses
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
						} catch {
							// Silent error handling
						}
						return { free: ZERO_BN, reserved: ZERO_BN };
					};

					// Get all token balances for each address
					const [dotBalance, usdcBalance, usdtBalance] = await Promise.all([
						getTokenBalance(config.hydrationDotAssetId),
						getTokenBalance(config.hydrationUsdcAssetId),
						getTokenBalance(config.hydrationUsdtAssetId)
					]);

					hydrationDotBalance = hydrationDotBalance.add(dotBalance.free).add(dotBalance.reserved);
					hydrationUsdcBalance = hydrationUsdcBalance.add(usdcBalance.free).add(usdcBalance.reserved);
					hydrationUsdtBalance = hydrationUsdtBalance.add(usdtBalance.free).add(usdtBalance.reserved);
				})
			);

			treasuryStats = {
				...treasuryStats,
				hydration: {
					dot: hydrationDotBalance.isZero() ? '' : hydrationDotBalance.toString(),
					usdc: hydrationUsdcBalance.isZero() ? '' : hydrationUsdcBalance.toString(),
					usdt: hydrationUsdtBalance.isZero() ? '' : hydrationUsdtBalance.toString()
				}
			};
		};

		// Fetch current price of native token in USD
		const fetchNativeTokenPriceInUsd = async () => {
			const response = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${network}&vs_currencies=usd&include_24hr_change=true`)).json();
			// check if data is of type CoinGeckoResponse
			if (!response || typeof response !== 'object' || !(network in response) || !('usd' in response[String(network)]) || typeof response[String(network)]?.usd !== 'number') {
				return;
			}

			const data = response as CoinGeckoResponse;
			treasuryStats = {
				...treasuryStats,
				nativeTokenUsdPrice: data[String(network)].usd.toString(),
				...(data[String(network)].usd_24h_change && { nativeTokenUsdPrice24hChange: data[String(network)].usd_24h_change.toString() })
			};
		};

		// Execute all tasks
		await Promise.all([...relayChainTasks, ...assetHubTasks, fetchHydrationBalances(), fetchNativeTokenPriceInUsd()]);

		// Calculate totals after all data is fetched
		const calculateTotal = (propertyName: 'dot' | 'usdc' | 'usdt' | 'myth'): string => {
			let total = new BN(0);

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

		treasuryStats = {
			...treasuryStats,
			total: {
				totalDot: calculateTotal('dot'),
				totalUsdc: calculateTotal('usdc'),
				totalUsdt: calculateTotal('usdt'),
				totalMyth: calculateTotal('myth')
			}
		};

		// Disconnect all APIs
		await Promise.all([relayChainApi.disconnect(), assetHubApi.disconnect(), hydrationApi.disconnect()]);

		return treasuryStats;
	} catch (error) {
		console.error(`Error fetching treasury stats: ${error}`);
		return null;
	}
}
