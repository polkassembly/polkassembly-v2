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
	DiffSourceToggleWrapper
} from '@mdxeditor/editor';

import { Ellipsis } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { ETheme } from '@/_shared/types';
import classes from './MardownEditor.module.scss';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover';

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const { theme } = useTheme();
	const toolbarContents = () => {
		return (
			<div className='flex items-center gap-x-1 md:gap-x-2'>
				<UndoRedo />
				<BoldItalicUnderlineToggles />
				<div className='hidden items-center gap-x-2 lg:flex'>
					<ListsToggle />
					<CodeToggle />
				</div>
				<BlockTypeSelect />
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
				className={cn(theme === ETheme.DARK ? 'dark-theme' : '', props.className)}
				ref={editorRef}
				onError={(error) => {
					console.error(error);
				}}
			/>
		</div>
	);
}
