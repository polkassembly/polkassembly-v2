// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, FileText, Info, Clock } from 'lucide-react';

interface DelegationTrackPageProps {
	params: {
		track: string;
	};
}

export default function DelegationTrackPage({ params }: DelegationTrackPageProps) {
	const { track } = params;
	const TrackName = track.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

	// Get track data from our mock data
	const trackData = {
		name: TrackName,
		description: 'Description 1',
		proposals: [
			{
				id: 1,
				title: 'Proposal 1',
				author: {
					verified: true,
					name: 'Author 1'
				}
			}
		]
	};

	// If track doesn't exist, return 404
	if (!trackData) {
		notFound();
	}

	const { name, description, proposals } = trackData;

	return (
		<div className='container mx-auto px-4 py-6'>
			{/* Breadcrumb */}
			<div className='mb-4 flex items-center text-sm text-muted-foreground'>
				<Link
					href='/dashboard'
					className='hover:text-primary'
				>
					Dashboard
				</Link>
				<span className='mx-2'>&gt;</span>
				<span className='text-foreground'>{name}</span>
			</div>

			{/* Track Info Card */}
			<div className='mb-8 w-full shadow-sm'>
				<div className='pb-6 pt-6'>
					<div className='flex items-start gap-3'>
						<div className='rounded-lg bg-secondary p-2'>
							<Info className='h-5 w-5 text-gray-500' />
						</div>
						<div>
							<h1 className='mb-2 text-2xl font-semibold text-foreground'>{name}</h1>
							<p className='text-muted-foreground'>{description}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Active Proposals Section */}
			<div className='mb-6'>
				<div className='active-proposal-header flex items-center justify-between rounded-t-md px-4 py-3'>
					<div className='flex items-center gap-2'>
						<FileText className='h-5 w-5 text-primary' />
						<h2 className='text-lg font-semibold'>Active Proposals</h2>
						<span className='ml-2 rounded-md bg-secondary px-2 py-0.5 text-sm text-muted-foreground'>{proposals.length}</span>
					</div>
					<button className='text-muted-foreground hover:text-foreground'>
						<ChevronDown className='h-5 w-5' />
					</button>
				</div>

				{/* Proposals List */}
				<div className='mt-4 space-y-4'>
					{proposals.map((proposal) => (
						<div
							key={proposal.id}
							className='proposal-card overflow-hidden'
						>
							<Link href={`/referenda/${proposal.id}`}>
								<div className='p-5'>
									<h3 className='mb-2 text-lg font-semibold text-foreground'>
										#{proposal.id} {proposal.title}
									</h3>

									<div className='mt-3 flex items-center gap-4 text-sm text-muted-foreground'>
										<div className='flex items-center gap-1.5'>
											<span className='font-medium'>By:</span>
											<div className='flex items-center'>
												<span className='flex items-center gap-1'>
													{proposal.author.verified && <span className='h-3 w-3 rounded-full bg-green-500'></span>}
													{proposal.author.name}
												</span>
											</div>
										</div>

										<div className='flex items-center gap-1.5'>
											<Clock className='h-4 w-4' />
											{/* <span>{formatTimeAgo(proposal.daysAgo)}</span> */}
										</div>

										<div className='ml-auto flex items-center gap-1.5'>
											<Clock className='h-4 w-4' />
											{/* <span className='text-foreground'>{formatTimeRemaining(proposal.timeRemaining.days, proposal.timeRemaining.hours, proposal.timeRemaining.minutes)}</span> */}
										</div>
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
