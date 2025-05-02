// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable react/no-unstable-nested-components */

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
	diffSourcePlugin,
	imagePlugin,
	directivesPlugin,
	AdmonitionDirectiveDescriptor,
	BoldItalicUnderlineToggles,
	Separator,
	DiffSourceToggleWrapper,
	ConditionalContents,
	CodeToggle,
	ListsToggle,
	BlockTypeSelect,
	InsertImage,
	InsertTable,
	CreateLink,
	InsertThematicBreak,
	StrikeThroughSupSubToggles
} from '@mdxeditor/editor';

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import './MardownEditor.scss';
import { cn } from '@/lib/utils';
import { ETheme } from '@/_shared/types';
import { useTheme } from 'next-themes';

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	// eslint-disable-next-line sonarjs/cognitive-complexity
	const preprocessMarkdown = (markdown: string): string => {
		let inCode = false;
		let result = '';
		let i = 0;

		while (i < markdown.length) {
			// Skip code blocks
			if (markdown.substring(i, i + 3) === '```') {
				inCode = !inCode;
				result += '```';
				i += 3;

				// Preserve the exact newline after code block start/end
				if (i < markdown.length && markdown[i] === '\n') {
					result += '\n';
					i += 1;
				}
			} else if (!inCode && markdown[i] === '<') {
				// Check if it's a potential HTML tag
				const remaining = markdown.substring(i);
				const tagMatch = remaining.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)(.*?)>/);

				if (tagMatch) {
					// Found a valid opening or closing tag
					const fullTag = tagMatch[0];
					const tagName = tagMatch[1];
					const attributes = tagMatch[2];

					// Check if it's a self-closing tag
					if (attributes.endsWith('/')) {
						result += fullTag;
					} else if (fullTag.startsWith('</')) {
						// It's a closing tag
						result += fullTag;
					} else {
						// Check if the tag has a matching closing tag
						const closingTagPattern = new RegExp(`</${tagName}[\\s>]`);
						if (markdown.substring(i + fullTag.length).match(closingTagPattern)) {
							// Has a matching closing tag
							result += fullTag;
						} else {
							// No matching closing tag, make it self-closing
							result += fullTag.replace('>', ' />');
						}
					}
					i += fullTag.length;
				} else {
					// Not a valid tag, escape it
					result += '\\<';
					i += 1;
				}
			} else {
				// Preserve all characters exactly as they are, including whitespace and newlines
				result += markdown[i];
				i += 1;
			}
		}

		return result;
	};

	const { theme } = useTheme();

	const processedMarkdown = props.readOnly ? preprocessMarkdown(props.markdown || '') : props.markdown;

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

	const YoutubeDirectiveDescriptor: any = {
		name: 'youtube',
		type: 'leafDirective',
		testNode(node: any) {
			return node.name === 'youtube';
		},
		attributes: ['id'],
		hasChildren: false,
		// eslint-disable-next-line react/no-unstable-nested-components
		Editor: ({ mdastNode, lexicalNode, parentEditor }: { mdastNode: any; lexicalNode: any; parentEditor: any }) => {
			const videoId = mdastNode.attributes.id || mdastNode.attributes['#'] || Object.values(mdastNode.attributes)[0];

			return (
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
					<button
						type='button'
						onClick={() => {
							parentEditor.update(() => {
								lexicalNode.selectNext();
								lexicalNode.remove();
							});
						}}
					>
						delete
					</button>
					<iframe
						width='560'
						height='315'
						src={`https://www.youtube.com/embed/${videoId}`}
						title='YouTube video player'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
					/>
				</div>
			);
		}
	};

	const plugins = [
		listsPlugin(),
		quotePlugin(),
		headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
		linkPlugin(),
		linkDialogPlugin(),
		imagePlugin({
			imageUploadHandler
		}),
		tablePlugin(),
		thematicBreakPlugin(),
		frontmatterPlugin(),
		codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
		directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] }),
		diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
		markdownShortcutPlugin()
	];

	const toolbarContents = () => {
		if (props.readOnly) {
			return null;
		}
		return (
			<DiffSourceToggleWrapper>
				<ConditionalContents
					options={[
						{
							fallback: () => (
								<>
									<BoldItalicUnderlineToggles />
									<StrikeThroughSupSubToggles options={['Strikethrough']} />
									<CodeToggle />

									<Separator />

									<ListsToggle options={['number', 'bullet']} />

									<Separator />

									<BlockTypeSelect />

									<Separator />

									<CreateLink />
									<InsertImage />

									<Separator />

									<InsertTable />
									<InsertThematicBreak />
								</>
							)
						}
					]}
				/>
			</DiffSourceToggleWrapper>
		);
	};

	if (!props.readOnly) {
		// eslint-disable-next-line react/no-unstable-nested-components
		plugins.push(toolbarPlugin({ toolbarContents, toolbarClassName: 'relative' }));
	}

	return (
		<div className='mdxEditorWrapper w-full'>
			<MDXEditor
				plugins={plugins}
				{...props}
				markdown={processedMarkdown}
				className={cn(theme === ETheme.DARK ? 'dark-theme' : '', props.readOnly && 'p-0', props.className)}
				ref={editorRef}
				onError={(error) => {
					console.error(error);
				}}
			/>
		</div>
	);
}
