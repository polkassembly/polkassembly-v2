// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { InfoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import CastVote from '@assets/icons/cast-vote.svg';
import DotIcon from '@assets/delegation/polkadot-logo.svg';
import ConvictionVoteIcon from '@assets/icons/conviction-period.svg';
import LikeDislikeIcon from '@assets/icons/like-dislike.svg';
import Link from 'next/link';
import UserIcon from '@assets/profile/user-icon.svg';
import { FaArrowRightLong } from 'react-icons/fa6';
import { Separator } from '@/app/_shared-components/Separator';
import { Button } from '@/app/_shared-components/Button';
import { Table, TableCell, TableHead, TableRow } from '@/app/_shared-components/Table';
import { AiFillLike } from 'react-icons/ai';

function VoteSummaryInfo({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) {
	const t = useTranslations();
	const getConvictionText = t('PostDetails.VoteSummaryInfo.conviction');
	return (
		<div>
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogTrigger asChild>
					<button type='button'>
						<InfoIcon className='h-4 w-4' />
					</button>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<div className='flex items-center gap-x-2'>
							<InfoIcon className='h-4 w-4' />
							<DialogTitle className='text-lg font-semibold text-btn_secondary_text'>{t('PostDetails.VoteSummaryInfo.howAreVotesCalculated')}</DialogTitle>
						</div>
					</DialogHeader>
					<DialogDescription>
						<p>{t('PostDetails.VoteSummaryInfo.howAreVotesCalculatedDescription')}</p>
						<div className='flex items-center justify-between gap-x-2 pt-5'>
							<div className='flex flex-col items-center gap-2'>
								<Image
									src={CastVote}
									alt='Cast Vote'
									className='h-10 w-10'
								/>
								<p className='w-28 text-center text-xs'>{t('PostDetails.VoteSummaryInfo.userWantToVote')}</p>
							</div>
							<FaArrowRightLong className='h-4 w-4 text-border_grey' />
							<div className='flex flex-col items-center gap-2'>
								<Image
									src={DotIcon}
									alt='DOT Icon'
									className='h-10 w-10'
								/>
								<p className='w-32 text-center text-xs'>{t('PostDetails.VoteSummaryInfo.chooseYourVote')}</p>
							</div>
							<FaArrowRightLong className='h-4 w-4 text-border_grey' />

							<div className='flex flex-col items-center gap-2'>
								<Image
									src={ConvictionVoteIcon}
									alt='DOT Icon'
									className='h-10 w-10'
								/>
								<p className='w-28 text-center text-xs'>
									{t('PostDetails.VoteSummaryInfo.setsA')}
									<Link
										href='https://wiki.polkadot.network/general/web3-and-polkadot/#voluntary-locking'
										className='pl-1 text-text_pink underline'
									>
										{getConvictionText}
									</Link>{' '}
									{t('PostDetails.VoteSummaryInfo.period')}
								</p>
							</div>
							<FaArrowRightLong className='h-4 w-4 text-border_grey' />

							<div className='flex flex-col items-center gap-2'>
								<Image
									src={LikeDislikeIcon}
									alt='DOT Icon'
									className='h-10 w-10'
								/>
								<p className='text-center text-xs'>{t('PostDetails.VoteSummaryInfo.userCastTheirVote')}</p>
							</div>
						</div>
						<div className='flex py-4'>
							<span className='w-full border-t-2 border-dotted border-border_grey' />
						</div>
						<div>
							<p>{t('PostDetails.VoteSummaryInfo.here')},</p>
						</div>
						<div className='rounded-lg p-4 shadow-lg'>
							<Table>
								<TableRow>
									<TableHead>{t('PostDetails.VoteSummaryInfo.voter')}</TableHead>
									<TableHead>{t('PostDetails.VoteSummaryInfo.voteAmount')}</TableHead>
									<TableHead>{getConvictionText}</TableHead>
									<TableHead>{t('PostDetails.VoteSummaryInfo.voteType')}</TableHead>
								</TableRow>
								<TableRow>
									<TableCell className='flex items-center gap-x-2 text-xs text-text_grey'>
										<Image
											src={UserIcon}
											alt=''
											width={16}
											height={16}
										/>
										<p>DDUX..c..</p>
									</TableCell>
									<TableCell className='text-xs text-text_grey'>11.27 DOT</TableCell>
									<TableCell className='text-xs text-text_grey'>4x</TableCell>
									<TableCell>
										<AiFillLike className='text-success' />
									</TableCell>
								</TableRow>
							</Table>
						</div>
						<p className='pt-4'>
							{t('PostDetails.VoteSummaryInfo.theVoteWillBeCalculatedByMultiplying')}{' '}
							<span className='text-text_pink'>
								11.27 DOT ({t('PostDetails.VoteSummaryInfo.amount')})*4 ({getConvictionText}){' '}
							</span>{' '}
							{t('PostDetails.VoteSummaryInfo.toGetTheFinalVote')}
						</p>
						<div className='flex py-4'>
							<span className='w-full border-t-2 border-dotted border-border_grey' />
						</div>
						<p>{t('PostDetails.VoteSummaryInfo.note')}</p>
						<Separator className='my-4' />
						<div className='flex justify-end'>
							<Button onClick={() => setIsDialogOpen(false)}>{t('PostDetails.VoteSummaryInfo.gotIt')}</Button>
						</div>
					</DialogDescription>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default VoteSummaryInfo;
