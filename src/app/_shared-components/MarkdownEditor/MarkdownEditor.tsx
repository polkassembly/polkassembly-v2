// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import dynamic from 'next/dynamic';
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor';
import { cn } from '@/lib/utils';
import { Button } from '../Button';

// This is the only place InitMdxEditor is imported directly.
const Editor = dynamic(() => import('./InitMdxEditor'), {
	ssr: false
});

interface MarkdownEditorProps extends MDXEditorProps {
	truncate?: boolean;
}

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>((props, ref) => {
	const { truncate, ...editorProps } = props;
	const [showMore, setShowMore] = useState(false);
	const [isTruncated, setIsTruncated] = useState(false);
	const editorRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const element = editorRef.current;

		const handleResize = () => {
			if (!truncate || !props.readOnly || !element) return;
			const { scrollHeight, offsetHeight } = element;

			if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
				setIsTruncated(true);
			} else {
				setIsTruncated(false);
			}
		};

		handleResize();

		window.addEventListener('resize', handleResize);

		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});

		if (editorRef.current) {
			resizeObserver.observe(editorRef.current);
		}

		// Remove event listener on cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
			if (element) {
				resizeObserver.unobserve(element);
			}
		};
	}, [props.readOnly, truncate]);

	const handleShowMore = () => {
		setShowMore(true);
	};

	const handleShowLess = () => {
		setShowMore(false);
	};

	return (
		<div className='w-full'>
			<div
				ref={editorRef}
				className={cn(truncate && props.readOnly && !showMore ? 'line-clamp-4' : 'line-clamp-none', 'w-full')}
			>
				<Editor
					{...editorProps}
					markdown={props.markdown || ''}
					editorRef={ref}
					className={cn(!props.readOnly && 'min-h-[200px] rounded-md border border-border_grey', props.className)}
					contentEditableClassName={cn(props.contentEditableClassName)}
				/>
			</div>

			{truncate &&
				props.readOnly &&
				(showMore ? (
					<Button
						onClick={handleShowLess}
						variant='ghost'
						size='sm'
						className='px-0 text-text_pink'
					>
						Show Less
					</Button>
				) : isTruncated ? (
					<Button
						onClick={handleShowMore}
						variant='ghost'
						className='px-0 text-text_pink'
						size='sm'
					>
						Show More
					</Button>
				) : null)}
		</div>
	);
});

// TS complains without the following line
MarkdownEditor.displayName = 'MarkdownEditor';
