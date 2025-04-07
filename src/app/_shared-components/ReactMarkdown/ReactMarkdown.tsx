// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import './ReactMarkdown.scss';
import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdownLib from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';
import { Button } from '../Button';

// Custom components for react-markdown
const markdownComponents: Components = {
	// Basic HTML elements
	div: 'div',
	table: 'table',
	thead: 'thead',
	tbody: 'tbody',
	tr: 'tr',
	td: 'td',
	th: 'th',
	ul: 'ul',
	ol: 'ol',
	li: 'li',
	code: 'code',
	pre: 'pre',
	img: 'img',
	// Custom anchor tag handling for proper external links
	a: ({ href, children, ...props }) => {
		if (href && href.startsWith('http')) {
			return (
				<a
					href={href}
					target='_blank'
					rel='noopener noreferrer'
					{...props}
				>
					{children}
				</a>
			);
		}
		return (
			<a
				href={href}
				{...props}
			>
				{children}
			</a>
		);
	},
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	p: 'p',
	blockquote: 'blockquote',
	hr: 'hr',
	strong: 'strong',
	em: 'em',
	del: 'del',
	s: 's',
	sup: 'sup',
	sub: 'sub',
	mark: 'mark',
	br: 'br',
	span: 'span',
	link: 'a',
	data: 'data'
};

interface ReactMarkdownProps {
	markdown: string;
	className?: string;
	truncate?: boolean;
	showReadMore?: boolean;
}

export const ReactMarkdown = forwardRef<HTMLDivElement, ReactMarkdownProps>((props, ref) => {
	const { markdown, className, truncate, showReadMore = false } = props;
	const [showMore, setShowMore] = useState(false);
	const [isTruncated, setIsTruncated] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const element = containerRef.current;

		const handleResize = () => {
			if (!truncate || !element) return;
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

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Remove event listener on cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
			if (element) {
				resizeObserver.unobserve(element);
			}
		};
	}, [truncate]);

	const handleShowMore = () => {
		setShowMore(true);
	};

	const handleShowLess = () => {
		setShowMore(false);
	};

	const setRefs = (node: HTMLDivElement | null) => {
		containerRef.current = node;

		if (typeof ref === 'function') {
			ref(node);
		} else if (ref) {
			// eslint-disable-next-line no-param-reassign
			ref.current = node;
		}
	};

	return (
		<div className='w-full'>
			<div
				ref={setRefs}
				className={cn('markdown-body', truncate && !showMore ? 'line-clamp-4' : 'line-clamp-none', 'w-full', className)}
			>
				<ReactMarkdownLib
					components={markdownComponents}
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
				>
					{markdown || ''}
				</ReactMarkdownLib>
			</div>

			{truncate &&
				showReadMore &&
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
ReactMarkdown.displayName = 'ReactMarkdown';
