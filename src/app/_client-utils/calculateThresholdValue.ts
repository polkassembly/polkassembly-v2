// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin, IReciprocal, ILinearDecreasing } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';

import { BN, BN_BILLION } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

interface IGraphPoint {
	timestamp: string;
	approvalPercent: number;
	supportPercent: number;
}

function calculateReciprocal(reciprocal: IReciprocal, percentage: number): number {
	try {
		const x = new BN(Math.floor(percentage * 1_000_000_000));
		const factorBN = new BN(reciprocal.factor.toString());
		const xOffsetBN = new BN(reciprocal.xOffset.toString());
		const yOffsetBN = new BN(reciprocal.yOffset.toString());

		const numerator = factorBN.mul(BN_BILLION);
		const denominator = x.add(xOffsetBN);

		if (denominator.isZero()) {
			return 0;
		}

		const v = numerator.div(denominator);
		const result = v.add(yOffsetBN);
		const finalResult = parseFloat(result.toString()) / parseFloat(BN_BILLION.toString());

		return Math.max(0, finalResult);
	} catch (error) {
		console.error('Error in reciprocal curve calculation:', error);
		return 0;
	}
}

function calculateLinear(linearDecreasing: ILinearDecreasing, percentage: number): number {
	try {
		const x = new BN(Math.floor(percentage * 1_000_000_000));
		const lengthBN = new BN(linearDecreasing.length.toString());
		const floorBN = new BN(linearDecreasing.floor.toString());
		const ceilBN = new BN(linearDecreasing.ceil.toString());

		const xValue = BN.min(x, lengthBN);

		if (lengthBN.isZero()) {
			return 0;
		}

		const slopeBN = ceilBN.sub(floorBN).mul(BN_BILLION).div(lengthBN);
		const deducted = slopeBN.mul(xValue).div(BN_BILLION);
		const perbill = ceilBN.sub(deducted);
		const finalResult = parseFloat(perbill.toString()) / parseFloat(BN_BILLION.toString());

		return Math.max(0, finalResult);
	} catch (error) {
		console.error('Error in linear curve calculation:', error);
		return 0;
	}
}

function calculateTrackThresholds(trackName: EPostOrigin | undefined, network: ENetwork, percentage: number): { approval: number; support: number } {
	const trackInfo = trackName ? NETWORKS_DETAILS[network]?.trackDetails?.[trackName] : undefined;
	let support = 0;
	let approval = 0;

	if (trackInfo) {
		if (trackInfo.minApproval) {
			if (trackInfo.minApproval.reciprocal) {
				approval = calculateReciprocal(trackInfo.minApproval.reciprocal, percentage);
			} else if (trackInfo.minApproval.linearDecreasing) {
				approval = calculateLinear(trackInfo.minApproval.linearDecreasing, percentage);
			}
		}
		if (trackInfo.minSupport) {
			if (trackInfo.minSupport.reciprocal) {
				support = calculateReciprocal(trackInfo.minSupport.reciprocal, percentage);
			} else if (trackInfo.minSupport.linearDecreasing) {
				support = calculateLinear(trackInfo.minSupport.linearDecreasing, percentage);
			}
		}
	}

	return { approval, support };
}

export const calculateThresholdValue = (trackName: EPostOrigin | undefined, network: ENetwork, currentPoint: { x: number } | undefined, decisionPeriodHrs: number): number => {
	if (!currentPoint || !trackName) return 0;
	try {
		const percentage = Math.min(1, Math.max(0, (currentPoint.x || 0) / decisionPeriodHrs));
		const thresholds = calculateTrackThresholds(trackName, network, percentage);
		return Number((thresholds.approval * 100).toFixed(2));
	} catch (error) {
		console.error('Failed to calculate threshold:', error);
		return 0;
	}
};

export const processGraphPoint = (
	graphPoint: IGraphPoint,
	proposalCreatedAt: dayjs.Dayjs,
	decisionPeriodMinutes: number,
	decisionPeriodHrs: number,
	network: ENetwork,
	trackName?: EPostOrigin
) => {
	const hour = dayjs(graphPoint.timestamp).diff(proposalCreatedAt, 'hour');
	const newGraphPoint = { ...graphPoint, hour };
	const percentage = hour / decisionPeriodMinutes;

	const result = {
		approval: { x: hour, y: newGraphPoint.approvalPercent },
		support: { x: hour, y: newGraphPoint.supportPercent }
	};

	if (decisionPeriodMinutes > decisionPeriodHrs && trackName) {
		const thresholds = calculateTrackThresholds(trackName, network, percentage);
		result.approval.y = thresholds.approval * 100;
		result.support.y = thresholds.support * 100;
	}

	return result;
};
