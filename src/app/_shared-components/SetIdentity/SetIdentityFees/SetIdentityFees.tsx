// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import SetIdentityIllustration from '@assets/illustrations/set-identity.svg';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import { Separator } from '@/app/_shared-components/Separator';
import { Button } from '@/app/_shared-components/Button';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useTranslations } from 'next-intl';
import classes from './SetIdentityFees.module.scss';

function SetIdentityFees({
	onNext,
	onRequestJudgement,
	disabledRequestJudgement,
	registrarFee
}: {
	onNext: () => void;
	onRequestJudgement: () => void;
	disabledRequestJudgement: boolean;
	registrarFee: BN;
}) {
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
	const network = getCurrentNetwork();
	const t = useTranslations();

	const minDeposit = NETWORKS_DETAILS[`${network}`].peopleChainDetails.identityMinDeposit;

	return (
		<div className={classes.wrapper}>
			<div className={classes.illustration}>
				<Image
					src={SetIdentityIllustration}
					alt='Set Identity Illustration'
				/>
			</div>
			<ul className={classes.description}>
				<li>{t('SetIdentity.identityDescription1')}</li>
				<li>{t('SetIdentity.identityDescription2')}</li>
			</ul>
			<Collapsible className={classes.collapsible}>
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
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Separator />
			<Button onClick={onNext}>{t('SetIdentity.letBegin')}</Button>
			<Button
				variant='secondary'
				onClick={onRequestJudgement}
				disabled={disabledRequestJudgement}
			>
				{t('SetIdentity.requestJudgement')}
			</Button>
		</div>
	);
}

export default SetIdentityFees;
