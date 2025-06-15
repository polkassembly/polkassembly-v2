// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetwork, IBeneficiary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import { calculateTotalUSDValue } from '@/app/_client-utils/calculateTotalUSDValue';
import { calculateAssetUSDValue } from '@/app/_client-utils/calculateAssetUSDValue';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import BeneficiariesSkeleton from './BeneficiariesSkeleton';
import classes from './BeneficiariesDetails.module.scss';

interface IBeneficiaryDetails extends IBeneficiary {
	expireIn: string | null;
}

interface BeneficiariesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	beneficiariesDetails: IBeneficiaryDetails[];
	currentTokenPrice: string | null;
	dedTokenUSDPrice: string | null;
	network: ENetwork;
}

function BeneficiariesDetailsDialog({ open, onOpenChange, beneficiariesDetails, currentTokenPrice, dedTokenUSDPrice, network }: BeneficiariesDetailsDialogProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');

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
							<div className={classes.beneficiariesDetailsDialogContentHeaderTotalEstimatedUSD}>{t('totalEstimatedUSD')}</div>
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
										<div className={classes.beneficiariesDetailsDialogContentListItem}>
											<div className='flex items-center'>
												<div className='flex items-center gap-2'>
													<Image
														src={icon}
														alt={unit || ''}
														width={20}
														height={20}
														className='rounded-full'
													/>
													<div className={classes.beneficiariesDetailsDialogContentListItemAmount}>
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
														<div className={classes.beneficiariesDetailsDialogContentListItemAmountUSD}>
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
													<span className={classes.beneficiariesDetailsDialogContentListItemTo}>{t('to')}</span>
													<Address
														address={beneficiary.address}
														truncateCharLen={4}
														showIdenticon
														className='text-sm font-normal'
													/>
												</div>
											</div>
											<div className='flex items-center gap-1'>
												<div className={classes.beneficiariesDetailsDialogContentListItemExpireIn}>{beneficiary.expireIn ? `in ${beneficiary.expireIn}` : t('immediately')}</div>
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
