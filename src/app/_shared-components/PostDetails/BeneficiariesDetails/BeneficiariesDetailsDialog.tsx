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
import { calculateTotalUSDValue } from '@/app/_client-utils/calculateTotalUSDValue';
import { calculateAssetUSDValue } from '@/app/_client-utils/calculateAssetUSDValue';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTokenUSDPrice } from '@/hooks/useCurrentTokenUSDPrice';
import { useDEDTokenUSDPrice } from '@/hooks/useDEDTokenUSDPrice';
import { useCallback, useEffect, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { BN } from '@polkadot/util';
import { calculatePayoutExpiry } from '@/app/_client-utils/calculatePayoutExpiry';
import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import BeneficiariesSkeleton from './BeneficiariesSkeleton';
import classes from './BeneficiariesDetails.module.scss';
import { Skeleton } from '../../Skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip';

interface BeneficiariesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	beneficiaries: IBeneficiary[];
}

function ExpiryWithTooltip({ validFromBlock, payoutExpiry }: { validFromBlock: number | null; payoutExpiry: string | null }) {
	const network = getCurrentNetwork();
	const subscanUrl = NETWORKS_DETAILS[`${network}`].socialLinks?.find((link) => link.id === ENetworkSocial.SUBSCAN)?.href;

	if (!payoutExpiry) {
		return <Skeleton className='h-full w-[100px]' />;
	}

	return validFromBlock ? (
		<Tooltip>
			<TooltipTrigger>
				{payoutExpiry.includes('Paid') ? (
					<Link
						href={`${subscanUrl}/block/${validFromBlock}`}
						target='_blank'
						className={cn(classes.beneficiariesExpireIn, 'flex items-center gap-1')}
					>
						{`${payoutExpiry}`}
						<SquareArrowOutUpRight className='h-3.5 w-3.5 text-text_pink' />
					</Link>
				) : (
					<div className={classes.beneficiariesExpireIn}>{`${payoutExpiry}`}</div>
				)}
			</TooltipTrigger>
			<TooltipContent>
				<div className='text-xs'>Block: #{validFromBlock}</div>
			</TooltipContent>
		</Tooltip>
	) : (
		<div className={classes.beneficiariesExpireIn}>{`${payoutExpiry}`}</div>
	);
}

