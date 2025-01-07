// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@ui/Tabs';
import { Separator } from '@ui/Separator';
import { EAssets, IRequestedAssetData } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Image from 'next/image';
import BeneficiaryIcon from '@assets/icons/beneficiary-icon.svg';
import classes from './PostHeader.module.scss';
import Address from '../../Profile/Address/Address';
import CreatedAtTime from '../../CreatedAtTime/CreatedAtTime';
import PostTags from '../PostTags/PostTags';
import StatusTag from '../../StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';

function PostHeader({
	title,
	proposer,
	createdAt,
	tags,
	status,
	requestedAssetData
}: {
	title: string;
	proposer: string;
	createdAt: Date;
	tags?: string[];
	status: string;
	requestedAssetData?: IRequestedAssetData;
}) {
	const network = getCurrentNetwork();
	return (
		<div>
			<div className='mb-4'>
				<div className={classes.requestedWrapper}>
					{requestedAssetData && requestedAssetData.amount && (
						<div className='flex items-center gap-x-2'>
							<span className={classes.requestedText}>Requested:</span>
							<span className={classes.requestedAmount}>
								{formatBnBalance(requestedAssetData.amount, { withUnit: true, numberAfterComma: 2 }, network, requestedAssetData.assetId as EAssets)}
							</span>
							<Separator
								orientation='vertical'
								className='hidden h-4 lg:block'
							/>
						</div>
					)}
					<StatusTag status={status} />
				</div>
				<p className={classes.postTitle}>{title}</p>
				<div className={classes.proposerWrapper}>
					<div className='flex items-center gap-x-2'>
						<Address address={proposer} />
						<Separator
							orientation='vertical'
							className='h-3'
						/>
						<CreatedAtTime createdAt={createdAt} />
						{tags && tags.length > 0 && (
							<>
								<Separator
									orientation='vertical'
									className='h-3'
								/>
								<PostTags tags={tags} />
							</>
						)}
					</div>
					{requestedAssetData && requestedAssetData.beneficiaries && requestedAssetData.beneficiaries.length > 0 && (
						<div className={classes.beneficiaryWrapper}>
							<Separator
								orientation='vertical'
								className='hidden h-3 lg:block'
							/>
							<div className='flex items-center gap-x-1'>
								<Image
									src={BeneficiaryIcon}
									alt='Beneficiary'
									width={14}
									height={14}
								/>
								<span className={classes.beneficiaryText}>Beneficiary:</span>
							</div>
							{requestedAssetData.beneficiaries.slice(0, 2).map((beneficiary) => (
								<div
									key={beneficiary.address}
									className='flex items-center gap-x-1'
								>
									<Address address={beneficiary.address} />
									<span className='text-xs text-wallet_btn_text'>
										({formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2 }, network, requestedAssetData.assetId as EAssets)})
									</span>
								</div>
							))}
							{requestedAssetData.beneficiaries.length > 2 && (
								<Tooltip>
									<TooltipTrigger>
										<span className='text-xs text-wallet_btn_text'>+ {requestedAssetData.beneficiaries.length - 2} more</span>
									</TooltipTrigger>
									<TooltipContent className={classes.beneficiaryTooltipContent}>
										{requestedAssetData.beneficiaries.slice(2).map((beneficiary) => (
											<div
												key={beneficiary.amount}
												className='flex items-center gap-x-1'
											>
												<Address address={beneficiary.address} />
												<span className='text-xs text-wallet_btn_text'>
													({formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2 }, network, requestedAssetData.assetId as EAssets)})
												</span>
											</div>
										))}
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					)}
				</div>
			</div>
			<Tabs defaultValue='description'>
				<TabsList>
					<TabsTrigger value='description'>DESCRIPTION</TabsTrigger>
					<TabsTrigger value='timeline'>TIMELINE</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}

export default PostHeader;
