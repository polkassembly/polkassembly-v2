// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, IBeneficiary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import { calculateTotalUSDValue } from '@/app/_client-utils/calculateTotalUSDValue';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTokenUSDPrice } from '@/hooks/useCurrentTokenUSDPrice';
import { useDEDTokenUSDPrice } from '@/hooks/useDEDTokenUSDPrice';
import { useCallback, useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import BeneficiariesSkeleton from './BeneficiariesSkeleton';
import classes from './BeneficiariesDetails.module.scss';
import BeneficiaryPaymentsList from './BeneficiaryPaymentsList';

interface BeneficiariesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	beneficiaries: IBeneficiary[];
}

function BeneficiariesDetailsDialog({ open, onOpenChange, beneficiaries }: BeneficiariesDetailsDialogProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const { getCachedTokenUSDPrice } = useTokenUSDPrice();
	const { getCachedDEDTokenUSDPrice } = useDEDTokenUSDPrice();
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string | null>(null);
	const [dedTokenUSDPrice, setDEDTokenUSDPrice] = useState<string | null>(null);

	const fetchTokenPrices = useCallback(async () => {
		if (beneficiaries?.find((beneficiary) => !beneficiary.assetId)) {
			const tokenPrice = await getCachedTokenUSDPrice();
			setCurrentTokenPrice(tokenPrice);
		}
		if (beneficiaries?.find((beneficiary) => beneficiary.assetId && getAssetDataByIndexForNetwork({ network, generalIndex: beneficiary.assetId })?.symbol === EAssets.DED)) {
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
					<DialogTitle className='text-text_primary'>{t('requestedAmountDetails')}</DialogTitle>
				</DialogHeader>
				{!beneficiaries.length ? (
					<BeneficiariesSkeleton usedInDialog />
				) : (
					<div>
						<div className={classes.beneficiariesDetailsDialogContentHeader}>
							<div className={classes.beneficiariesDetailsDialogContentHeaderAmount}>
								<span>~</span>
								{calculateTotalUSDValue({
									amountsDetails: beneficiaries.map((beneficiary) => ({
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
						<div className='mt-6'>
							<BeneficiaryPaymentsList
								currentTokenPrice={currentTokenPrice}
								beneficiaries={beneficiaries}
								dedTokenUSDPrice={dedTokenUSDPrice}
							/>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default BeneficiariesDetailsDialog;
