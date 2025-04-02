// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IoPersonAdd } from 'react-icons/io5';
import { EDelegateSource, ENetwork, IDelegateDetails } from '@/_shared/types';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import PlatformLogos from '../PlatformLogos/PlatformLogos';
import DelegateDialog from '../DelegateDialog/DelegateDialog';
import styles from './DelegationCard.module.scss';

interface DelegateCardProps {
	delegate: IDelegateDetails;
	network: ENetwork;
}

const getPlatformStyles = (platforms: EDelegateSource[]) => {
	if (!Array.isArray(platforms) || platforms.length === 0) {
		return styles.delegationPlatformCard;
	}

	if (platforms.length > 1) {
		return styles.delegationCardDefault;
	}

	const platform = String(platforms[0]).toLowerCase();
	switch (platform) {
		case 'polkassembly':
			return styles.delegationPlatformCard;
		case 'parity':
			return styles.delegationCardPolkadot;
		case 'w3f':
			return styles.delegationCardW3f;
		case 'nova':
			return styles.delegationCardNova;
		case 'individual':
		case 'na':
			return styles.delegationCardIndividual;
		default:
			return styles.delegationCardDefault;
	}
};

const DelegateCard = memo(({ delegate, network }: DelegateCardProps) => {
	const t = useTranslations('Delegation');
	const [open, setOpen] = useState(false);

	return (
		<div className={styles.delegationCard}>
			<div className={`flex gap-2 rounded-t-md border py-1 ${getPlatformStyles(delegate.sources)}`}>
				<PlatformLogos platforms={delegate.sources} />
			</div>
			<div className='p-4'>
				<div className={styles.delegationDialog}>
					<Address address={delegate.address} />
					<DelegateDialog
						open={open}
						setOpen={setOpen}
						delegate={delegate}
					>
						<div className={styles.delegationDialogButton}>
							<IoPersonAdd />
							<span>{t('delegate')}</span>
						</div>
					</DelegateDialog>
				</div>
			</div>
			<div className='h-24 px-5'>
				<div className='text-sm text-text_primary'>
					{delegate?.manifesto && delegate?.manifesto.length > 0 ? (
						delegate?.manifesto?.includes('<') ? (
							<>
								<div className={styles.delegationBioContent}>
									<MarkdownEditor
										markdown={delegate.manifesto}
										readOnly
									/>
								</div>
								{delegate?.manifesto?.length > 100 && (
									<button
										className={styles.readMoreBtn}
										type='button'
									>
										{t('readMore')}
									</button>
								)}
							</>
						) : (
							<div className='bio-content'>
								<span>{delegate?.manifesto?.slice(0, 100)}</span>
								{delegate?.manifesto?.length > 100 && (
									<>
										<span>... </span>
										<button
											className={styles.readMoreBtn}
											type='button'
										>
											{t('readMore')}
										</button>
									</>
								)}
							</div>
						)
					) : (
						<span>{t('noBio')}</span>
					)}
				</div>
			</div>
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text'>
							<span className='text-2xl font-semibold'>
								{' '}
								{formatUSDWithUnits(formatBnBalance(delegate?.votingPower, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
							</span>{' '}
						</div>
						<span className={styles.delegationCardStatsItemText}>{t('votingPower')}</span>
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.last30DaysVotedProposalsCount}</div>
						<span className={styles.delegationCardStatsItemText}>{t('votedProposals')}</span>
						<span className={styles.delegationCardStatsItemTextPast30Days}>({t('past30Days')})</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.receivedDelegationsCount}</div>
						<span className={styles.delegationCardStatsItemText}>{t('receivedDelegations')}</span>
					</div>
				</div>
			</div>
		</div>
	);
});

export default DelegateCard;
