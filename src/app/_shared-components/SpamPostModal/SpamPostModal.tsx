// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EProposalType } from '@/_shared/types';
import SpamGif from '@assets/reactions/spam-gif.gif';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { ValidatorService } from '@/_shared/_services/validator_service';
import classes from './SpamPostModal.module.scss';
import { Button } from '../Button';

function SpamPostModal({ open, setOpen, proposalType }: { open: boolean; setOpen: (open: boolean) => void; proposalType: EProposalType }) {
	const router = useRouter();

	const handleGoBack = () => {
		if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
			router.back();
		} else {
			router.push('/');
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogContent className={classes.dialogContent}>
				<DialogHeader>
					<DialogTitle className={classes.dialogTitle}>Spam Alert</DialogTitle>
				</DialogHeader>
				<div className={classes.contentContainer}>
					<Image
						src={SpamGif}
						alt='spam-post-modal'
						width={180}
						height={180}
					/>
					<span className={classes.messageText}>This {`${ValidatorService.isValidOffChainProposalType(proposalType) ? 'Post' : 'Proposal'}`} is flagged as Spam.</span>
					<div className={classes.buttonContainer}>
						<Button
							variant='secondary'
							onClick={handleGoBack}
						>
							Go Back
						</Button>
						<Button
							onClick={() => {
								setOpen(false);
							}}
						>
							View Anyways
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default SpamPostModal;
