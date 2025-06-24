// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { EAssets, ENetwork, ITreasuryStats } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { APIError } from './apiError';

interface CoinGeckoResponse {
	[network: string]: { usd: number; usd_24h_change: number };
}

const getAssetDecimals = (network: ENetwork, assetIndex: string, assetName: string): number => {
	const asset = NETWORKS_DETAILS[network as ENetwork].supportedAssets[String(assetIndex)];
	if (!asset?.tokenDecimal) {
		throw new Error(`${assetName} token decimal not found for network: ${network}, index: ${assetIndex}`);
	}
	return asset.tokenDecimal;
};

const calculateStablecoinValue = (network: ENetwork, usdcAmount: BN, usdtAmount: BN, config?: { usdcIndex?: string; usdtIndex?: string }): BN => {
	if (usdcAmount.isZero() && usdtAmount.isZero()) {
		return BN_ZERO;
	}

	// Validate configuration for non-zero amounts
	if (!usdcAmount.isZero() && !config?.usdcIndex) {
		throw new Error(`USDC index not found in treasury config for network: ${network}`);
	}
	if (!usdtAmount.isZero() && !config?.usdtIndex) {
		throw new Error(`USDT index not found in treasury config for network: ${network}`);
	}

	let totalStablecoinValue = BN_ZERO;

	// Calculate USDC value
	if (!usdcAmount.isZero() && config?.usdcIndex) {
		const usdcDecimals = getAssetDecimals(network, config.usdcIndex, 'USDC');
		const usdcValue = usdcAmount.div(new BN(10).pow(new BN(usdcDecimals)));
		totalStablecoinValue = totalStablecoinValue.add(usdcValue);
	}

	// Calculate USDT value
	if (!usdtAmount.isZero() && config?.usdtIndex) {
		const usdtDecimals = getAssetDecimals(network, config.usdtIndex, 'USDT');
		const usdtValue = usdtAmount.div(new BN(10).pow(new BN(usdtDecimals)));
		totalStablecoinValue = totalStablecoinValue.add(usdtValue);
	}

	return totalStablecoinValue;
};

const calculateNativeTokenValue = (network: ENetwork, nativeTokenAmount: BN, tokenPriceBN: { value: BN; decimals: number }): BN => {
	const nativeTokenDecimals = new BN(NETWORKS_DETAILS[network as ENetwork].tokenDecimals);

	return nativeTokenAmount
		.mul(tokenPriceBN.value)
		.div(new BN(10).pow(nativeTokenDecimals))
		.div(new BN(10).pow(new BN(tokenPriceBN.decimals)));
};

const calculateMythValue = (network: ENetwork, mythAmount: BN, mythPriceInUsd?: number): BN => {
	if (!mythPriceInUsd || mythAmount.isZero()) {
		return BN_ZERO;
	}

	const mythPriceBN = decimalToBN(mythPriceInUsd);
	const mythDecimals = new BN(NETWORKS_DETAILS[network as ENetwork].foreignAssets[EAssets.MYTH].tokenDecimal);

	return mythAmount
		.mul(mythPriceBN.value)
		.div(new BN(10).pow(mythDecimals))
		.div(new BN(10).pow(new BN(mythPriceBN.decimals)));
};

const calculateTotalInUsd = (network: ENetwork, treasuryStats: ITreasuryStats, mythPriceInUsd?: number, config?: { usdcIndex?: string; usdtIndex?: string }): string => {
	// Only calculate if we have native token price
	if (!treasuryStats.nativeTokenUsdPrice) {
		return '0';
	}

	const nativeTokenPriceBN = decimalToBN(treasuryStats.nativeTokenUsdPrice);

	// Convert token amounts to BN
	const nativeTokenAmount = treasuryStats.total?.totalNativeToken ? new BN(treasuryStats.total.totalNativeToken) : BN_ZERO;
	const usdcAmount = treasuryStats.total?.totalUsdc ? new BN(treasuryStats.total.totalUsdc) : BN_ZERO;
	const usdtAmount = treasuryStats.total?.totalUsdt ? new BN(treasuryStats.total.totalUsdt) : BN_ZERO;
	const mythAmount = treasuryStats.total?.totalMyth ? new BN(treasuryStats.total.totalMyth) : BN_ZERO;

	// Calculate values for each asset type
	const nativeTokenValue = calculateNativeTokenValue(network, nativeTokenAmount, nativeTokenPriceBN);
	const stablecoinValue = calculateStablecoinValue(network, usdcAmount, usdtAmount, config);
	const mythValue = calculateMythValue(network, mythAmount, mythPriceInUsd);

	// Sum all values
	const totalInUsd = nativeTokenValue.add(stablecoinValue).add(mythValue);

	return totalInUsd.toString();
};

