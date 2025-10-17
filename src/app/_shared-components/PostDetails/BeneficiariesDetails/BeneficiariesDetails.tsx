// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, IBeneficiary, IBeneficiaryInput } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import InfoQueryIcon from '@assets/icons/info-query-icon.svg';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { BN } from '@polkadot/util';
import { ValidatorService } from '@/_shared/_services/validator_service';
import classes from './BeneficiariesDetails.module.scss';
import { Button } from '../../Button';
import BeneficiariesDetailsDialog from './BeneficiariesDetailsDialog';
import BeneficiaryItem from './BeneficiaryItem';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../Tooltip';

export const aggregateBeneficiariesByAsset = (beneficiaries: IBeneficiaryInput[] | undefined | null, network: ENetwork): Record<string, { amount: BN; addresses: string[] }> => {
	if (!beneficiaries || !Array.isArray(beneficiaries) || !ValidatorService.isValidNetwork(network)) {
		return {};
	}

	return beneficiaries.reduce((acc: Record<string, { amount: BN; addresses: string[] }>, curr: IBeneficiaryInput) => {
		if (!curr) return acc;

		const assetId = curr.assetId || NETWORKS_DETAILS[network as ENetwork].tokenSymbol;

		if (!assetId) return acc;

		if (!acc[assetId as string]) {
			acc[assetId as string] = { amount: new BN(0), addresses: [] };
		}

		try {
			const amount = new BN(curr.amount || '0');
			acc[assetId as string] = {
				amount: acc[assetId as string].amount.add(amount),
				addresses: [...new Set([...acc[assetId as string].addresses, curr.address || ''])]
			};
		} catch (error) {
			console.error(`Error processing beneficiary amount: ${error}`);
		}

		return acc;
	}, {});
};

// Main component
function BeneficiariesDetails({ beneficiaries }: { beneficiaries: IBeneficiary[] }) {
	const t = useTranslations('PostDetails');
	const [openDialog, setOpenDialog] = useState(false);
	const network = getCurrentNetwork();

	const groupedBeneficiaries = useMemo(() => aggregateBeneficiariesByAsset(beneficiaries, network), [beneficiaries, network]);

	// Early return if no beneficiaries
	if (!beneficiaries?.length) {
		return null;
	}

	return (
		<div className={classes.beneficiariesWrapper}>
			<div className={classes.beneficiariesHeader}>
				<p className={classes.beneficiariesTitle}>
					{t('BeneficiariesDetails.requested')}
					<Tooltip>
						<TooltipTrigger asChild>
							<Image
								src={InfoQueryIcon}
								alt='info query icon'
								className='h-3.5 w-3.5'
								width={14}
								height={14}
							/>
						</TooltipTrigger>
						<TooltipContent className='bg-tooltip_background text-sm text-white'>{t('Tooltips.requestedAmount')}</TooltipContent>
					</Tooltip>
				</p>
				<Button
					variant='ghost'
					size='sm'
					className={cn(classes.beneficiariesButton, 'p-0 px-0')}
					onClick={() => setOpenDialog(true)}
				>
					{t('BeneficiariesDetails.details')}
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
