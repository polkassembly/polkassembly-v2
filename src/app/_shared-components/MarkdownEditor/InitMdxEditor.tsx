// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@mdxeditor/editor/style.css';

import type { ForwardedRef } from 'react';
import {
	tablePlugin,
	headingsPlugin,
	listsPlugin,
	quotePlugin,
	thematicBreakPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	type MDXEditorMethods,
	type MDXEditorProps,
	toolbarPlugin,
	linkPlugin,
	linkDialogPlugin,
	frontmatterPlugin,
	codeBlockPlugin,
	codeMirrorPlugin,
	UndoRedo,
	ListsToggle,
	CodeToggle,
	BoldItalicUnderlineToggles,
	BlockTypeSelect,
	CreateLink,
	InsertTable,
	diffSourcePlugin,
	DiffSourceToggleWrapper,
	InsertImage,
	imagePlugin
} from '@mdxeditor/editor';

import { Ellipsis } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { ETheme } from '@/_shared/types';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import classes from './MardownEditor.module.scss';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover';

// List of valid HTML tags
const validHtmlTags = [
	'a',
	'abbr',
	'address',
	'area',
	'article',
	'aside',
	'audio',
	'b',
	'base',
	'bdi',
	'bdo',
	'blockquote',
	'body',
	'br',
	'button',
	'canvas',
	'caption',
	'cite',
	'code',
	'col',
	'colgroup',
	'data',
	'datalist',
	'dd',
	'del',
	'details',
	'dfn',
	'dialog',
	'div',
	'dl',
	'dt',
	'em',
	'embed',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'head',
	'header',
	'hgroup',
	'hr',
	'html',
	'i',
	'iframe',
	'img',
	'input',
	'ins',
	'kbd',
	'label',
	'legend',
	'li',
	'link',
	'main',
	'map',
	'mark',
	'meta',
	'meter',
	'nav',
	'noscript',
	'object',
	'ol',
	'optgroup',
	'option',
	'output',
	'p',
	'param',
	'picture',
	'pre',
	'progress',
	'q',
	'rb',
	'rp',
	'rt',
	'rtc',
	'ruby',
	's',
	'samp',
	'script',
	'section',
	'select',
	'slot',
	'small',
	'source',
	'span',
	'strong',
	'style',
	'sub',
	'summary',
	'sup',
	'table',
	'tbody',
	'td',
	'template',
	'textarea',
	'tfoot',
	'th',
	'thead',
	'time',
	'title',
	'tr',
	'track',
	'u',
	'ul',
	'var',
	'video',
	'wbr'
];

