// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork, IRelativeTime } from '@/_shared/types';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { dayjs } from './dayjsInit';

/**
 * Gets a formatted date string from a block number
 * @param targetBlockNumber - The target block number (BN)
 * @param network - The network to use for block time calculations
 * @param apiService - Optional API service instance (if not provided, will initialize one)
 * @returns Formatted date string like "03 Apr '25"
 *
 * @example
 * ```typescript
 * const formattedDate = await getFormattedDateFromBlock({
 *   targetBlockNumber: new BN('21500000'),
 *   network: ENetwork.POLKADOT
 * });
 * // formattedDate = "03 Apr '25"
 * ```
 */
export async function getFormattedDateFromBlock({
	targetBlockNumber,
	network,
	apiService
}: {
	targetBlockNumber: BN;
	network: ENetwork;
	apiService?: PolkadotApiService;
}): Promise<string> {
	// Get or initialize API service
	let api = apiService;
	if (!api) {
		api = await PolkadotApiService.Init(network);
	}

	// Get current block number from the API
	const currentBlockNumber = await api.getCurrentBlockHeight();
	if (!currentBlockNumber) {
		throw new Error('Failed to get current block height');
	}

	// Get the actual date for the target block
	const actualDate = BlockCalculationsService.getDateFromBlockNumber({
		currentBlockNumber,
		targetBlockNumber,
		network
	});

	// Format the date as "03 Apr '25"
	return dayjs(actualDate).format("DD MMM 'YY");
}

/**
 * Gets relative time breakdown from a block number
 * @param targetBlockNumber - The target block number (BN)
 * @param network - The network to use for block time calculations
 * @param apiService - Optional API service instance (if not provided, will initialize one)
 * @returns Relative time object with days, hours, and minutes
 *
 * @example
 * ```typescript
 * const relativeTime = await getRelativeTimeFromBlock({
 *   targetBlockNumber: new BN('21500000'),
 *   network: ENetwork.POLKADOT
 * });
 * // relativeTime = {days: 80, hours: 12, minutes: 45}
 * ```
 */
export async function getRelativeTimeFromBlock({
	targetBlockNumber,
	network,
	apiService
}: {
	targetBlockNumber: BN;
	network: ENetwork;
	apiService?: PolkadotApiService;
}): Promise<IRelativeTime> {
	// Get or initialize API service
	let api = apiService;
	if (!api) {
		api = await PolkadotApiService.Init(network);
	}

	// Get current block number from the API
	const currentBlockNumber = await api.getCurrentBlockHeight();
	if (!currentBlockNumber) {
		throw new Error('Failed to get current block height');
	}

	// Get the actual date for the target block
	const actualDate = BlockCalculationsService.getDateFromBlockNumber({
		currentBlockNumber,
		targetBlockNumber,
		network
	});

	// Calculate relative time from now
	const now = dayjs();
	const targetDateTime = dayjs(actualDate);

	// Get the difference in milliseconds
	const diffMs = targetDateTime.diff(now);
	const absDiffMs = Math.abs(diffMs);

	// Convert to time units
	const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
	const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

	return {
		days,
		hours,
		minutes
	};
}

/**
 * Formats relative time into a human-readable string
 * @param relativeTime - The relative time object
 * @param isPast - Whether the time is in the past
 * @returns Formatted string like "80 days, 12 hours, 45 minutes" or "in 80 days, 12 hours"
 *
 * @example
 * ```typescript
 * const relativeTime = {days: 80, hours: 12, minutes: 45};
 * const futureString = formatRelativeTime(relativeTime, false); // "in 80 days, 12 hours"
 * const pastString = formatRelativeTime(relativeTime, true); // "80 days, 12 hours ago"
 * ```
 */
export function formatRelativeTime(relativeTime: IRelativeTime, isPast: boolean = false): string {
	const { days, hours, minutes } = relativeTime;
	const parts: string[] = [];

	if (days > 0) {
		parts.push(`${days} day${days !== 1 ? 's' : ''}`);
	}
	if (hours > 0) {
		parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
	}
	if (minutes > 0 && parts.length < 2) {
		// Only show minutes if we don't already have 2 parts
		parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
	}

	if (parts.length === 0) {
		return isPast ? 'just now' : 'any moment';
	}

	const timeString = parts.join(', ');
	return isPast ? `${timeString} ago` : `in ${timeString}`;
}
