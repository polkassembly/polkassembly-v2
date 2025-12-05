// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetwork, ENetworkSocial, IBeneficiary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { BN } from '@polkadot/util';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { useAssethubApiService } from '@/hooks/useAssethubApiService';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import { Skeleton } from '../../Skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip';
import classes from './BeneficiariesDetails.module.scss';
import { Button } from '../../Button';

interface BeneficiaryPayoutsListProps {
	beneficiaries: IBeneficiary[];
	usedInOnchainInfo?: boolean;
}

interface IBeneficiaryPayoutDetails extends IBeneficiary {
	payoutExpiryMsg?: string;
}

interface PayoutExpiryProps {
	validFromBlock: number | null;
	payoutExpiryMsg?: string;
}
interface TimeUnitOptions {
	withUnitSpace?: boolean;
	withPluralSuffix?: boolean;
}
const MAX_VISIBLE_BENEFICIARIES = 4;

// Utility functions
export const formatDate = (timestamp: Date | string): string => {
	return dayjs(timestamp).format('YYYY-MM-DD');
};

export const buildTimeUnit = (value: number, unit: string, options: TimeUnitOptions = {}): string | null => {
	const { withUnitSpace = true, withPluralSuffix = true } = options;
	const pluralSuffix = withPluralSuffix && value !== 1 ? 's' : '';
	return value ? `${value}${withUnitSpace ? ' ' : ''}${unit}${pluralSuffix}` : null;
};

export const getTimeRemaining = (endDate: Date | string, withUnitSpace = true): string | null => {
	const now = dayjs();
	const end = dayjs(endDate);
	const diff = end.diff(now);

	if (diff <= 0) return null;

	const duration = dayjs.duration(diff);
	const timeUnits = [
		buildTimeUnit(Math.floor(duration.years()), 'yr', { withUnitSpace }),
		buildTimeUnit(Math.floor(duration.months()), 'mo', { withUnitSpace }),
		buildTimeUnit(Math.floor(duration.days()), 'd', { withUnitSpace, withPluralSuffix: false }),
		buildTimeUnit(duration.hours(), 'hr', { withUnitSpace }),
		buildTimeUnit(duration.minutes(), 'min', { withUnitSpace })
	];

	return timeUnits.filter(Boolean).slice(0, 2).join(' ');
};

export const calculatePayoutExpiry = (currentBlockHeight: number, validFromBlockHeight: number | null, network: ENetwork): string | null => {
	if (!currentBlockHeight || !validFromBlockHeight || !network) {
		return null;
	}

	const date = BlockCalculationsService.getDateFromBlockNumber({
		currentBlockNumber: new BN(currentBlockHeight),
		targetBlockNumber: new BN(validFromBlockHeight),
		network
	});

	if (dayjs().isAfter(date)) {
		return formatDate(date);
	}

	return getTimeRemaining(date, false);
};

function PayoutExpiryDisplay({ validFromBlock, payoutExpiryMsg }: PayoutExpiryProps) {
	const network = getCurrentNetwork();
	const subscanUrl = NETWORKS_DETAILS[`${network}`].socialLinks?.find((link) => link.id === ENetworkSocial.SUBSCAN)?.href;

	if (!payoutExpiryMsg) {
		return <Skeleton className='h-full w-[100px]' />;
	}

	const isPaid = payoutExpiryMsg && !payoutExpiryMsg.includes('in');
	const hasValidBlock = validFromBlock && subscanUrl;

	if (isPaid && hasValidBlock) {
		return (
			<Tooltip>
				<TooltipTrigger>
					<Link
						href={`${subscanUrl}/block/${validFromBlock}`}
						target='_blank'
						className={cn(classes.beneficiariesExpireIn, 'flex items-center gap-1')}
					>
						{payoutExpiryMsg}
						<SquareArrowOutUpRight className='ml-0.5 h-3.5 w-3.5 text-text_pink' />
					</Link>
				</TooltipTrigger>
				<TooltipContent>
					<div className='text-xs'>Block: #{validFromBlock}</div>
				</TooltipContent>
			</Tooltip>
		);
	}

	if (hasValidBlock) {
		return (
			<Tooltip>
				<TooltipTrigger>
					<div className={classes.beneficiariesExpireIn}>{payoutExpiryMsg}</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className='text-xs'>Block: #{validFromBlock}</div>
				</TooltipContent>
			</Tooltip>
		);
	}

	return <div className={classes.beneficiariesExpireIn}>{payoutExpiryMsg}</div>;
}

interface BeneficiaryPaymentItemProps {
	beneficiary: IBeneficiaryPayoutDetails;
	usedInOnchainInfo?: boolean;
	isLastItem: boolean;
}

