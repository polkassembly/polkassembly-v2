// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@ui/Tabs';
import classes from './PostHeader.module.scss';

function PostHeader({ title }: { title: string }) {
	return (
		<div>
			<p className={classes.postTitle}>{title}</p>
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
