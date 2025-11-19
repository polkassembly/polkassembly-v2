// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { APIError } from './apiError';

interface TxParam {
	name: string;
	value: string | Record<string, unknown> | unknown;
}

interface TxData {
	params?: TxParam[];
	block_timestamp: number;
	[key: string]: unknown;
}

/**
 * Recursively searches for a remark parameter in transaction data
 * @param data - The transaction data to search in
 * @param targetRemark - The remark value to search for (e.g., 'PolkassemblyUser:address')
 * @returns boolean indicating if the target remark was found
 */
function findRemarkRecursively(data: TxData, targetRemark: string): boolean {
	if (!data || !data.params || !Array.isArray(data.params)) {
		return false;
	}

	const params = data.params as TxParam[];

	// First, check if there's a direct remark parameter
	const remarkParam = params.find((param) => param.name === 'remark');
	if (remarkParam && (remarkParam.value as string).split('-')[1].trim() === targetRemark) {
		return true;
	}

	// If no direct remark found, look for 'call' parameters and recurse
	const callParams = params.filter((param) => param.name === 'call');

	if (!callParams || callParams.length === 0) {
		return false;
	}

	return callParams.some((callParam) => {
		try {
			// The call value might be a string (JSON) or already an object
			let callData: TxData;

			if (typeof callParam.value === 'string') {
				// Try to parse as JSON if it's a string
				try {
					callData = JSON.parse(callParam.value) as TxData;
				} catch {
					// If parsing fails, skip this call
					return false;
				}
			} else if (typeof callParam.value === 'object' && callParam.value !== null) {
				callData = callParam.value as TxData;
			} else {
				// If it's neither string nor object, skip
				return false;
			}

			// Recursively search in the nested call data
			return findRemarkRecursively(callData, targetRemark);
		} catch (error) {
			// If there's any error processing this call, return false for this iteration
			console.warn('Error processing call parameter:', error);
			return false;
		}
	});
}

/**
 * Validates if a transaction contains the expected remark for Polkassembly user authentication
 * @param extrinsicData - The extrinsic data from the blockchain
 * @param formattedAddress - The formatted user address
 * @returns boolean indicating if the remark exists and matches the expected format
 */
export function validateRemarkLogin({ extrinsicData, remarkLoginMessage }: { extrinsicData: unknown; remarkLoginMessage: string }): boolean {
	if (!extrinsicData || !remarkLoginMessage) {
		return false;
	}

	const blockTimestamp = (extrinsicData as TxData).block_timestamp;

	if (dayjs().subtract(5, 'minutes').isAfter(dayjs.unix(blockTimestamp))) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'The remark is expired. Please try again.');
	}

	try {
		return findRemarkRecursively(extrinsicData as TxData, remarkLoginMessage);
	} catch (error) {
		console.error('Error validating remark login:', error);
		return false;
	}
}
