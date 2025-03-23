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

import classes from './MardownEditor.module.scss';

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const toolbarContents = () => {
		return (
			<>
				<BoldItalicUnderlineToggles />
				<ListsToggle />
				<CodeToggle />
				<BlockTypeSelect />
				<CreateLink />
				<InsertTable />
				<DiffSourceToggleWrapper>
					<UndoRedo />
				</DiffSourceToggleWrapper>
			</>
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
				toolbarClassName: 'toolbar',
				toolbarContents
			})
		);
	}

	return (
		<div className={classes.mdxEditorWrapper}>
			<MDXEditor
				plugins={plugins}
				{...props}
				ref={editorRef}
				onError={(error) => {
					console.error(error);
				}}
			/>
		</div>
	);
}