// self-closing tags
const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const { theme } = useTheme();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const preprocessMarkdown = (markdown: string): string => {
		// Replace things like <3 with &lt;3 but preserve valid HTML tags
		let inCode = false;
		let result = '';
		let i = 0;

		// Keep track of open tags to handle missing closing tags
		const openTags: string[] = [];

		while (i < markdown.length) {
			// Skip code blocks
			if (markdown.substring(i, i + 3) === '```') {
				inCode = !inCode;
				result += '```';
				i += 3;
			} else if (markdown[`${i}`] === '<' && !inCode) {
				// Handle < character - but only if not in a code block
				if (i + 1 < markdown.length && markdown[i + 1] === '/') {
					// It's a closing tag
					if (i + 2 < markdown.length && /[a-zA-Z]/.test(markdown[i + 2])) {
						// Extract the tag name
						let endOfTag = markdown.indexOf('>', i + 2);
						if (endOfTag === -1) endOfTag = markdown.length;
						const tagName = markdown
							.substring(i + 2, endOfTag)
							.trim()
							.toLowerCase();

						// Check if it's a valid tag name
						if (validHtmlTags.includes(tagName)) {
							// It's a valid closing tag, keep it
							result += '<';

							// Remove this tag from open tags if it exists
							const lastOpenTagIndex = openTags.lastIndexOf(tagName);
							if (lastOpenTagIndex !== -1) {
								openTags.splice(lastOpenTagIndex, 1);
							}
						} else {
							// Not a valid tag, escape it
							result += '&lt;';
						}
					} else {
						// Not a valid closing tag, escape it
						result += '&lt;';
					}
					i += 1;
				} else if (i + 1 < markdown.length && /[a-zA-Z]/.test(markdown[i + 1])) {
					// It's potentially an opening tag
					// Extract the tag name and any attributes
					let endOfTag = markdown.indexOf('>', i + 1);
					let endOfTagName = markdown.indexOf(' ', i + 1);

					if (endOfTag === -1) endOfTag = markdown.length;
					if (endOfTagName === -1 || endOfTagName > endOfTag) endOfTagName = endOfTag;

					const tagName = markdown
						.substring(i + 1, endOfTagName)
						.trim()
						.toLowerCase();

					// Check if it's a valid tag name
					if (validHtmlTags.includes(tagName)) {
						// It's a valid opening tag
						result += '<';

						// Check if it's self-closing (has /> at the end or is a self-closing tag type)
						const isSelfClosing = markdown.substring(endOfTag - 1, endOfTag + 1) === '/>' || selfClosingTags.includes(tagName);

						if (endOfTag > i + 1) {
							const tagContent = markdown.substring(i + 1, endOfTag);
							if (isSelfClosing) {
								// If it's already self-closing or is a self-closing tag type
								// If it doesn't end with /, add it
								if (tagContent.endsWith('/')) {
									result += `${tagContent}>`;
								} else {
									result += `${tagContent} />`;
								}
							} else {
								// For non-self-closing tags, check if there's a matching closing tag
								const closingTagIndex = markdown.indexOf(`</${tagName}>`, endOfTag);
								if (closingTagIndex === -1 && selfClosingTags.includes(tagName)) {
									// No closing tag found and it's a self-closing tag type
									// Convert it to self-closing format
									result += `${tagContent} />`;
								} else {
									// Regular tag or has a closing tag
									result += `${tagContent}>`;
									openTags.push(tagName);
								}
							}
							i = endOfTag + 1;
						} else {
							i += 1;
						}
					} else {
						// Not a valid tag, escape it
						result += '&lt;';
						i += 1;
					}
				} else {
					// Not a valid tag (like <3), escape it
					result += '&lt;';
					i += 1;
				}
			} else {
				// Handle all other characters
				result += markdown[`${i}`];
				i += 1;
			}
		}

		// Add closing tags for any tags that weren't closed properly
		// Process in reverse order (close most recently opened tags first)
		for (let j = openTags.length - 1; j >= 0; j -= 1) {
			// Don't auto-close self-closing tags
			if (!selfClosingTags.includes(openTags[`${j}`])) {
				result += `</${openTags[j]}>`;
			}
		}

		return result;
	};

	// If markdown is provided, preprocess it before rendering
	const markdownProp = props.markdown ? preprocessMarkdown(props.markdown) : props.markdown;

	const toolbarContents = () => {
		return (
			<div className='flex items-center gap-x-1 md:gap-x-2'>
				<UndoRedo />
				<BoldItalicUnderlineToggles />
				<div className='hidden items-center gap-x-2 lg:flex'>
					<ListsToggle />
					<CodeToggle />
				</div>
				<div className='[&_button]:w-[8rem] md:[&_button]:w-[9rem]'>
					<BlockTypeSelect />
				</div>
				<InsertImage />
				<div className='flex-1' />
				<Popover>
					<PopoverTrigger>
						<Ellipsis />
					</PopoverTrigger>
					<PopoverContent className='flex items-center justify-center border-none'>
						<div className='flex items-center gap-x-2'>
							<DiffSourceToggleWrapper>
								<CreateLink />
								<InsertTable />
								<div className='flex items-center gap-x-2 lg:hidden'>
									<ListsToggle />
									<CodeToggle />
								</div>
							</DiffSourceToggleWrapper>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		);
	};

	const { NEXT_PUBLIC_IMBB_KEY } = getSharedEnvVars();

	const imageUploadHandler = async (file: File) => {
		const form = new FormData();
		form.append('image', file, file.name);
		const res = await fetch(`https://api.imgbb.com/1/upload?key=${NEXT_PUBLIC_IMBB_KEY}`, {
			body: form,
			method: 'POST'
		});
		const uploadData = await res.json();
		if (uploadData?.success) {
			return uploadData.data.url;
		}
		return undefined;
	};

	const plugins = [
		headingsPlugin(),
		markdownShortcutPlugin(),
		listsPlugin(),
		quotePlugin(),
		linkPlugin(),
		linkDialogPlugin(),
		tablePlugin(),
		thematicBreakPlugin(),
		frontmatterPlugin(),
		diffSourcePlugin({
			viewMode: 'rich-text'
		}),
		imagePlugin({
			imageUploadHandler
		}),
		codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
		codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'Plain Text', tsx: 'TypeScript', '': 'Unspecified' } })
	];

	if (!props.readOnly) {
		plugins.push(
			toolbarPlugin({
				toolbarClassName: 'toolbar [&_svg]:w-4 [&_svg]:h-4 md:[&_svg]:h-6 md:[&_svg]:w-6',
				toolbarContents
			})
		);
	}

	return (
		<div className={classes.mdxEditorWrapper}>
			<MDXEditor
				plugins={plugins}
				{...props}
				markdown={markdownProp || ''}
				className={cn(theme === ETheme.DARK ? 'dark-theme' : '', props.className)}
				ref={editorRef}
				onError={(error) => {
					console.error(error);
				}}
				onChange={(markdown, editor) => {
					if (markdown && props.onChange) {
						const processed = preprocessMarkdown(markdown);
						props.onChange(processed, editor);
					}
				}}
			/>
		</div>
	);
}