function BeneficiariesDetailsDialog({ open, onOpenChange, beneficiaries }: BeneficiariesDetailsDialogProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { getCachedTokenUSDPrice } = useTokenUSDPrice();
	const { getCachedDEDTokenUSDPrice } = useDEDTokenUSDPrice();
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string | null>(null);
	const [dedTokenUSDPrice, setDEDTokenUSDPrice] = useState<string | null>(null);
	const [beneficiariesDetails, setBeneficiariesDetails] = useState<IBeneficiaryPayoutDetails[]>(
		beneficiaries.map((beneficiary) => ({
			...beneficiary,
			payoutExpiry: null
		}))
	);

	const calculateBeneficiaryExpiryDetails = useCallback(async (): Promise<IBeneficiaryPayoutDetails[]> => {
		if (!apiService || !network) return beneficiariesDetails || [];

		try {
			const blockHeight = await apiService.getBlockHeight();

			return beneficiaries.map((beneficiary) => ({
				...beneficiary,
				payoutExpiry: beneficiary?.validFromBlock
					? `${new BN(beneficiary.validFromBlock).gt(new BN(blockHeight)) ? 'in' : 'Paid'} ${calculatePayoutExpiry(blockHeight, Number(beneficiary.validFromBlock), network)}`
					: t('immediately')
			}));
		} catch (error) {
			console.error('Failed to fetch beneficiary details:', error);
			return [];
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, network]);

	const fetchBeneficiaryDetails = useCallback(async () => {
		try {
			const details = await calculateBeneficiaryExpiryDetails();
			setBeneficiariesDetails(details);
		} catch (error) {
			console.error('Failed to fetch beneficiary details:', error);
			// Handle error appropriately
		}
	}, [calculateBeneficiaryExpiryDetails]);

	useEffect(() => {
		fetchBeneficiaryDetails();
	}, [fetchBeneficiaryDetails]);

	const fetchTokenPrices = useCallback(async () => {
		if (beneficiariesDetails?.find((beneficiary) => !beneficiary.assetId)) {
			const tokenPrice = await getCachedTokenUSDPrice();
			setCurrentTokenPrice(tokenPrice);
		}
		if (beneficiariesDetails?.find((beneficiary) => beneficiary.assetId && getAssetDataByIndexForNetwork({ network, generalIndex: beneficiary.assetId })?.symbol === EAssets.DED)) {
			const dedTokenPrice = await getCachedDEDTokenUSDPrice();
			setDEDTokenUSDPrice(dedTokenPrice);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getCachedTokenUSDPrice, getCachedDEDTokenUSDPrice]);

	useEffect(() => {
		fetchTokenPrices();
	}, [fetchTokenPrices]);

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className={classes.beneficiariesDetailsDialogContent}>
				<DialogHeader>
					<DialogTitle>{t('requestedAmountDetails')}</DialogTitle>
				</DialogHeader>
				{!beneficiariesDetails.length ? (
					<BeneficiariesSkeleton usedInDialog />
				) : (
					<div>
						<div className={classes.beneficiariesDetailsDialogContentHeader}>
							<div className={classes.beneficiariesDetailsDialogContentHeaderAmount}>
								<span>~</span>
								{calculateTotalUSDValue({
									amountsDetails: beneficiariesDetails.map((beneficiary) => ({
										amount: beneficiary.amount.toString(),
										asset: beneficiary.assetId
											? (getAssetDataByIndexForNetwork({
													network,
													generalIndex: beneficiary.assetId
												}).symbol as unknown as Exclude<EAssets, EAssets.MYTH>)
											: null
									})),
									dedTokenUSDPrice,
									currentTokenPrice,
									network
								})}
							</div>
							<div className={classes.beneficiariesDialogTotalEstimatedUSD}>{t('totalEstimatedUSD')}</div>
						</div>
						<div className={classes.beneficiariesDetailsDialogContentList}>
							{beneficiariesDetails.map((beneficiary, index) => {
								const unit =
									NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${beneficiary.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || beneficiary.assetId;
								const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;
								const assetSymbol = beneficiary.assetId
									? (getAssetDataByIndexForNetwork({
											network,
											generalIndex: beneficiary.assetId
										}).symbol as unknown as Exclude<EAssets, EAssets.MYTH>)
									: null;
								return (
									<div
										className='flex flex-col gap-3'
										key={`${beneficiary.address}-${beneficiary.validFromBlock || 'immediate'}`}
									>
										<div className={classes.beneficiariesDialogListItem}>
											<div className='flex items-center'>
												<div className='flex items-center gap-2'>
													<Image
														src={icon}
														alt={unit || ''}
														width={20}
														height={20}
														className='rounded-full'
													/>
													<div className={classes.beneficiariesDialogListItemAmount}>
														{formatUSDWithUnits(
															formatBnBalance(
																beneficiary.amount.toString(),
																{ withUnit: true, numberAfterComma: 2 },
																network,
																beneficiary.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : beneficiary.assetId
															)
														)}
													</div>
													{![EAssets.USDC, EAssets.USDT].includes(assetSymbol as EAssets) && (
														<div className={classes.beneficiariesDialogListItemAmountUSD}>
															$
															{formatUSDWithUnits(
																calculateAssetUSDValue({
																	amount: beneficiary.amount,
																	asset: assetSymbol,
																	currentTokenPrice,
																	dedTokenUSDPrice,
																	network
																})?.toString(),
																1
															)}
														</div>
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
											{/* Expiry */}
											<div className='flex items-center gap-1'>
												<ExpiryWithTooltip
													validFromBlock={beneficiary.validFromBlock ? Number(beneficiary.validFromBlock) : null}
													payoutExpiry={beneficiary.payoutExpiry}
												/>
											</div>
										</div>
										{index !== beneficiariesDetails.length - 1 && <Separator orientation='horizontal' />}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default BeneficiariesDetailsDialog;
