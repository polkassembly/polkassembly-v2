// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin, IReciprocal, ILinearDecreasing } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';

import { BN, BN_BILLION } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

const PERBILL_DIVISOR = 1_000_000_000;
const PERCENTAGE_MULTIPLIER = 100;

interface IGraphPoint {
	timestamp: string;
	approvalPercent: number;
	supportPercent: number;
}

interface IReciprocalParams {
	reciprocal: IReciprocal;
	percentage: number;
}

interface ILinearParams {
	linearDecreasing: ILinearDecreasing;
	percentage: number;
}

interface ITrackThresholdsParams {
	trackName: EPostOrigin | undefined;
	network: ENetwork;
	percentage: number;
}

interface IThresholdValueParams {
	trackName: EPostOrigin | undefined;
	network: ENetwork;
	currentPoint: { x: number } | undefined;
	decisionPeriodHrs: number;
}

interface IProcessGraphPointParams {
	graphPoint: IGraphPoint;
	proposalCreatedAt: dayjs.Dayjs;
	elapsedHours: number;
	decisionPeriodHrs: number;
	network: ENetwork;
	trackName?: EPostOrigin;
}

function calculateReciprocal({ reciprocal, percentage }: IReciprocalParams): number {
	try {
		const x = new BN(Math.floor(percentage * PERBILL_DIVISOR));
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

function calculateLinear({ linearDecreasing, percentage }: ILinearParams): number {
	try {
		const x = new BN(Math.floor(percentage * PERBILL_DIVISOR));
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

function calculateTrackThresholds({ trackName, network, percentage }: ITrackThresholdsParams): { approval: number; support: number } {
	const trackInfo = trackName ? NETWORKS_DETAILS[network]?.trackDetails?.[trackName] : undefined;
	let support = 0;
	let approval = 0;

	if (trackInfo) {
		if (trackInfo.minApproval) {
			if (trackInfo.minApproval.reciprocal) {
				approval = calculateReciprocal({
					reciprocal: trackInfo.minApproval.reciprocal,
					percentage
				});
			} else if (trackInfo.minApproval.linearDecreasing) {
				approval = calculateLinear({
					linearDecreasing: trackInfo.minApproval.linearDecreasing,
					percentage
				});
			}
		}
		if (trackInfo.minSupport) {
			if (trackInfo.minSupport.reciprocal) {
				support = calculateReciprocal({
					reciprocal: trackInfo.minSupport.reciprocal,
					percentage
				});
			} else if (trackInfo.minSupport.linearDecreasing) {
				support = calculateLinear({
					linearDecreasing: trackInfo.minSupport.linearDecreasing,
					percentage
				});
			}
		}
	}

	return { approval, support };
}

export const calculateThresholdValue = ({ trackName, network, currentPoint, decisionPeriodHrs }: IThresholdValueParams): number => {
	if (!currentPoint || !trackName) return 0;
	try {
		const percentage = Math.min(1, Math.max(0, (currentPoint.x || 0) / decisionPeriodHrs));
		const thresholds = calculateTrackThresholds({ trackName, network, percentage });
		return Number((thresholds.approval * PERCENTAGE_MULTIPLIER).toFixed(2));
	} catch (error) {
		console.error('Failed to calculate threshold:', error);
		return 0;
	}
};

export const processGraphPoint = ({ graphPoint, proposalCreatedAt, elapsedHours, decisionPeriodHrs, network, trackName }: IProcessGraphPointParams) => {
	const hour = dayjs(graphPoint.timestamp).diff(proposalCreatedAt, 'hour');
	const newGraphPoint = { ...graphPoint, hour };
	const percentage = hour / elapsedHours;

	const result = {
		approval: { x: hour, y: newGraphPoint.approvalPercent },
		support: { x: hour, y: newGraphPoint.supportPercent }
	};

	if (elapsedHours > decisionPeriodHrs && trackName) {
		const thresholds = calculateTrackThresholds({ trackName, network, percentage });
		result.approval.y = thresholds.approval * PERCENTAGE_MULTIPLIER;
		result.support.y = thresholds.support * PERCENTAGE_MULTIPLIER;
	}

	return result;
};
