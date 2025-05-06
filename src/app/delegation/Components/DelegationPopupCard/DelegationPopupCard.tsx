// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';
import { IoMdClose } from '@react-icons/all-files/io/IoMdClose';
import PolkaAsset from '@assets/delegation/Track.svg';
import PolkaBadge from '@assets/delegation/badge.svg';
import Reverse from '@assets/delegation/reverse.svg';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MdInfoOutline } from '@react-icons/all-files/md/MdInfoOutline';
import Image from 'next/image';
import styles from './DelegationPopupCard.module.scss';
import BecomeDelegateDialog from '../BecomeDelegateDialog/BecomeDelegateDialog';

function DelegationPopupCard() {
	const [showDelegationInfo, setShowDelegationInfo] = useState(true);
	const t = useTranslations('Delegation');
	return (
		<div>
			{showDelegationInfo && (
				<div className={styles.delegationPopupCard}>
					<div className='flex items-center justify-between px-6'>
						<p className='text-xl font-semibold text-btn_secondary_text'>{t('howToDelegateOnPolkassembly')}</p>
						<div className='flex items-center gap-4'>
							<BecomeDelegateDialog />
							<IoMdClose
								onClick={() => setShowDelegationInfo(false)}
								className='cursor-pointer text-2xl text-wallet_btn_text'
							/>
						</div>
					</div>

					<div className='mt-4 grid grid-cols-2'>
						<div className='grid grid-cols-[auto_1fr] items-start'>
							<Image
								src={PolkaAsset}
								alt='Polka Asset'
								className='-mt-5 h-36 w-36'
							/>
							<div className={styles.delegationPopupCardStep}>
								<p className='whitespace-nowrap font-semibold'>{t('step1')}</p>
								<div>
									<p className='font-semibold'>{t('selectTrackForDelegation')}</p>
									<p className='max-w-xs'>{t('openGovAllowsForTrackLevelAgileDelegationChooseATrackToProceed')}</p>
								</div>
							</div>
						</div>
						<div className={styles.delegationPopupCardStepWrapper}>
							<div className='grid grid-cols-2 items-start'>
								<Image
									src={Reverse}
									alt='Reverse'
									className='mt-5 h-auto w-12'
								/>
								<Image
									src={PolkaBadge}
									alt='Polka Badge'
									className='h-auto w-24'
								/>
							</div>
							<div className={styles.delegationPopupCardStepWrapper}>
								<div className={styles.delegationPopupCardStep}>
									<p className='whitespace-nowrap font-semibold'>{t('step2')}</p>
									<div>
										<p className='font-semibold'>{t('selectDelegate')}</p>
										<p>{t('chooseADelegateBasedOnTheStatsToCompleteYourDelegationProcess')}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='mx-4 mb-2 rounded-md bg-info_bg px-4 py-2 text-sm'>
						<p className='flex items-center gap-1 text-wallet_btn_text'>
							<MdInfoOutline className='mr-1 inline-block text-lg' />
							{t('wantToLearnMoreAboutDelegationProcessBeforeLockingYourTokensClick')}
							<Link
								className='text-border_blue underline'
								target='_blank'
								href='https://docs.polkassembly.io/jekyll/2022-06-30-opengov.html#delegating-voting-power-on-polkassembly'
							>
								{' '}
								{t('here')}
							</Link>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default DelegationPopupCard;
