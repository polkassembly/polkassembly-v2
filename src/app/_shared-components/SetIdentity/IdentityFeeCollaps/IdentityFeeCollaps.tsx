// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { ChevronDown } from 'lucide-react';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { Separator } from '../../Separator';
import classes from './IdentityFeeCollaps.module.scss';

function IdentityFeeCollaps({ className, registrarFee, gasFee }: { className?: string; registrarFee: BN; gasFee?: BN }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
	const minDeposit = NETWORKS_DETAILS[`${network}`].peopleChainDetails.identityMinDeposit;

	return (
		<Collapsible className={cn(classes.collapsible, className)}>
			<CollapsibleTrigger className={classes.collapsibleTrigger}>
				<div className={classes.collapsibleTriggerContent}>
					<span className='text-sm'>{t('SetIdentity.totalAmountRequired')}</span>
					<div className={classes.collapsibleTriggerContentInner}>
						<p className={classes.collapsibleTriggerContentInnerText}>
							<span className='font-semibold'>
								{formatter.format(Number(formatBnBalance(minDeposit.add(registrarFee), { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
							</span>
							<span className='text-[10px] text-wallet_btn_text'>{t('SetIdentity.viewAmountBreakup')}</span>
						</p>
						<ChevronDown className='font-semibold text-text_primary' />
					</div>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-2' />
				<div className={classes.feeWrapper}>
					<div className={classes.feeItem}>
						<p className={classes.feeItemText}>{t('SetIdentity.minimumDeposit')}</p>
						<p className={classes.feeItemValue}>
							{formatter.format(Number(formatBnBalance(minDeposit, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</p>
					</div>
					<div className={classes.feeItem}>
						<p className={classes.feeItemText}>{t('SetIdentity.registrarFees')}</p>
						<p className={classes.feeItemValue}>
							{formatter.format(Number(formatBnBalance(registrarFee, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</p>
					</div>
					{gasFee && gasFee.gt(BN_ZERO) && (
						<div className={classes.feeItem}>
							<p className={classes.feeItemText}>{t('SetIdentity.gasFee')}</p>
							<p className={classes.feeItemValue}>
								{formatter.format(Number(formatBnBalance(gasFee, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
							</p>
						</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default IdentityFeeCollaps;
