// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import EditorJS, { OutputData, BlockToolConstructable } from '@editorjs/editorjs';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/_shared/_utils/convertMarkdownToHtml';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { convertHtmlToBlocks } from '@/app/_client-utils/convertHtmlToBlocks';
import classes from './BlockEditor.module.scss';

function BlockEditor({
	data,
	onChange,
	readOnly,
	className,
	id,
	renderFromHtml,
	ref
}: {
	data?: Record<string, unknown> | string;
	onChange?: (data: OutputData) => void;
	readOnly?: boolean;
	className?: string;
	id?: string;
	renderFromHtml?: boolean;
	ref?: React.RefObject<{ clearEditor: () => void } | null>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [shouldScroll, setShouldScroll] = useState(false);

	const blockEditorRef = useRef<EditorJS>(null);

	const { NEXT_PUBLIC_IMBB_KEY } = getSharedEnvVars();

	const clearEditor = () => {
		blockEditorRef?.current?.blocks?.clear?.();
	};

	useImperativeHandle(ref, () => ({
		clearEditor
	}));

	// Initialize editorjs
	useEffect(() => {
		// Initialize editorjs if we don't have a reference
		if (!blockEditorRef.current) {
			const editor = new EditorJS({
				readOnly,
				minHeight: 400,
				holder: `block-editor-${id}`,
				inlineToolbar: true,
				tools: {
					header: {
						class: Header as unknown as BlockToolConstructable,
						inlineToolbar: true
					},
					list: {
						class: List as unknown as BlockToolConstructable,
						inlineToolbar: true
					},
					table: {
						class: Table as unknown as BlockToolConstructable,
						inlineToolbar: true
					},
					paragraph: {
						class: Paragraph as BlockToolConstructable,
						inlineToolbar: true
					},
					image: {
						class: Image,
						inlineToolbar: true,
						config: {
							features: {
								caption: false
							},
							uploader: {
								uploadByFile: async (file: File) => {
									const form = new FormData();
									form.append('image', file, `${file.name}`);
									const res = await fetch(`https://api.imgbb.com/1/upload?key=${NEXT_PUBLIC_IMBB_KEY}`, {
										body: form,
										method: 'POST'
									});
									const uploadData = await res.json();
									if (uploadData?.success) {
										return {
											success: 1,
											file: {
												url: uploadData.data.url
											}
										};
									}
									return {
										success: 0
									};
								}
							}
						}
					}
				},
				data: data as unknown as OutputData,
				onReady: async () => {
					if (data) {
						if (renderFromHtml) {
							const htmlString = convertMarkdownToHtml(data as string);

							const blocks = convertHtmlToBlocks(htmlString as string);

							await editor.blocks.render({
								blocks,
								time: Date.now(),
								version: '2.30.7'
							});
						} else {
							await editor.blocks.render(data as unknown as OutputData);
						}
					}
				},
				async onChange(api) {
					if (readOnly) return;

					const edJsData = await api.saver.save();
					// const htmlArr = edjsParser.parse(edJsData);
					onChange?.(edJsData);
					// if (containerRef.current) {
					// api.blocks.getBlockByElement(containerRef.current)?.holder.scrollIntoView();
					// }
				},
				placeholder: 'Type your comment here'
			});
			blockEditorRef.current = editor;
		}

		// Add a return function to handle cleanup
		return () => {
			if (blockEditorRef.current && blockEditorRef.current.destroy) {
				blockEditorRef.current.destroy();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// make div scrollable if content is more than 400px
	useEffect(() => {
		const checkHeight = () => {
			if (containerRef.current) {
				const contentHeight = containerRef.current.getBoundingClientRect().height;
				setShouldScroll(contentHeight >= 400);
			}
		};
		checkHeight();

		// resize observer to check height changes
		const observer = new ResizeObserver(checkHeight);
		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn(
				'relative rounded-md border border-border_grey',
				!readOnly && 'min-h-[150px] px-4 py-2',
				shouldScroll && 'max-h-[400px] overflow-y-auto',
				classes.blockEditor,
				className
			)}
			id={`block-editor-${id}`}
		/>
	);
}

export default memo(BlockEditor);
