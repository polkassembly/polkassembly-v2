// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, IBeneficiary, IBeneficiaryDetails } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ChevronRightIcon } from 'lucide-react';
import { useTokenUSDPrice } from '@/hooks/useCurrentTokenUSDPrice';
import { useDEDTokenUSDPrice } from '@/hooks/useDEDTokenUSDPrice';
import { calculatePayoutExpiry } from '@/app/_client-utils/calculatePayoutExpiry';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import classes from './BeneficiariesDetails.module.scss';
import { Button } from '../../Button';
import BeneficiariesDetailsDialog from './BeneficiariesDetailsDialog';
import BeneficiaryItem from './BeneficiaryItem';
import BeneficiariesSkeleton from './BeneficiariesSkeleton';

const DISPLAY_LIMIT = 5;
// Main component
function BeneficiariesDetails({ beneficiaries }: { beneficiaries: IBeneficiary[] }) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const { getCachedTokenUSDPrice } = useTokenUSDPrice();
	const { getCachedDEDTokenUSDPrice } = useDEDTokenUSDPrice();
	const { apiService } = usePolkadotApiService();
	const [openDialog, setOpenDialog] = useState(false);
	const [beneficiariesDetails, setBeneficiariesDetails] = useState<IBeneficiaryDetails[]>([]);
	const [dedTokenUSDPrice, setDEDTokenUSDPrice] = useState<string | null>(null);
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string | null>(null);

	const calculateBeneficiaryExpiryDetails = useCallback(async (): Promise<IBeneficiaryDetails[]> => {
		if (!apiService || !network) return [];

		try {
			const blockHeight = await apiService.getBlockHeight();

			return beneficiaries.map((beneficiary) => ({
				...beneficiary,
				expireIn: beneficiary?.validFromBlock ? calculatePayoutExpiry(blockHeight, Number(beneficiary.validFromBlock), network) : null
			}));
		} catch (error) {
			console.error('Failed to fetch beneficiary details:', error);
			return [];
		}
	}, [apiService, network, beneficiaries]);

	const fetchBeneficiaryDetails = useCallback(async () => {
		try {
			const details = await calculateBeneficiaryExpiryDetails();
			setBeneficiariesDetails(details);
		} catch (error) {
			console.error('Failed to fetch beneficiary details:', error);
			// Handle error appropriately
		}
	}, [calculateBeneficiaryExpiryDetails]);

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
		fetchBeneficiaryDetails();
	}, [fetchBeneficiaryDetails]);

	useEffect(() => {
		fetchTokenPrices();
	}, [fetchTokenPrices]);

	// Early return if no beneficiaries
	if (!beneficiaries?.length) {
		return null;
	}

	return (
		<div className={classes.beneficiariesDetailsWrapper}>
			<div className={classes.beneficiariesDetailsHeader}>
				<p className={classes.beneficiariesDetailsTitle}>{t('requested')}</p>
				<Button
					variant='ghost'
					size='sm'
					className={classes.beneficiariesDetailsButton}
					onClick={() => setOpenDialog(true)}
				>
					{t('details')}
					<ChevronRightIcon className='h-4 w-4' />
				</Button>
			</div>
			{!beneficiariesDetails?.length ? (
				<BeneficiariesSkeleton />
			) : (
				<div className={classes.beneficiariesDetailsList}>
					{beneficiariesDetails?.slice(0, DISPLAY_LIMIT)?.map((beneficiary, index) => (
						<BeneficiaryItem
							key={`${beneficiary.address}-${beneficiary.assetId}`}
							beneficiary={beneficiary}
							index={index}
							totalLength={beneficiariesDetails.slice(0, DISPLAY_LIMIT).length}
							network={network}
						/>
					))}
					{beneficiariesDetails.length > DISPLAY_LIMIT && (
						<div className={classes.beneficiariesDetailsSeeMore}>
							+{beneficiariesDetails.length - DISPLAY_LIMIT} more
							<Button
								variant='ghost'
								size='sm'
								className={classes.beneficiariesDetailsSeeMoreButton}
								onClick={() => setOpenDialog(true)}
							>
								{t('seeMore')}
							</Button>
						</div>
					)}
				</div>
			)}
			<BeneficiariesDetailsDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				beneficiariesDetails={beneficiariesDetails}
				currentTokenPrice={currentTokenPrice}
				dedTokenUSDPrice={dedTokenUSDPrice}
				network={network}
			/>
		</div>
	);
}

export default BeneficiariesDetails;
