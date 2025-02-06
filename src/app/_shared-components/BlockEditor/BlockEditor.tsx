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
import { convertHtmlToEditorJs } from '@/app/_client-utils/convertHtmlToEditorJs';
import { useTranslations } from 'next-intl';
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
	data?: OutputData | string;
	onChange?: (data: OutputData) => void;
	readOnly?: boolean;
	className?: string;
	id?: string;
	renderFromHtml?: boolean;
	ref?: React.RefObject<{ clearEditor: () => void } | null>;
}) {
	const t = useTranslations();
	const containerRef = useRef<HTMLDivElement>(null);
	const [shouldScroll, setShouldScroll] = useState(false);
	const blockEditorRef = useRef<EditorJS | null>(null);

	const { NEXT_PUBLIC_IMBB_KEY } = getSharedEnvVars();

	const blockEditorId = `block-editor-${id}`;

	const clearEditor = async () => {
		try {
			if (blockEditorRef.current?.blocks) {
				await blockEditorRef.current.blocks.clear();
			}
		} catch {
			// TODO: show notification
		}
	};

	useImperativeHandle(ref, () => ({
		clearEditor
	}));

	// Initialize editorjs
	useEffect(() => {
		const initializeEditor = async () => {
			if (!blockEditorRef.current) {
				const editor = new EditorJS({
					readOnly,
					minHeight: 400,
					holder: blockEditorId,
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
										form.append('image', file, file.name);
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
					data: data as OutputData,
					onReady: async () => {
						if (data) {
							try {
								if (renderFromHtml) {
									const htmlString = convertMarkdownToHtml(data as string);
									const editorJsOutputData = convertHtmlToEditorJs(htmlString as string);
									await editor.blocks.render(editorJsOutputData);
								} else {
									await editor.blocks.render(data as OutputData);
								}
							} catch {
								// TODO: show notification
							}
						}
					},
					async onChange(api) {
						if (readOnly) return;
						try {
							const edJsData = await api.saver.save();
							onChange?.(edJsData);
						} catch {
							// TODO: show notification
						}
					},
					placeholder: readOnly ? '' : t('BlockEditor.placeholder')
				});
				blockEditorRef.current = editor;
			}
		};

		initializeEditor();

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

		const observer = new ResizeObserver(checkHeight);
		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const updateContent = async () => {
			try {
				if (blockEditorRef?.current?.blocks && data) {
					await blockEditorRef.current.blocks.clear();
					if (renderFromHtml) {
						const htmlString = convertMarkdownToHtml(data as string);
						const editorJsOutputData = convertHtmlToEditorJs(htmlString as string);
						await blockEditorRef.current.blocks.render(editorJsOutputData);
					} else {
						await blockEditorRef.current.blocks.render(data as OutputData);
					}
				}
			} catch (error) {
				console.error(t('BlockEditor.errorUpdatingContent'), error);
			}
		};

		updateContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderFromHtml]);

	return (
		<div
			ref={containerRef}
			className={cn(
				'relative z-10',
				!readOnly && 'z-20 min-h-[150px] rounded-md border border-border_grey px-4 py-2',
				shouldScroll && 'max-h-[400px] overflow-y-auto',
				classes.blockEditor,
				className
			)}
			id={blockEditorId}
		/>
	);
}

export default memo(BlockEditor);
