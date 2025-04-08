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

const URL_REGEX =
	/\b(https?:\/\/|www\.)[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/\S*)?\b|\b[a-z0-9]+([-.][a-z0-9]+)*\.(com|org|net|io|gov|edu|co|biz|info|app|dev|xyz|me|tech|online|site|ru|uk|ca|au|de|fr|jp|cn|br|in|nl|es|it)\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

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
	img: 'img',
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
			const matches = children.match(URL_REGEX) || [];

			if (matches.length === 0) {
				return <p {...props}>{children}</p>;
			}

			let remaining = children;
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
						const url = ValidatorService.ensureSecureUrl(match);

						elements.push(
							<a
								key={`link-${index}`}
								href={url}
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

	const setRefs = (node: HTMLDivElement | null) => {
		containerRef.current = node;

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
			{truncate && (
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
