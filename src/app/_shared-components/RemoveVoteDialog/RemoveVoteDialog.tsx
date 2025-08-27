// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { ENotificationStatus } from '@/_shared/types';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog/Dialog';
import SwitchWalletOrAddress from '../SwitchWalletOrAddress/SwitchWalletOrAddress';
import classes from './RemoveVoteDialog.module.scss';
import AddressRelationsPicker from '../AddressRelationsPicker/AddressRelationsPicker';

function RemoveVoteDialog({
	open,
	onOpenChange,
	setLoading,
	isLoading,
	proposalIndex,
	onConfirm
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	setLoading?: (loading: boolean) => void;
	isLoading?: boolean;
	proposalIndex: number;
	onConfirm?: () => void;
}) {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();

	const { userPreferences } = useUserPreferences();

	const { setVaultQrState } = usePolkadotVault();

	const { toast } = useToast();

	const handleRemoveVote = async () => {
		if (!apiService || !userPreferences.wallet || !userPreferences.selectedAccount) return;

		setLoading?.(true);

		await apiService.removeReferendumVote({
			address: userPreferences.selectedAccount.address,
			referendumId: Number(proposalIndex),
			wallet: userPreferences.wallet,
			setVaultQrState,
			onSuccess: () => {
				toast({
					title: t('PostDetails.voteRemovedTitle'),
					description: t('PostDetails.voteRemoved'),
					status: ENotificationStatus.SUCCESS
				});
				setLoading?.(false);
				onConfirm?.();
			},
			onFailed: (errorMessage) => {
				toast({
					title: t('PostDetails.voteRemoveFailedTitle'),
					description: errorMessage || t('PostDetails.voteRemoveFailed'),
					status: ENotificationStatus.ERROR
				});
				setLoading?.(false);
			}
		});
	};

	return (
		<div>
			<Dialog
				open={open}
				onOpenChange={onOpenChange}
			>
				<DialogContent className='max-w-lg p-3 sm:p-6'>
					<DialogHeader>
						<DialogTitle className={classes.title}>{t('PostDetails.removeVote')}</DialogTitle>
					</DialogHeader>

					<div>
						<div className={classes.selectVoterAddressWrapper}>
							<span className={classes.selectVoterAddressTitle}>{t('PostDetails.selectYourVoterAddress')}</span>

							<SwitchWalletOrAddress
								small
								disabled={isLoading}
								customAddressSelector={
									<AddressRelationsPicker
										withBalance
										disabled={isLoading}
										showVotingBalance
									/>
								}
							/>
						</div>
						<p className={classes.removeVoteConfirmation}>{t('PostDetails.removeVoteConfirmation')}</p>
						<div className='mt-6 flex justify-end gap-3'>
							<Button
								variant='outline'
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								{t('PostDetails.cancel')}
							</Button>
							<Button
								onClick={handleRemoveVote}
								isLoading={isLoading}
								disabled={isLoading}
							>
								{t('PostDetails.remove')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default RemoveVoteDialog;
