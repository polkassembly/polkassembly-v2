// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetwork, IBeneficiaryDetails } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Separator } from '../../Separator';
import classes from './BeneficiariesDetails.module.scss';

interface BeneficiaryItemProps {
	beneficiary: IBeneficiaryDetails;
	index: number;
	totalLength: number;
	network: ENetwork;
}

function BeneficiaryItem({ beneficiary, index, totalLength, network }: BeneficiaryItemProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${beneficiary.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || beneficiary.assetId;
	const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;

	return (
		<div
			className={classes.beneficiaryItem}
			key={`${beneficiary.address}-${beneficiary.assetId}`}
		>
			<div className={classes.beneficiaryItemHeader}>
				<div className={classes.beneficiaryItemHeaderAmount}>
					<div className={classes.beneficiaryItemHeaderAmountContent}>
						<Image
							src={icon}
							alt={unit || ''}
							width={22}
							height={22}
							className='rounded-full'
						/>
						<div className={classes.beneficiaryItemHeaderAmountContentText}>
							{formatUSDWithUnits(
								formatBnBalance(
									beneficiary.amount.toString(),
									{ withUnit: true, numberAfterComma: 2 },
									network,
									beneficiary.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : beneficiary.assetId
								)
							)}
						</div>
					</div>
				</div>
				<div className={classes.beneficiaryItemHeaderExpireIn}>
					<div className={classes.beneficiaryItemHeaderExpireInText}>{beneficiary.expireIn ? `in ${beneficiary.expireIn}` : t('immediately')}</div>
				</div>
			</div>
			{index !== totalLength - 1 && <Separator orientation='horizontal' />}
		</div>
	);
}

export default BeneficiaryItem;
