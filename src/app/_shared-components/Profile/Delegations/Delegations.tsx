// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import DelegationIcon from '@assets/delegation/delegation.svg';
import Image from 'next/image';
import { EDelegationStatus, ITrackDelegationStats } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { BN } from '@polkadot/util';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { useUser } from '@/hooks/useUser';
import classes from './Delegations.module.scss';
import { Skeleton } from '../../Skeleton';
import { MarkdownViewer } from '../../MarkdownViewer/MarkdownViewer';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import DelegateVotingPower from '../../DelegateVotingPower/DelegateVotingPower';
import DelegationStatusCollaps from './DelegationStatusCollaps';

// Define the delegation item type to replace 'any'
interface IDelegationItem {
	address: string;
	status: EDelegationStatus;
	trackId: number;
	activeProposalsCount?: number;
	capital: string;
	votingPower: string;
	balance: string;
	createdAt: Date;
	lockPeriod: number;
}

interface IDelegationData {
	[EDelegationStatus.RECEIVED]: { delegations: { [key: string]: IDelegationItem[] }; count: number };
	[EDelegationStatus.DELEGATED]: { delegations: { [key: string]: IDelegationItem[] }; count: number };
}

const handleVotingPower = ({ lockPeriod, balance }: { lockPeriod: number; balance: string }) => {
	if (lockPeriod) {
		return new BN(balance).mul(new BN(lockPeriod)).toString();
	}
	return new BN(balance).div(new BN('10')).toString();
};

export const getUpdatedDelegationData = (delegationData: ITrackDelegationStats[]) => {
	const updatedDelegationData: IDelegationData = {
		[EDelegationStatus.RECEIVED]: { delegations: {}, count: 0 },
		[EDelegationStatus.DELEGATED]: { delegations: {}, count: 0 }
	};

	delegationData.forEach((delegation) => {
		if (delegation.status === EDelegationStatus.RECEIVED || delegation.status === EDelegationStatus.DELEGATED) {
			const { status } = delegation; // Store in a variable to help TypeScript
			delegation?.delegations?.forEach((d) => {
				if (!updatedDelegationData[`${status}`].delegations[d.address]) {
					updatedDelegationData[`${status}`].delegations[d.address] = [
						{ ...d, status, trackId: delegation.trackId, capital: d.balance, votingPower: handleVotingPower({ lockPeriod: d?.lockPeriod, balance: d.balance }) }
					];
					updatedDelegationData[`${status}`].count += 1;
				} else {
					updatedDelegationData[`${status}`].delegations[d.address].push({
						...d,
						status,
						trackId: delegation.trackId,
						capital: d.balance,
						votingPower: handleVotingPower({ lockPeriod: d?.lockPeriod, balance: d.balance })
					});
				}
			});
		}
	});
	return updatedDelegationData;
};

function Delegations({ addresses }: { addresses: string[] }) {
	const t = useTranslations('Profile');

	const { user } = useUser();

	const getDelegations = async () => {
		if (!addresses) return getUpdatedDelegationData([]);

		const { data: delegationData, error: delegationError } = await NextApiClientService.getDelegateTracks({ address: addresses[0] });

		if (delegationError || !delegationData) {
			throw new ClientError(delegationError?.message || 'Failed to fetch data');
		}

		return getUpdatedDelegationData(delegationData.delegationStats || []);
	};

	const { data: delegationData, isFetching } = useQuery({
		queryKey: ['userDelegationData', addresses[0]],
		queryFn: () => getDelegations(),
		placeholderData: (previousData) => previousData,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const getManifesto = async () => {
		const { data: manifestoData, error: manifestoError } = await NextApiClientService.getPADelegateManifesto({ address: addresses[0] });
		if (manifestoError || !manifestoData) {
			throw new ClientError(manifestoError?.message || 'Failed to fetch data');
		}
		return manifestoData;
	};

	const { data: manifestoData, isFetching: isManifestoFetching } = useQuery({
		queryKey: ['userManifestoData', addresses[0]],
		queryFn: () => getManifesto(),
		placeholderData: (previousData) => previousData,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	return (
		<div className={classes.delegationsCard}>
			{isFetching ? (
				<Skeleton className='h-[100px] w-full' />
			) : (
				<div className={classes.delegationsCardHeader}>
					<div className='flex justify-between'>
						<div className={classes.delegationsCardHeaderTitle}>
							<Image
								src={DelegationIcon}
								alt='Delegation'
								width={20}
								height={20}
							/>
							<p>{t('Delegations.delegation')}</p>
						</div>
						{ValidatorService.isValidNumber(user?.id) && (
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant='ghost'
										className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
									>
										<IoPersonAdd />
										<span>{t('delegate')}</span>
									</Button>
								</DialogTrigger>
								<DialogContent className='max-w-screen-md p-6'>
									<DialogHeader>
										<DialogTitle className='flex items-center gap-x-2'>
											<IoPersonAdd />
											<span>{t('delegate')}</span>
										</DialogTitle>
									</DialogHeader>
									<DelegateVotingPower delegate={{ address: '' }} />
								</DialogContent>
							</Dialog>
						)}
					</div>

					{isManifestoFetching ? (
						<Skeleton className='mt-4 h-[50px] w-full' />
					) : (
						!!manifestoData?.manifesto && (
							<div className='mt-4 max-h-[100px] overflow-y-auto'>
								<div className='text-sm font-semibold'>{t('Delegations.manifesto')}</div>
								<p className='text-sm'>
									<MarkdownViewer markdown={manifestoData?.manifesto || ''} />
								</p>
							</div>
						)
					)}
					<div className={classes.delegationsCardContent}>
						{/* received  delegations */}
						{delegationData?.[EDelegationStatus.RECEIVED] && (
							<DelegationStatusCollaps
								data={delegationData?.[EDelegationStatus.RECEIVED]}
								status={EDelegationStatus.RECEIVED}
							/>
						)}

						{/* delegated  */}
						{delegationData?.[EDelegationStatus.DELEGATED] && (
							<DelegationStatusCollaps
								data={delegationData?.[EDelegationStatus.DELEGATED]}
								status={EDelegationStatus.DELEGATED}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default Delegations;