export async function fetchLatestTreasuryStats(network: ENetwork): Promise<ITreasuryStats | null> {
	try {
		const { ApiPromise, WsProvider } = await import('@polkadot/api');
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
			relayChain: { nativeToken: '', nextBurn: '' },
			ambassador: { usdt: '' },
			assetHub: { nativeToken: '', usdc: '', usdt: '', myth: '' },
			hydration: { nativeToken: '', usdc: '', usdt: '' },
			bounties: { nativeToken: '' },
			fellowship: { nativeToken: '', usdt: '' },
			loans: config.loanAmounts,
			total: { totalNativeToken: '', totalUsdc: '', totalUsdt: '', totalMyth: '' }
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
			hydration: config.hydrationRpc ? new WsProvider(config.hydrationRpc) : undefined
		};

		const [relayChainApi, assetHubApi, hydrationApi] = await Promise.all([
			ApiPromise.create({ provider: apiProviders.relayChain }),
			ApiPromise.create({ provider: apiProviders.assetHub }),
			apiProviders.hydration ? ApiPromise.create({ provider: apiProviders.hydration }) : null
		]);

		// Fetch relay chain data
		const relayChainTasks = [
			// Treasury balance and next burn
			relayChainApi.query.system.account(config.treasuryAccount).then((accountInfo) => {
				const treasuryBalance = (accountInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString();
				const nextBurn = new BN(treasuryBalance).mul(config.burnPercentage.numerator).div(config.burnPercentage.denominator).toString();

				treasuryStats = {
					...treasuryStats,
					relayChain: {
						...treasuryStats.relayChain,
						nativeToken: treasuryBalance,
						nextBurn
					}
				};
			}),

			// next spend at - calculate when the current spend period ends
			relayChainApi.rpc.chain.getHeader().then((header) => {
				const currentBlock = new BN(header.number.toString());
				const spendPeriod = config.spendPeriodInBlocks;

				// Calculate remaining blocks until next spend
				const goneBlocks = currentBlock.mod(spendPeriod);
				const remainingBlocks = spendPeriod.sub(goneBlocks);

				// Calculate the block number when the next spend occurs
				const nextBurnBlock = currentBlock.add(remainingBlocks);
				const nextSpendAt = BlockCalculationsService.getDateFromBlockNumber({ currentBlockNumber: currentBlock, targetBlockNumber: nextBurnBlock, network });

				treasuryStats = {
					...treasuryStats,
					relayChain: {
						...treasuryStats.relayChain,
						nextSpendAt
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

					// Process active bounties with controlled concurrency
					// Use sequential processing with reduce to avoid race conditions and interleaved logs
					const totalBalance = await activeBounties.reduce<Promise<BN>>(async (accPromise, bounty) => {
						const acc = await accPromise;
						const bountyData = bounty as { index?: { toJSON: () => string } };
						const id = bountyData?.index?.toJSON();
						if (!id) return acc;

						try {
							const response = await fetch(`https://${network}-api.subsquare.io/treasury/bounties/${id}`);
							if (!response.ok) {
								console.error(`Failed to fetch bounty ${id}: ${response.status}`);
								return acc;
							}

							const result = await response.json();
							const address = result?.onchainData?.address;

							if (!address) {
								const metadataValue = result?.onchainData?.meta?.value || 0;
								return acc.add(new BN(metadataValue));
							}

							try {
								const accountData = await relayChainApi.query.system.account(address);
								const accountInfo = accountData as unknown as {
									data: { free: { toString: () => string }; reserved: { toString: () => string } };
								};
								const free = new BN(accountInfo.data.free.toString());
								const reserved = new BN(accountInfo.data.reserved.toString());
								const balance = free.add(reserved);
								return acc.add(balance);
							} catch (err) {
								console.error(`Error getting account data for bounty ${id}: ${err}`);
								return acc;
							}
						} catch (err) {
							console.error(`Error processing bounty ${id}: ${err}`);
							return acc;
						}
					}, Promise.resolve(BN_ZERO));

					treasuryStats = {
						...treasuryStats,
						bounties: {
							...treasuryStats.bounties,
							nativeToken: totalBalance.toString()
						}
					};
				} catch (error) {
					console.error(`Error processing bounties: ${error}`);
					treasuryStats = {
						...treasuryStats,
						bounties: {
							...treasuryStats.bounties,
							nativeToken: ''
						}
					};
				}
			})()
		];

		// Fetch asset hub data
		const getAssetHubTasks = () => {
			if (!assetHubApi) return [];
			const assetHubTasks = [];

			if (config.assetHubTreasuryAddress) {
				assetHubTasks.push(
					assetHubApi.query.system.account(config.assetHubTreasuryAddress).then((treasuryAddressInfo) => {
						treasuryStats = {
							...treasuryStats,
							assetHub: {
								...treasuryStats.assetHub,
								nativeToken: (treasuryAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString()
							}
						};
					})
				);

				// Only query USDT if usdtIndex is configured
				if (config.usdtIndex) {
					assetHubTasks.push(
						assetHubApi.query.assets.account(config.usdtIndex, config.assetHubTreasuryAddress).then((balance) => {
							treasuryStats = {
								...treasuryStats,
								assetHub: {
									...treasuryStats.assetHub,
									usdt: getBalanceIfExists(balance)
								}
							};
						})
					);
				}

				// Only query USDC if usdcIndex is configured
				if (config.usdcIndex) {
					assetHubTasks.push(
						assetHubApi.query.assets.account(config.usdcIndex, config.assetHubTreasuryAddress).then((balance) => {
							treasuryStats = {
								...treasuryStats,
								assetHub: {
									...treasuryStats.assetHub,
									usdc: getBalanceIfExists(balance)
								}
							};
						})
					);
				}
			}
			if (config.assetHubFellowshipAddress) {
				assetHubTasks.push(
					assetHubApi.query.system.account(config.assetHubFellowshipAddress).then((fellowshipAddressInfo) => {
						treasuryStats = {
							...treasuryStats,
							fellowship: {
								...treasuryStats.fellowship,
								nativeToken: (fellowshipAddressInfo as unknown as { data: { free: { toString: () => string } } }).data.free.toString()
							}
						};
					})
				);
			}
			if (config.assetHubFellowshipUsdtAddress && config.usdtIndex) {
				assetHubTasks.push(
					assetHubApi.query.assets.account(config.usdtIndex, config.assetHubFellowshipUsdtAddress).then((balance) => {
						treasuryStats = {
							...treasuryStats,
							fellowship: {
								...treasuryStats.fellowship,
								usdt: getBalanceIfExists(balance)
							}
						};
					})
				);
			}
			if (config.assetHubAmbassadorAddress && config.usdtIndex) {
				assetHubTasks.push(
					assetHubApi.query.assets.account(config.usdtIndex, config.assetHubAmbassadorAddress).then((balance) => {
						treasuryStats = {
							...treasuryStats,
							ambassador: {
								...treasuryStats.ambassador,
								usdt: getBalanceIfExists(balance)
							}
						};
					})
				);
			}
			if (config.assetHubMythAddress && config.mythosParachainId) {
				assetHubTasks.push(
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
								assetHub: {
									...treasuryStats.assetHub,
									myth: getBalanceIfExists(balance)
								}
							};
						})
				);
			}

			return assetHubTasks;
		};
		const assetHubTasks = getAssetHubTasks();

		// Fetch hydration data
		const fetchHydrationBalances = async () => {
			if (!hydrationApi) return;

			const ZERO_BN = new BN(0);
			let hydrationNativeTokenBalance = ZERO_BN;
			let hydrationUsdcBalance = ZERO_BN;
			let hydrationUsdtBalance = ZERO_BN;

			// Process all hydration addresses
			await Promise.all(
				(config.hydrationAddresses || []).map(async (address) => {
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
					const [nativeTokenBalance, usdcBalance, usdtBalance] = await Promise.all([
						config.hydrationNativeTokenAssetId ? getTokenBalance(config.hydrationNativeTokenAssetId) : null,
						config.hydrationUsdcAssetId ? getTokenBalance(config.hydrationUsdcAssetId) : null,
						config.hydrationUsdtAssetId ? getTokenBalance(config.hydrationUsdtAssetId) : null
					]);

					hydrationNativeTokenBalance = !nativeTokenBalance ? ZERO_BN : hydrationNativeTokenBalance.add(nativeTokenBalance.free).add(nativeTokenBalance.reserved);
					hydrationUsdcBalance = !usdcBalance ? ZERO_BN : hydrationUsdcBalance.add(usdcBalance.free).add(usdcBalance.reserved);
					hydrationUsdtBalance = !usdtBalance ? ZERO_BN : hydrationUsdtBalance.add(usdtBalance.free).add(usdtBalance.reserved);
				})
			);

			treasuryStats = {
				...treasuryStats,
				hydration: {
					nativeToken: hydrationNativeTokenBalance.isZero() ? '' : hydrationNativeTokenBalance.toString(),
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

		// Fetch MYTH price from CoinGecko
		const fetchMythPriceInUsd = async (): Promise<number | undefined> => {
			try {
				const mythPrice = (await (await fetch('https://api.coingecko.com/api/v3/simple/price?ids=mythos&vs_currencies=usd')).json()) as CoinGeckoResponse;
				return mythPrice?.mythos?.usd;
			} catch (error) {
				console.error('Error fetching MYTH price:', error);
				return undefined;
			}
		};

		// Execute all tasks
		const mythPriceInUsd = await fetchMythPriceInUsd();
		await Promise.all([Promise.all(relayChainTasks), Promise.all(assetHubTasks), fetchHydrationBalances(), fetchNativeTokenPriceInUsd()]);

		// Calculate totals after all data is fetched
		const calculateTotal = (propertyName: 'nativeToken' | 'usdc' | 'usdt' | 'myth'): string => {
			let total = new BN(0);

			Object.entries(treasuryStats).forEach(([sectionKey, section]) => {
				if (section && typeof section === 'object') {
					if (sectionKey === 'loans') {
						// Handle the nested loan structure
						const loans = section as Record<string, Record<string, string>>;
						Object.values(loans).forEach((loanProvider) => {
							if (loanProvider && typeof loanProvider === 'object' && propertyName in loanProvider) {
								const value = loanProvider[String(propertyName)];
								if (value && value !== '') {
									total = total.add(new BN(value));
								}
							}
						});
					} else if (propertyName in section) {
						// Handle regular sections
						const value = (section as Record<string, string>)[String(propertyName)];
						if (value && value !== '') {
							total = total.add(new BN(value));
						}
					}
				}
			});

			return total.toString();
		};

		treasuryStats = {
			...treasuryStats,
			total: {
				totalNativeToken: calculateTotal('nativeToken'),
				totalUsdc: calculateTotal('usdc'),
				totalUsdt: calculateTotal('usdt'),
				totalMyth: calculateTotal('myth')
			}
		};

		// Calculate total in USD using the unified function
		treasuryStats = {
			...treasuryStats,
			total: {
				...treasuryStats.total,
				totalInUsd: calculateTotalInUsd(network, treasuryStats, mythPriceInUsd, config)
			}
		};

		// Disconnect all APIs
		await Promise.all([relayChainApi.disconnect(), assetHubApi.disconnect(), hydrationApi?.disconnect()]);

		return treasuryStats;
	} catch (error) {
		console.error(`Error fetching treasury stats: ${error}`);
		return null;
	}
}
