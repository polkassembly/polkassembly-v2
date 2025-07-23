// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { IBeneficiary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN, BN_ZERO } from '@polkadot/util';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import BeneficiariesSkeleton from './BeneficiariesSkeleton';
import classes from './BeneficiariesDetails.module.scss';
import BeneficiaryPayoutsList from './BeneficiaryPayoutsList';

interface BeneficiariesDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	beneficiaries: IBeneficiary[];
}

function BeneficiariesDetailsDialog({ open, onOpenChange, beneficiaries }: BeneficiariesDetailsDialogProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const totalUsdAmount = useMemo(() => beneficiaries.reduce((acc, beneficiary) => new BN(acc).add(new BN(beneficiary.usdAmount || 0)), BN_ZERO).toString(), [beneficiaries]);

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
						{!!beneficiaries.length && (
							<div className={classes.beneficiariesDetailsDialogContentHeader}>
								<div className={classes.beneficiariesDetailsDialogContentHeaderAmount}>
									<span>~</span>
									{formatUSDWithUnits(totalUsdAmount, 1)}
								</div>
								<div className={classes.beneficiariesDialogTotalEstimatedUSD}>{t('totalEstimatedUSD')}</div>
							</div>
						)}
						<div className='mt-6'>
							<BeneficiaryPayoutsList beneficiaries={beneficiaries || []} />
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default BeneficiariesDetailsDialog;