function BeneficiaryPaymentItem({ beneficiary, usedInOnchainInfo, isLastItem }: BeneficiaryPaymentItemProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();

	const assetUnit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${beneficiary.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol;

	const assetIcon = treasuryAssetsData[assetUnit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;

	return (
		<div className='flex flex-col gap-3'>
			<div className={classes.beneficiariesDialogListItem}>
				<div className='flex items-center'>
					<div className='flex items-center gap-2'>
						<Image
							src={assetIcon}
							alt={assetUnit || ''}
							width={20}
							height={20}
							className='rounded-full'
						/>
						<div className={cn(classes.beneficiariesDialogListItemAmount, usedInOnchainInfo ? 'text-sm font-medium' : '')}>
							{formatUSDWithUnits(
								formatBnBalance(
									beneficiary.amount.toString(),
									{ withUnit: true, numberAfterComma: 2 },
									network,
									beneficiary.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : beneficiary.assetId
								)
							)}
						</div>
						{beneficiary.usdAmount && ![EAssets.USDC, EAssets.USDT].includes(assetUnit as EAssets) && (
							<div className={cn(classes.beneficiariesDialogListItemAmountUSD)}>${formatUSDWithUnits(beneficiary.usdAmount, 1)}</div>
						)}
						<span className={classes.beneficiariesDialogListItemTo}>{t('to')}</span>
						<Address
							address={beneficiary.address}
							truncateCharLen={4}
							showIdenticon
							className='text-sm font-normal'
						/>
					</div>
				</div>
				<div className='flex items-center gap-1'>
					<PayoutExpiryDisplay
						validFromBlock={beneficiary.validFromBlock ? Number(beneficiary.validFromBlock) : null}
						payoutExpiryMsg={beneficiary.payoutExpiryMsg}
					/>
				</div>
			</div>
			{!isLastItem && <Separator orientation='horizontal' />}
		</div>
	);
}

// main component
function BeneficiaryPayoutsList({ beneficiaries, usedInOnchainInfo }: BeneficiaryPayoutsListProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { assethubApiService } = useAssethubApiService();
	const [showAllBeneficiaries, setShowAllBeneficiaries] = useState(false);
	const [beneficiariesWithDetails, setBeneficiariesWithDetails] = useState<IBeneficiaryPayoutDetails[]>(beneficiaries);

	const calculatePayoutDetails = useCallback(async (): Promise<IBeneficiaryPayoutDetails[]> => {
		if (!apiService || !network) return beneficiariesWithDetails || [];

		try {
			const currentBlockHeight = [ENetwork.KUSAMA, ENetwork.POLKADOT].includes(network) ? await assethubApiService?.getBlockHeight() : await apiService?.getBlockHeight();

			if (!currentBlockHeight) return beneficiariesWithDetails;

			return beneficiaries.map((beneficiary) => ({
				...beneficiary,
				payoutExpiryMsg: beneficiary?.validFromBlock
					? `${new BN(beneficiary.validFromBlock).gt(new BN(currentBlockHeight)) ? 'in' : ''} ${calculatePayoutExpiry(currentBlockHeight, Number(beneficiary.validFromBlock), network)}`
					: t('immediately')
			}));
		} catch (error) {
			console.error('Failed to calculate payout details:', error);
			return [];
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, network, beneficiaries, t]);

	const fetchPayoutDetails = useCallback(async () => {
		try {
			const details = await calculatePayoutDetails();
			setBeneficiariesWithDetails(details);
		} catch (error) {
			console.error('Failed to fetch payout details:', error);
		}
	}, [calculatePayoutDetails]);

	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
	const { isLoading } = useQuery({
		queryKey: ['beneficiaries-payout-details', beneficiaries, network],
		queryFn: fetchPayoutDetails,
		enabled: !!apiService && !!network
	});

	const visibleBeneficiaries = useMemo(() => {
		if (!usedInOnchainInfo) return beneficiariesWithDetails;
		return showAllBeneficiaries ? beneficiariesWithDetails : beneficiariesWithDetails.slice(0, MAX_VISIBLE_BENEFICIARIES);
	}, [beneficiariesWithDetails, showAllBeneficiaries, usedInOnchainInfo]);

	const hasMoreBeneficiaries = useMemo(() => beneficiariesWithDetails.length > MAX_VISIBLE_BENEFICIARIES, [beneficiariesWithDetails]);
	const shouldShowToggleButton = useMemo(() => hasMoreBeneficiaries && usedInOnchainInfo, [hasMoreBeneficiaries, usedInOnchainInfo]);

	return (
		<div className={cn(classes.beneficiariesDetailsDialogContentList, usedInOnchainInfo ? 'gap-2' : 'mt-6')}>
			{visibleBeneficiaries.map((beneficiary, index) => (
				<BeneficiaryPaymentItem
					key={`${beneficiary.address}-${beneficiary.validFromBlock}`}
					beneficiary={beneficiary}
					usedInOnchainInfo={usedInOnchainInfo}
					isLastItem={index === visibleBeneficiaries.length - 1}
				/>
			))}

			{shouldShowToggleButton && (
				<div className='flex justify-start'>
					<Button
						variant='ghost'
						className='flex w-full items-center justify-start p-0 text-xs font-medium text-text_pink'
						onClick={() => setShowAllBeneficiaries(!showAllBeneficiaries)}
					>
						{showAllBeneficiaries ? t('showLess') : t('showMore')}
					</Button>
				</div>
			)}
		</div>
	);
}

export default BeneficiaryPayoutsList;
