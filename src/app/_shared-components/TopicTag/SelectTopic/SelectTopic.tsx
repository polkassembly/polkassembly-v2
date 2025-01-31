// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { EOffchainPostTopic } from '@/_shared/types';
import classes from './SelectTopic.module.scss';
import { Button } from '../../Button';

function SelectTopic({ onChange, disabled }: { onChange: (topic: EOffchainPostTopic) => void; disabled: boolean }) {
	const [selectedTopic, setSelectedTopic] = useState<EOffchainPostTopic>(EOffchainPostTopic.GENERAL);

	return (
		<div className={classes.topicContainer}>
			{Object.keys(EOffchainPostTopic).map((key: string) => (
				<Button
					disabled={disabled}
					key={key}
					type='button'
					className={`${classes.topicButton} ${selectedTopic === EOffchainPostTopic[key as keyof typeof EOffchainPostTopic] ? 'bg-btn_primary_background text-white' : 'bg-selected_topic_bg text-basic_text hover:bg-selected_topic_bg'}`}
					onClick={() => {
						setSelectedTopic(EOffchainPostTopic[key as keyof typeof EOffchainPostTopic]);
						onChange(EOffchainPostTopic[key as keyof typeof EOffchainPostTopic]);
					}}
				>
					{key?.toLowerCase()?.split('_').join(' ')}
				</Button>
			))}
		</div>
	);
}

export default SelectTopic;
