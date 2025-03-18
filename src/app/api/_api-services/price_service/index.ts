// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { RedisService } from '../redis_service';
import { APIError } from '../../_api-utils/apiError';

interface IPriceResponse {
	price: number;
	source: string;
	timestamp: number;
}

export class PriceService {
	private static CACHE_EXPIRY = 5 * 60; // 5 minutes in seconds

	private static COIN_GECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

	private static BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';

	private static KRAKEN_API = 'https://api.kraken.com/0/public/Ticker';

	private static HUOBI_API = 'https://api.huobi.pro/market/detail/merged';

	private static KUCOIN_API = 'https://api.kucoin.com/api/v1/market/orderbook/level1';

	private static async getFromCache(symbol: string): Promise<IPriceResponse | null> {
		const cachedPrice = await RedisService.GetTokenPrice(symbol.toLowerCase());
		return cachedPrice ? JSON.parse(cachedPrice) : null;
	}

	private static async saveToCache(symbol: string, priceData: IPriceResponse): Promise<void> {
		await RedisService.SetTokenPrice({
			symbol: symbol.toLowerCase(),
			data: JSON.stringify(priceData),
			ttlSeconds: this.CACHE_EXPIRY
		});
	}

	private static async getCoinGeckoPrice(symbol: string): Promise<IPriceResponse | null> {
		try {
			const response = await fetchPF(`${this.COIN_GECKO_API}?ids=${symbol}&vs_currencies=usd`);
			const data = await response.json();
			if (data?.data?.[symbol.toLowerCase()]?.usd) {
				return {
					price: parseFloat(data.data[symbol.toLowerCase()].usd),
					source: 'coingecko',
					timestamp: Date.now()
				};
			}
		} catch (error) {
			console.error('CoinGecko API error:', error);
		}
		return null;
	}

	private static async getBinancePrice(symbol: string): Promise<IPriceResponse | null> {
		try {
			const response = await fetchPF(`${this.BINANCE_API}?symbol=${symbol}USDT`);
			const data = await response.json();
			if (data?.price) {
				return {
					price: parseFloat(data.price),
					source: 'binance',
					timestamp: Date.now()
				};
			}
		} catch (error) {
			console.error('Binance API error:', error);
		}
		return null;
	}

	private static async getKrakenPrice(symbol: string): Promise<IPriceResponse | null> {
		try {
			const response = await fetchPF(`${this.KRAKEN_API}?pair=${symbol}USD`);
			const data = await response.json();
			const pair = Object.keys(data.result)[0];
			if (data?.result?.[pair as string]?.c?.[0]) {
				return {
					price: parseFloat(data.result[pair as string].c[0]),
					source: 'kraken',
					timestamp: Date.now()
				};
			}
		} catch (error) {
			console.error('Kraken API error:', error);
		}
		return null;
	}

	private static async getHuobiPrice(symbol: string): Promise<IPriceResponse | null> {
		try {
			const response = await fetchPF(`${this.HUOBI_API}?symbol=${symbol.toLowerCase()}usdt`);
			const data = await response.json();
			if (data?.tick?.close) {
				return {
					price: parseFloat(data.tick.close),
					source: 'huobi',
					timestamp: Date.now()
				};
			}
		} catch (error) {
			console.error('Huobi API error:', error);
		}
		return null;
	}

	private static async getKucoinPrice(symbol: string): Promise<IPriceResponse | null> {
		try {
			const response = await fetchPF(`${this.KUCOIN_API}?symbol=${symbol}-USDT`);
			const data = await response.json();
			if (data?.data?.price) {
				return {
					price: parseFloat(data.data.price),
					source: 'kucoin',
					timestamp: Date.now()
				};
			}
		} catch (error) {
			console.error('Kucoin API error:', error);
		}
		return null;
	}

	static async GetTokenPrice(symbol: string): Promise<IPriceResponse> {
		// Check cache first
		const cachedPrice = await this.getFromCache(symbol);
		if (cachedPrice) {
			return cachedPrice;
		}

		// Try all exchanges in sequence until we get a price
		const price =
			(await this.getBinancePrice(symbol)) ||
			(await this.getKrakenPrice(symbol)) ||
			(await this.getHuobiPrice(symbol)) ||
			(await this.getKucoinPrice(symbol)) ||
			(await this.getCoinGeckoPrice(symbol));

		if (!price) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, `Unable to fetch price for ${symbol}`);
		}

		await this.saveToCache(symbol, price);

		return price;
	}
}
