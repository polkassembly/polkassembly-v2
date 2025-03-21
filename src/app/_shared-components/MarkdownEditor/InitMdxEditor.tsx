// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

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
	UndoRedo,
	BoldItalicUnderlineToggles,
	toolbarPlugin,
	ListsToggle,
	BlockTypeSelect,
	CodeToggle,
	CreateLink,
	// InsertImage,
	InsertTable,
	linkPlugin
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';
import { cn } from '@/lib/utils';

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const toolbarContents = () => {
		if (props.readOnly) return null;

		return (
			<>
				<UndoRedo />
				<BoldItalicUnderlineToggles />
				<ListsToggle />
				<BlockTypeSelect />
				<CodeToggle />
				<CreateLink />
				{/* <InsertImage /> */}
				<InsertTable />
			</>
		);
	};

	return (
		<MDXEditor
			plugins={[
				// Example Plugin Usage
				headingsPlugin(),
				linkPlugin(),
				listsPlugin(),
				tablePlugin(),
				quotePlugin(),
				thematicBreakPlugin(),
				markdownShortcutPlugin(),
				toolbarPlugin({
					toolbarClassName: cn(props.readOnly && 'p-0'),
					toolbarContents
				})
			]}
			{...props}
			ref={editorRef}
		/>
	);
}
