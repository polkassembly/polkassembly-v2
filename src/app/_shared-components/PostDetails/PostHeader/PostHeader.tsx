// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@ui/Tabs';
import { Separator } from '@ui/Separator';
import classes from './PostHeader.module.scss';
import Address from '../../Profile/Address/Address';
import CreatedAtTime from '../../CreatedAtTime/CreatedAtTime';
import PostTags from '../PostTags/PostTags';

function PostHeader({ title, proposer, createdAt, tags }: { title: string; proposer: string; createdAt: Date; tags?: string[] }) {
	return (
		<div>
			<div className='mb-4'>
				<p className={classes.postTitle}>{title}</p>
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
