// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IUserVote } from '@/_shared/types';
import { BN_ZERO } from '@polkadot/util';
import Link from 'next/link';
import Image from 'next/image';
import ViewSubscanIcon from '@assets/icons/profile-subscan.svg';
import DelegatedVotesDropdown from '../../PostDetails/VoteSummary/VoteHistory/DelegatedVotesDropdown/DelegatedVotesDropdown';
import { Dialog, DialogTitle, DialogContent, DialogHeader } from '../../Dialog/Dialog';
import classes from './Votes.module.scss';

function VoteDetailsDialog({ isDialogOpen, setIsDialogOpen, voteData }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void; voteData: IUserVote }) {
	return (
		<div>
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogTitle>
					<DialogContent className={classes.voteDetailsDialogContent}>
						<DialogHeader>
							<DialogTitle className={classes.voteDetailsDialogTitle}>
								{!!voteData?.postDetails?.title && (
									<span className='text-base font-medium'>
										{voteData?.postDetails?.title?.slice(0, 50)}
										{voteData?.postDetails?.title?.length > 50 && '...'}
									</span>
								)}
								<Link
									target='_blank'
									href={`https://polkadot.subscan.io/extrinsic/${voteData?.extrinsicIndex}`}
								>
									<Image
										src={ViewSubscanIcon}
										alt='View Subscan'
										width={20}
										height={20}
									/>
								</Link>
							</DialogTitle>
						</DialogHeader>
						<div className='flex w-full justify-end px-3'>
							<DelegatedVotesDropdown
								voteData={{
									...voteData,
									balanceValue: voteData?.balance?.value || BN_ZERO.toString(),
									voterAddress: voteData?.voter || ''
								}}
								voterDelegations={[]}
								inProfile
							/>
						</div>
					</DialogContent>
				</DialogTitle>
			</Dialog>
		</div>
	);
}

export default VoteDetailsDialog;
