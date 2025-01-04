// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { memo, useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import EdJsHTML from 'editorjs-html';
import { blockEditorTableParser } from '@/app/_client-utils/blockEditorTableParser';
import { cn } from '@/lib/utils';

const EDITOR_TOOLS = {
	header: Header,
	paragraph: Paragraph,
	table: Table,
	list: List
};

function BlockEditor({
	data,
	onChange,
	readOnly,
	className,
	id,
	renderFromHtml
}: {
	data?: OutputData | string;
	onChange?: (data: OutputData) => void;
	readOnly?: boolean;
	className?: string;
	id?: string;
	renderFromHtml?: boolean;
}) {
	const ref = useRef<EditorJS>(null);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const edjsParser = EdJsHTML({
		table: blockEditorTableParser
	});

	// Initialize editorjs
	useEffect(() => {
		// Initialize editorjs if we don't have a reference
		if (!ref.current) {
			const editor = new EditorJS({
				readOnly,
				minHeight: 400,
				holder: `block-editor-${id}`,
				tools: EDITOR_TOOLS,
				data: data as OutputData,
				onReady: async () => {
					if (data) {
						if (renderFromHtml) {
							await editor.blocks.renderFromHTML(data as string);
						} else {
							await editor.blocks.render(data as OutputData);
						}
					}
				},
				async onChange(api) {
					if (readOnly) return;

					const edJsData = await api.saver.save();
					// const htmlArr = edjsParser.parse(edJsData);
					onChange?.(edJsData);
				},
				placeholder: 'Type your comment here'
			});
			ref.current = editor;
		}

		// Add a return function to handle cleanup
		return () => {
			if (ref.current && ref.current.destroy) {
				ref.current.destroy();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={cn('max-h-[400px] overflow-y-auto rounded-md border border-border_grey', !readOnly && 'min-h-[150px] px-4 py-2', className)}
			id={`block-editor-${id}`}
		/>
	);
}

export default memo(BlockEditor);
