// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import './MarkdownViewer.scss';
import { useState, forwardRef, useRef, ReactNode } from 'react';
import ReactMarkdownLib from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Image from 'next/image';

const extractUrlsAndEmails = (text: string): string[] => {
	const words = text.split(/\s+/);

	return words.filter((word) => {
		const cleanWord = word.replace(/[.,;:!?]$/, '');
		return ValidatorService.isUrl(cleanWord) || ValidatorService.isValidEmail(cleanWord);
	});
};

const markdownComponents: Components = {
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
	img: ({ src, alt, ...props }) => {
		if (!src) {
			return null;
		}

		return (
			<Image
				src={src}
				alt={alt || 'Image'}
				className={props.className}
				width={Number(props.width || 256)}
				height={Number(props.height || 256)}
				style={props.style}
				onClick={() => {
					window.open(src, '_blank');
				}}
			/>
		);
	},
	a: ({ href, children, ...props }) => {
		return (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-text_pink hover:underline'
				{...props}
			>
				{children}
			</a>
		);
	},
	p: ({ children, ...props }) => {
		if (typeof children === 'string') {
			const textContent = children;
			const matches = extractUrlsAndEmails(textContent);

			if (matches.length === 0) {
				return <p {...props}>{children}</p>;
			}

			let remaining = textContent;
			const elements: ReactNode[] = [];
			let index = 0;

			matches.forEach((match) => {
				const position = remaining.indexOf(match);
				if (position !== -1) {
					if (position > 0) {
						elements.push(<span key={`text-${index}`}>{remaining.substring(0, position)}</span>);
						index += 1;
					}

					if (ValidatorService.isUrl(match)) {
						elements.push(
							<a
								key={`link-${index}`}
								href={match}
								target='_blank'
								rel='noopener noreferrer'
								className='text-text_pink hover:underline'
							>
								{match}
							</a>
						);
					} else if (ValidatorService.isValidEmail(match)) {
						elements.push(
							<a
								key={`email-${index}`}
								href={`mailto:${match}`}
								target='_blank'
								rel='noopener noreferrer'
								className='text-text_pink hover:underline'
							>
								{match}
							</a>
						);
					} else {
						elements.push(<span key={`text-${index}`}>{match}</span>);
					}

					index += 1;

					remaining = remaining.substring(position + match.length);
				}
			});

			if (remaining) {
				elements.push(<span key={`text-${index}`}>{remaining}</span>);
			}

			return <p {...props}>{elements}</p>;
		}

		return <p {...props}>{children}</p>;
	},
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
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
	maxLines?: number;
}

export const MarkdownViewer = forwardRef<HTMLDivElement, ReactMarkdownProps>((props, ref) => {
	const { markdown, className, truncate = false, maxLines = 4 } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const [showMore, setShowMore] = useState(!truncate);
	const [contentExceedsMaxLines, setContentExceedsMaxLines] = useState(false);

	const setRefs = (node: HTMLDivElement | null) => {
		containerRef.current = node;

		if (node && truncate) {
			const style = window.getComputedStyle(node);
			const lineHeight = parseInt(style.lineHeight, 10) || 20;
			const containerHeight = node.scrollHeight;
			const lines = Math.floor(containerHeight / lineHeight);
			setContentExceedsMaxLines(lines > maxLines);
		}

		if (typeof ref === 'function') {
			ref(node);
		} else if (ref) {
			// eslint-disable-next-line no-param-reassign
			ref.current = node;
		}
	};

	const toggleShowMore = () => {
		setShowMore(!showMore);
	};

	return (
		<div className='w-full'>
			<div
				ref={setRefs}
				className={cn('markdown-body', truncate && !showMore ? `line-clamp-${maxLines}` : 'line-clamp-none', 'w-full', className)}
			>
				<ReactMarkdownLib
					components={markdownComponents}
					remarkPlugins={[remarkGfm, remarkBreaks]}
					rehypePlugins={[rehypeRaw]}
				>
					{markdown || ''}
				</ReactMarkdownLib>
			</div>
			{truncate && contentExceedsMaxLines && (
				<button
					type='button'
					onClick={toggleShowMore}
					className='mt-2 cursor-pointer text-sm font-medium text-text_pink hover:underline'
				>
					{showMore ? 'Show Less' : 'Show More'}
				</button>
			)}
		</div>
	);
});
