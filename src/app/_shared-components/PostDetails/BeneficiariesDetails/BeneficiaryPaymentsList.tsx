// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetworkSocial, IBeneficiary, IBeneficiaryPayoutDetails } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import { calculateAssetUSDValue } from '@/app/_client-utils/calculateAssetUSDValue';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { BN } from '@polkadot/util';
import { calculatePayoutExpiry } from '@/app/_client-utils/calculatePayoutExpiry';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import { Skeleton } from '../../Skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip';
import classes from './BeneficiariesDetails.module.scss';
import { Button } from '../../Button';

interface BeneficiaryPaymentsListProps {
	beneficiaries: IBeneficiary[];
	currentTokenPrice: string | null;
	dedTokenUSDPrice: string | null;
	usedInOnchainInfo?: boolean;
}

const MAX_VISIBLE_BENEFICIARIES = 4;

interface PayoutExpiryProps {
	validFromBlock: number | null;
	payoutExpiry: string | null;
}

function PayoutExpiryDisplay({ validFromBlock, payoutExpiry }: PayoutExpiryProps) {
	const network = getCurrentNetwork();
	const subscanUrl = NETWORKS_DETAILS[`${network}`].socialLinks?.find((link) => link.id === ENetworkSocial.SUBSCAN)?.href;

	if (!payoutExpiry) {
		return <Skeleton className='h-full w-[100px]' />;
	}

	const isPaid = payoutExpiry.includes('Paid');
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
						{payoutExpiry}
						<SquareArrowOutUpRight className='h-3.5 w-3.5 text-text_pink' />
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
					<div className={classes.beneficiariesExpireIn}>{payoutExpiry}</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className='text-xs'>Block: #{validFromBlock}</div>
				</TooltipContent>
			</Tooltip>
		);
	}

	return <div className={classes.beneficiariesExpireIn}>{payoutExpiry}</div>;
}

interface PaymentItemProps {
	beneficiary: IBeneficiaryPayoutDetails;
	currentTokenPrice: string | null;
	dedTokenUSDPrice: string | null;
	usedInOnchainInfo?: boolean;
	isLastItem: boolean;
}

function PaymentItem({ beneficiary, currentTokenPrice, dedTokenUSDPrice, usedInOnchainInfo, isLastItem }: PaymentItemProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();

	const assetUnit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${beneficiary.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || beneficiary.assetId;

	const assetIcon = treasuryAssetsData[assetUnit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;

	const assetSymbol = beneficiary.assetId
		? (getAssetDataByIndexForNetwork({
				network,
				generalIndex: beneficiary.assetId
			}).symbol as unknown as Exclude<EAssets, EAssets.MYTH>)
		: null;

	const shouldShowUSDValue = ![EAssets.USDC, EAssets.USDT].includes(assetSymbol as EAssets);

	const formattedAmount = formatUSDWithUnits(
		formatBnBalance(
			beneficiary.amount.toString(),
			{ withUnit: true, numberAfterComma: 2 },
			network,
			beneficiary.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : beneficiary.assetId
		)
	);

	const usdValue = shouldShowUSDValue
		? calculateAssetUSDValue({
				amount: beneficiary.amount,
				asset: assetSymbol,
				currentTokenPrice,
				dedTokenUSDPrice,
				network
			})?.toString()
		: null;

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
						<div className={cn(classes.beneficiariesDialogListItemAmount, usedInOnchainInfo ? 'text-sm font-medium' : '')}>{formattedAmount}</div>
						{shouldShowUSDValue && usdValue && <div className={cn(classes.beneficiariesDialogListItemAmountUSD)}>${formatUSDWithUnits(usdValue, 1)}</div>}
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
						payoutExpiry={beneficiary.payoutExpiry}
					/>
				</div>
			</div>
			{!isLastItem && <Separator orientation='horizontal' />}
		</div>
	);
}

// main component
function BeneficiaryPaymentsList({ beneficiaries, currentTokenPrice, dedTokenUSDPrice, usedInOnchainInfo }: BeneficiaryPaymentsListProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [showAllBeneficiaries, setShowAllBeneficiaries] = useState(false);
	const [beneficiariesWithDetails, setBeneficiariesWithDetails] = useState<IBeneficiaryPayoutDetails[]>(
		beneficiaries.map((beneficiary) => ({
			...beneficiary,
			payoutExpiry: null
		}))
	);

	const calculatePayoutDetails = useCallback(async (): Promise<IBeneficiaryPayoutDetails[]> => {
		if (!apiService || !network) return beneficiariesWithDetails || [];

		try {
			const currentBlockHeight = await apiService.getBlockHeight();

			return beneficiaries.map((beneficiary) => ({
				...beneficiary,
				payoutExpiry: beneficiary?.validFromBlock
					? `${new BN(beneficiary.validFromBlock).gt(new BN(currentBlockHeight)) ? 'in' : 'Paid'} ${calculatePayoutExpiry(currentBlockHeight, Number(beneficiary.validFromBlock), network)}`
					: t('immediately')
			}));
		} catch (error) {
			console.error('Failed to calculate payout details:', error);
			return [];
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, network]);

	const fetchPayoutDetails = useCallback(async () => {
		try {
			const details = await calculatePayoutDetails();
			setBeneficiariesWithDetails(details);
		} catch (error) {
			console.error('Failed to fetch payout details:', error);
		}
	}, [calculatePayoutDetails]);

	useEffect(() => {
		fetchPayoutDetails();
	}, [fetchPayoutDetails]);

	const getVisibleBeneficiaries = () => {
		if (!usedInOnchainInfo) return beneficiariesWithDetails;
		return showAllBeneficiaries ? beneficiariesWithDetails : beneficiariesWithDetails.slice(0, MAX_VISIBLE_BENEFICIARIES);
	};

	const visibleBeneficiaries = getVisibleBeneficiaries();
	const hasMoreBeneficiaries = beneficiariesWithDetails.length > MAX_VISIBLE_BENEFICIARIES;
	const shouldShowToggleButton = hasMoreBeneficiaries && usedInOnchainInfo;

	return (
		<div className={cn(classes.beneficiariesDetailsDialogContentList, usedInOnchainInfo ? 'gap-2' : 'mt-6')}>
			{visibleBeneficiaries.map((beneficiary, index) => (
				<PaymentItem
					key={`${beneficiary.address}-${beneficiary.validFromBlock || 'immediate'}`}
					beneficiary={beneficiary}
					currentTokenPrice={currentTokenPrice}
					dedTokenUSDPrice={dedTokenUSDPrice}
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

export default BeneficiaryPaymentsList;
