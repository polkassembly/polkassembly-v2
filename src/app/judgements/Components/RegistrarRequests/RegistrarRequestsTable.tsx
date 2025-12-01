// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { useToast } from '@/hooks/useToast';
import { EJudgementStatus, IJudgementRequest, ENotificationStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { JUDGEMENT_OPTIONS, JudgementValue } from '@/app/_client-utils/identityUtils';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Button } from '@/app/_shared-components/Button';
import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import { SocialLinksDisplay } from '../Overview/IdentityComponents';

function RegistrarRequestsTable() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const { setVaultQrState } = usePolkadotVault();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<'new' | 'past'>('new');
	const [selectedJudgements, setSelectedJudgements] = useState<Record<string, JudgementValue>>({});
	const [submittingId, setSubmittingId] = useState<string | null>(null);

	const { data: requests, isLoading } = useQuery({
		queryKey: ['registrar-requests', user?.defaultAddress],
		queryFn: async () => {
			if (!user?.defaultAddress || !identityService) return [];
			return identityService.getJudgementRequestsForRegistrar(user.defaultAddress);
		},
		enabled: !!user?.defaultAddress && !!identityService
	});

	const filteredRequests =
		requests?.filter((req) => {
			if (filter === 'new') {
				return req.status === EJudgementStatus.REQUESTED || req.status === EJudgementStatus.PENDING;
			}
			return req.status === EJudgementStatus.APPROVED || req.status === EJudgementStatus.REJECTED;
		}) || [];

	const handleJudgementChange = (requestId: string, value: JudgementValue) => {
		setSelectedJudgements((prev) => ({
			...prev,
			[requestId]: value
		}));
	};

	const handleSubmitJudgement = async (request: IJudgementRequest) => {
		const judgement = selectedJudgements[request.id];
		if (!judgement || !userPreferences.wallet || !userPreferences.selectedAccount?.address || !identityService) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet and select an account',
				status: ENotificationStatus.ERROR
			});
			return;
		}

		setSubmittingId(request.id);

		try {
			await identityService.provideJudgement({
				targetAddress: request.address,
				judgement,
				registrarAddress: userPreferences.selectedAccount.address,
				wallet: userPreferences.wallet,
				setVaultQrState,
				selectedAccount: userPreferences.selectedAccount,
				onSuccess: () => {
					toast({
						title: 'Success',
						description: 'Judgement submitted successfully',
						status: ENotificationStatus.SUCCESS
					});
					setSelectedJudgements((prev) => {
						const newState = { ...prev };
						delete newState[request.id];
						return newState;
					});
					queryClient.invalidateQueries({ queryKey: ['registrar-requests', user?.defaultAddress] });
					setSubmittingId(null);
				},
				onFailed: (errorMessage) => {
					toast({
						title: 'Failed',
						description: errorMessage || 'Failed to submit judgement',
						status: ENotificationStatus.ERROR
					});
					setSubmittingId(null);
				}
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'An unexpected error occurred',
				status: ENotificationStatus.ERROR
			});
			setSubmittingId(null);
		}
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-3xl border border-primary_border bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-3xl border border-primary_border bg-bg_modal p-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Button
						variant={filter === 'new' ? 'default' : 'ghost'}
						size='sm'
						onClick={() => setFilter('new')}
						className='gap-2'
					>
						<Clock size={16} />
						New requests
					</Button>
					<Button
						variant={filter === 'past' ? 'default' : 'ghost'}
						size='sm'
						onClick={() => setFilter('past')}
					>
						Past
					</Button>
				</div>
			</div>

			<div className='overflow-x-auto'>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>NAME</TableHeader>
							<TableHeader>SOCIALS</TableHeader>
							<TableHeader>JUDGEMENTS</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredRequests.length === 0 ? (
							<TableRow>
								<td
									colSpan={3}
									className='py-8 text-center text-basic_text'
								>
									No {filter} requests found
								</td>
							</TableRow>
						) : (
							filteredRequests.map((request) => {
								const socials = {
									email: request.email,
									twitter: request.twitter
								};

								return (
									<TableRow key={request.id}>
										<td className='px-6 py-4'>
											<div className='flex flex-col gap-1'>
												<span className='font-semibold text-text_primary'>{request.displayName || 'Unnamed'}</span>
												<Address
													address={request.address}
													iconSize={16}
													textClassName='text-xs text-basic_text'
												/>
											</div>
										</td>
										<td className='px-6 py-4'>
											<SocialLinksDisplay socials={socials} />
										</td>
										<td className='px-6 py-4'>
											{filter === 'new' ? (
												<div className='flex items-center gap-2'>
													<Select
														value={selectedJudgements[request.id] || ''}
														onValueChange={(value) => handleJudgementChange(request.id, value as JudgementValue)}
													>
														<SelectTrigger className='w-48 border-pink-500 text-pink-500'>
															<SelectValue placeholder='Select Judgment' />
														</SelectTrigger>
														<SelectContent>
															{JUDGEMENT_OPTIONS.map((option) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																	className={option.value === 'Erroneous' ? 'text-pink-500' : ''}
																>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{selectedJudgements[request.id] && (
														<Button
															size='sm'
															onClick={() => handleSubmitJudgement(request)}
															disabled={submittingId === request.id}
														>
															{submittingId === request.id ? 'Submitting...' : 'Submit'}
														</Button>
													)}
												</div>
											) : (
												<div className='flex items-center gap-2'>
													<span className='text-sm font-medium text-text_primary'>
														{request.status === EJudgementStatus.APPROVED ? 'Reasonable' : request.status === EJudgementStatus.REJECTED ? 'Erroneous' : request.status}
													</span>
												</div>
											)}
										</td>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default RegistrarRequestsTable;
