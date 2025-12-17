// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ESocial, IDelegateDetails } from '@/_shared/types';
import RankStar from '@assets/profile/rank-star.svg';
import Identicon from '@polkadot/react-identicon';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Button } from '@ui/Button';
import Address from '@ui/Profile/Address/Address';
import ChildBranchIcon from '@assets/icons/child-branch.svg';
import { CircleDollarSign } from 'lucide-react';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import styles from '../../PeopleCard.module.scss';

const SocialIcons: Partial<Record<ESocial, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

function CuratorCard({ curator }: { curator: IDelegateDetails }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);
	const signatories = curator?.delegators ?? [];

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					{(curator?.publicUser?.addresses?.length ?? 0) > 0 ? (
						<Address
							disableTooltip
							address={curator?.publicUser?.addresses[0] || ''}
							iconSize={30}
							showIdenticon
							textClassName='text-left text-lg font-semibold'
						/>
					) : (
						<span className='text-xl font-semibold text-text_primary'>{curator?.publicUser?.username || ''}</span>
					)}
				</div>
				<div className='flex items-center gap-x-2'>
					<span>Signatories:</span>
					<div className='flex -space-x-2'>
						{signatories.slice(0, 4).map((address) => (
							<div
								key={address}
								className='h-8 w-8 rounded-full ring-2 ring-bg_modal'
							>
								<Identicon
									className='h-8 w-8 rounded-full'
									value={address}
									size={32}
									theme='polkadot'
								/>
							</div>
						))}
						{signatories.length > 4 && <span className='text-xs font-semibold text-wallet_btn_text'>+{signatories.length - 4}</span>}
					</div>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					{(curator?.publicUser?.addresses?.length ?? 0) > 0 ? (
						<CopyToClipboard
							label={shortenAddress(curator?.publicUser?.addresses[0] || '', 5)}
							text={curator?.publicUser?.addresses[0] || ''}
							className='text-base'
						/>
					) : null}
					<span className='flex items-center gap-1 rounded-md bg-rank_card_bg px-1.5 py-0.5 font-medium'>
						<Image
							src={RankStar}
							alt='Rank Star'
							width={16}
							height={16}
						/>
						<span className='text-sm font-medium text-leaderboard_score'>{Math.floor(curator?.publicUser?.profileScore || 0)}</span>
					</span>
					<span className='flex items-center gap-1 rounded-full bg-bounties_label_bg px-2 py-0.5 font-medium'>
						<CircleDollarSign className='h-4 w-4 text-2xl text-bounties_label_text' />
						<span className='text-xs font-medium text-bounties_label_text'>4 Bounties Curated</span>
					</span>
					<span className='flex items-center gap-1 rounded-full bg-child_bounties_label_bg px-2 py-0.5 font-medium'>
						<Image
							src={ChildBranchIcon}
							alt='Link tree'
							width={16}
							height={16}
						/>
						<span className='text-xs font-medium text-child_bounties_label_text'>12 Child Bounties Curated</span>
					</span>
				</div>
			</div>
			<div>
				{curator?.publicUser?.profileDetails?.bio && (
					<>
						<div className={`${styles.bio} ${isReadMoreVisible ? '' : styles.bioCollapsed} mt-3`}>{curator?.publicUser?.profileDetails?.bio}</div>
						{curator?.publicUser?.profileDetails?.bio.length > 100 && (
							<Button
								variant='ghost'
								className={styles.readMoreButton}
								onClick={() => setIsReadMoreVisible(!isReadMoreVisible)}
								aria-expanded={isReadMoreVisible ? 'true' : 'false'}
							>
								{isReadMoreVisible ? t('Community.Members.readLess') : t('Community.Members.readMore')}
							</Button>
						)}
					</>
				)}
			</div>
			<div className='flex items-center gap-x-4'>
				{curator?.publicUser?.profileDetails?.publicSocialLinks?.map((social) => {
					const IconComponent = SocialIcons[social.platform];
					return IconComponent ? (
						<a
							key={social.platform}
							href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
							target='_blank'
							className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
							rel='noreferrer noopener'
						>
							<IconComponent className='text-white' />
						</a>
					) : null;
				})}
			</div>
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
							<span className='font-semibold md:text-2xl'>
								{formatUSDWithUnits(formatBnBalance(curator?.maxDelegated, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
							</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>Total Rewarded</span>
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{curator?.last30DaysVotedProposalsCount}</div>
						<span className={styles.delegationCardStatsItemText}>Active Bounties</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='flex items-center gap-3 font-semibold text-btn_secondary_text md:text-2xl'>
							{curator?.delegators?.length || 0} <span className='flex items-center gap-1 rounded-md bg-failure px-1.5 py-0.5 text-xs font-medium text-white'>Unclaimed: $700</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>Child Bounty Disbursed</span>
					</div>
				</div>
			</div>
		</div>
	);
}
export default CuratorCard;
