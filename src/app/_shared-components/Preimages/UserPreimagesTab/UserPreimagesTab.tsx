// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useEffect } from 'react';
import { IGenericListingResponse, IPreimage } from '@/_shared/types';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useUser } from '@/hooks/useUser';
import { useSearchParams } from 'next/navigation';
import { Button } from '@ui/Button';
import Link from 'next/link';
import ListingTable from '../ListingTable/ListingTable';
import NoUserPreimage from '../ListingTable/NoUserPreimage';

function UserPreimagesTab() {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams?.get('page') || '1', 10);
	const { user } = useUser();

	const [userPreimagesData, setUserPreimagesData] = useState<IGenericListingResponse<IPreimage> | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch user preimages when component mounts or dependencies change
	useEffect(() => {
		const fetchUserPreimages = async () => {
			if (!user?.addresses?.length) {
				setUserPreimagesData(null);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				const { data, error: fetchError } = await NextApiClientService.fetchUserPreimages({
					page,
					addresses: user.addresses
				});
				if (fetchError || !data) {
					throw new ClientError(ERROR_CODES.CLIENT_ERROR, fetchError?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
				}
				setUserPreimagesData(data);
			} catch (err) {
				console.error('Failed to fetch user preimages:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch user preimages');
				setUserPreimagesData({ items: [], totalCount: 0 });
			} finally {
				setLoading(false);
			}
		};

		fetchUserPreimages();
	}, [user?.addresses, page]);

	// Show loading state
	if (loading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-bg_pink border-t-transparent' />
					<p className='text-bg_pink'>Loading your preimages...</p>
				</div>
			</div>
		);
	}

	// Show not authenticated message
	if (!user?.addresses?.length) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<p className='text-text_secondary mb-4'>
						Please{' '}
						<Link
							href='/login'
							className='text-bg_pink'
						>
							log in
						</Link>{' '}
						to view your preimages
					</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center text-red-500'>
					<p>Error: {error}</p>
					<Button
						variant='ghost'
						onClick={() => window.location.reload()}
						className='mt-2 text-sm underline hover:no-underline'
					>
						Try again
					</Button>
				</div>
			</div>
		);
	}

	// Show no preimages state
	if (!userPreimagesData?.items?.length) {
		return <NoUserPreimage />;
	}

	// Show preimages table
	return (
		<ListingTable
			data={userPreimagesData.items}
			totalCount={userPreimagesData.totalCount}
		/>
	);
}

export default UserPreimagesTab;
