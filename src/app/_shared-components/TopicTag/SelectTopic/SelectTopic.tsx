// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { EOffChainPostTopic } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import classes from './SelectTopic.module.scss';
import { Button } from '../../Button';

function SelectTopic({ onChange, disabled }: { onChange: (topic: EOffChainPostTopic) => void; disabled?: boolean }) {
	const t = useTranslations('Create');
	const [selectedTopic, setSelectedTopic] = useState<EOffChainPostTopic>(EOffChainPostTopic.GENERAL);

	return (
		<div className={classes.topicContainer}>
			{Object.values(EOffChainPostTopic).map((topic) => (
				<Button
					disabled={disabled}
					key={topic}
					type='button'
					className={cn(classes.topicButton, selectedTopic === topic ? 'bg-btn_primary_background text-white' : 'bg-selected_topic_bg text-basic_text hover:bg-selected_topic_bg')}
					onClick={() => {
						setSelectedTopic(topic);
						onChange(topic);
					}}
				>
					{t(`Topic.${topic.toLowerCase()}`)}
				</Button>
			))}
		</div>
	);
}

export default SelectTopic;
