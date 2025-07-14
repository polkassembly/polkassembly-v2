// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IBeneficiary } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { groupBeneficiariesByAssetWithAddress } from '@/app/_client-utils/beneficiaryUtils';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import classes from './BeneficiariesDetails.module.scss';
import { Button } from '../../Button';
import BeneficiariesDetailsDialog from './BeneficiariesDetailsDialog';
import BeneficiaryItem from './BeneficiaryItem';

// Main component
function BeneficiariesDetails({ beneficiaries }: { beneficiaries: IBeneficiary[] }) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const [openDialog, setOpenDialog] = useState(false);
	const network = getCurrentNetwork();

	const groupedBeneficiaries = useMemo(() => groupBeneficiariesByAssetWithAddress(beneficiaries, network), [beneficiaries, network]);

	// Early return if no beneficiaries
	if (!beneficiaries?.length) {
		return null;
	}

	return (
		<div className={classes.beneficiariesWrapper}>
			<div className={classes.beneficiariesHeader}>
				<p className={classes.beneficiariesTitle}>{t('requested')}</p>
				<Button
					variant='ghost'
					size='sm'
					className={cn(classes.beneficiariesButton, 'p-0 px-0')}
					onClick={() => setOpenDialog(true)}
				>
					{t('details')}
					<ChevronRightIcon className='h-4 w-4' />
				</Button>
			</div>

			<div className={classes.beneficiariesList}>
				{Object.entries(groupedBeneficiaries).map(([assetId, { amount, addresses }], index) => (
					<BeneficiaryItem
						key={`${assetId}-${amount}`}
						assetId={assetId}
						amount={amount}
						addresses={addresses}
						index={index}
						totalLength={Object.keys(groupedBeneficiaries).length}
					/>
				))}
			</div>
			<BeneficiariesDetailsDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				beneficiaries={beneficiaries}
			/>
		</div>
	);
}

export default BeneficiariesDetails;
