// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets } from '@/_shared/types';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { Separator } from '../../Separator';
import classes from './BeneficiariesDetails.module.scss';
import Address from '../../Profile/Address/Address';

interface BeneficiaryItemProps {
	assetId: string;
	amount: BN;
	addresses: string[];
	index: number;
	totalLength: number;
}

const DISPLAY_LIMIT = 5;
const SHOW_ONLY_IDENTICON_LIMIT = 1;

function BeneficiaryItem({ assetId, amount, addresses, index, totalLength }: BeneficiaryItemProps) {
	const t = useTranslations('PostDetails.BeneficiariesDetails');
	const network = getCurrentNetwork();
	const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || assetId;
	const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;
	return (
		<div className={classes.beneficiaryItem}>
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
								formatBnBalance(amount.toString(), { withUnit: true, numberAfterComma: 2 }, network, assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId)
							)}
						</div>
					</div>
				</div>
				<div className={classes.beneficiaryItemHeaderExpireIn}>
					{addresses.slice(0, DISPLAY_LIMIT).map((address) => (
						<Address
							key={address}
							address={address}
							truncateCharLen={SHOW_ONLY_IDENTICON_LIMIT}
							showOnlyIdenticon={addresses.length > SHOW_ONLY_IDENTICON_LIMIT}
							className='text-xs font-bold lg:text-sm'
						/>
					))}
					{addresses.length > DISPLAY_LIMIT && (
						<div className={classes.beneficiaryItemHeaderExpireInText}>
							+{addresses.length - DISPLAY_LIMIT} {t('more')}
						</div>
					)}
				</div>
			</div>
			{index !== totalLength - 1 && <Separator orientation='horizontal' />}
		</div>
	);
}

export default BeneficiaryItem;
