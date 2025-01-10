// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import userIcon from '@assets/profile/user-icon.svg';
import styles from './CommentInput.module.scss';

const CONSTANTS = {
	COMMENT_PLACEHOLDER: 'Type your comment here',
	POST_LABEL: 'Post',
	ANIMATION_DURATION: 1500
};

function CommentInput({ inputRef }: { inputRef: React.RefObject<HTMLInputElement> }) {
	return (
		<div className='flex items-center'>
			<Image
				src={userIcon}
				alt='User Icon'
				className='h-7 w-7 rounded-full'
				width={32}
				height={32}
			/>
			<div
				ref={inputRef}
				className={styles.commentInputContainer}
			>
				<span className={styles.commentPlaceholder}>{CONSTANTS.COMMENT_PLACEHOLDER}</span>
			</div>
			<button
				type='button'
				className={styles.postButton}
			>
				<span className={styles.postLabel}>{CONSTANTS.POST_LABEL}</span>
			</button>
		</div>
	);
}

export default CommentInput;
