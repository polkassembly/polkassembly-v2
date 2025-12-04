// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unstable-nested-components */

'use client';

import '@mdxeditor/editor/style.css';

import type { ForwardedRef, RefObject } from 'react';
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
	CodeToggle,
	ListsToggle,
	BlockTypeSelect,
	InsertTable,
	CreateLink,
	InsertThematicBreak,
	StrikeThroughSupSubToggles,
	ButtonWithTooltip
} from '@mdxeditor/editor';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import './MardownEditor.scss';
import { cn } from '@/lib/utils';
import { ETheme } from '@/_shared/types';
import { useTheme } from 'next-themes';
import { ImagePlus } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useQuoteCommentText } from '@/hooks/useQuoteCommentText';
import { useUser } from '@/hooks/useUser';
import { debounce, throttle } from '@/_shared/_utils/debounceThrottle';
import ImageUploadDialog from './ImageUploadDialog';

const { NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY, NEXT_PUBLIC_IMBB_KEY } = getSharedEnvVars();
const algoliaClient = algoliasearch(NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY);
const MAX_MENTION_SUGGESTIONS = 5;
const RECT_ELLIPSIS_WIDTH = 25;

// Very aggressive debouncing for onChange to prevent constant parent re-renders
const ONCHANGE_DEBOUNCE_DELAY = 500;

// Only import this to the next file
export default function InitializedMDXEditor({ editorRef, ...props }: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const t = useTranslations('Create.UploadImage');
	const [openImageUploadDialog, setOpenImageUploadDialog] = useState(false);
	const { quoteCommentText, setQuoteCommentText } = useQuoteCommentText();
	const { theme } = useTheme();
	const user = useUser();

	// Store the props.onChange callback in a ref to avoid recreating debounced function
	const onChangeRef = useRef(props.onChange);
	useEffect(() => {
		onChangeRef.current = props.onChange;
	}, [props.onChange]);

	// Create debounced onChange handler
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedOnChange = useCallback(
		debounce((markdown: string) => {
			if (onChangeRef.current) {
				onChangeRef.current(markdown, false);
			}
		}, ONCHANGE_DEBOUNCE_DELAY),
		[]
	);

	// Handle quoted text insertion
	useEffect(() => {
		if (!quoteCommentText || !editorRef || typeof editorRef === 'function' || !user) {
			return;
		}

		const editor = editorRef.current;
		if (!editor) {
			return;
		}

		const currentContent = editor.getMarkdown();

		// Format the quoted text - ensure each line starts with >
		const quotedLines = quoteCommentText
			.split('\n')
			.map((line) => `> ${line} \n`)
			.join('\n');

		const quotedText = `\n\n${quotedLines}\n\n`;

		// Append to existing content
		const newContent = currentContent + quotedText;

		// Update the editor
		editor.setMarkdown(newContent);

		// Clear the quote text after using it
		setQuoteCommentText('');

		// Trigger onChange if provided (use debounced version)
		debouncedOnChange(newContent);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quoteCommentText, editorRef, setQuoteCommentText, user, debouncedOnChange]);

	// Memoize expensive markdown preprocessing - only run when markdown changes
	// eslint-disable-next-line sonarjs/cognitive-complexity
	const preprocessMarkdown = useCallback((markdown: string): string => {
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
	}, []);

	const handleMentionSuggestions = useCallback(
		(editor: MDXEditorMethods, textContent: string, cursorPosition: number, currentTheme: string) => {
			const textBeforeCursor = textContent.substring(0, cursorPosition);
			const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

			// Remove any existing suggestion popover
			const existingPopover = document.querySelectorAll('.mention-suggestions');
			existingPopover.forEach((popover) => {
				if (popover) {
					popover.remove();
				}
			});

			// Remove any existing mention items
			const existingMentionItems = document.querySelectorAll('.mention-item');
			existingMentionItems.forEach((item) => {
				const popover = item.closest('.mention-suggestions');
				if (popover) {
					popover.remove();
				}
			});

			if (lastAtSymbol !== -1) {
				const searchText = textBeforeCursor.substring(lastAtSymbol + 1);
				if (searchText.length > 0) {
					const queries = [
						{
							indexName: 'polkassembly_v2_users',
							params: {
								hitsPerPage: MAX_MENTION_SUGGESTIONS,
								restrictSearchableAttributes: ['username']
							},
							query: searchText
						}
					];

					// Using any type for algolia response as the types don't match the actual structure
					algoliaClient.search(queries as any).then((response: any) => {
						const userHits = response.results[0]?.hits || [];

						const usernameResults = userHits.map((user: Record<string, any>) => ({
							text: `@${user.username}`,
							value: `[@${user.username}](${typeof window !== 'undefined' ? window.location.origin : ''}/user/${user.username})&nbsp;`
						}));

						const addressResults = userHits.flatMap((user: Record<string, any>) =>
							(user.addresses || []).map((address: string) => ({
								text: `@${address}`,
								value: `[@${address}](${typeof window !== 'undefined' ? window.location.origin : ''}/user/address/${address})&nbsp;`
							}))
						);

						const suggestions = [...usernameResults, ...addressResults];
						if (suggestions.length > 0) {
							// Show suggestions in a popover
							const popover = document.createElement('div');
							popover.className = 'mention-suggestions';
							popover.style.position = 'absolute';
							popover.style.backgroundColor = currentTheme === 'dark' ? '#1C1D1F' : '#F5F6F8';
							popover.style.border = `1px solid ${currentTheme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0'}`;
							popover.style.borderRadius = '4px';
							popover.style.fontSize = '14px';
							popover.style.fontWeight = '500';
							popover.style.zIndex = '1000';
							popover.style.width = '250px';
							popover.style.maxHeight = '200px';
							popover.style.overflowY = 'auto';
							popover.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

							suggestions.forEach((suggestion) => {
								const item = document.createElement('div');
								item.className = 'mention-item truncate';
								item.style.padding = '8px 12px';
								item.style.cursor = 'pointer';
								item.style.color = currentTheme === 'dark' ? '#ffffff' : 'var(--lightBlue)';
								item.style.transition = 'background-color 0.2s';
								item.textContent = suggestion.text;

								item.addEventListener('mouseover', () => {
									item.style.backgroundColor = currentTheme === 'dark' ? '#2a2a2a' : '#f3f4f6';
								});

								item.addEventListener('mouseout', () => {
									item.style.backgroundColor = 'transparent';
								});

								item.onclick = () => {
									// Get the current markdown content
									const currentContent = editor.getMarkdown();

									// Find the last @ symbol in the content
									const lastIndex = currentContent.lastIndexOf('@');
									if (lastIndex === -1) return;

									// Find the end of the @ mention (space or end of string)
									const endIndex = currentContent.indexOf(' ', lastIndex);
									const mentionEnd = endIndex === -1 ? currentContent.length : endIndex;

									// Add a space after the suggestion if there isn't one already
									const needsSpace = mentionEnd < currentContent.length && currentContent[`${mentionEnd}`] !== ' ';
									const spaceToAdd = needsSpace ? ' ' : '';

									// Replace the @mention with the suggestion
									const newContent = currentContent.substring(0, lastIndex) + suggestion.value + spaceToAdd + currentContent.substring(mentionEnd);

									// Update the editor content
									editor.setMarkdown(newContent);
									editor.focus();

									// Use debounced onChange
									debouncedOnChange(newContent);

									// Remove the popover
									popover.remove();
								};
								popover.appendChild(item);
							});

							// Position the popover relative to the cursor
							const selection = window.getSelection();
							if (selection && selection.rangeCount > 0) {
								const range = selection.getRangeAt(0);
								const rect = range.getBoundingClientRect();
								popover.style.top = `${rect.bottom + window.scrollY + RECT_ELLIPSIS_WIDTH}px`;
								popover.style.left = `${rect.left + window.scrollX + RECT_ELLIPSIS_WIDTH}px`;

								// Add click outside handler
								const handleClickOutside = (e: MouseEvent) => {
									if (!popover.contains(e.target as Node)) {
										popover.remove();
										document.removeEventListener('click', handleClickOutside);
									}
								};

								document.addEventListener('click', handleClickOutside);
								document.body.appendChild(popover);
							}
						}
					});
				}
			}
		},
		[debouncedOnChange]
	);

	// Throttled version of the entire handleChange to prevent excessive processing
	// This is the key optimization - we don't process every single keystroke
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const throttledHandleChange = useMemo(
		() =>
			throttle((newMarkdown: string) => {
				// Call the debounced onChange
				debouncedOnChange(newMarkdown);

				// Only check for mentions if @ symbol exists and we're not in read-only mode
				if (!props.readOnly && newMarkdown.includes('@')) {
					const editor = (editorRef as RefObject<MDXEditorMethods>)?.current;
					if (!editor) return;

					// Get the current selection from the editor
					const selection = window.getSelection();
					if (!selection || !selection.rangeCount) return;

					const range = selection.getRangeAt(0);
					const container = range.startContainer;

					// Only process if we're in a text node
					if (container.nodeType !== Node.TEXT_NODE) return;

					const textContent = container.textContent || '';
					const cursorPosition = range.startOffset;

					// Check if user is typing @ for mentions
					const textBeforeCursor = textContent.substring(0, cursorPosition);
					const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

					// Only trigger mention suggestions if @ was recently typed (within 30 chars)
					if (lastAtSymbol !== -1 && cursorPosition - lastAtSymbol < 30) {
						handleMentionSuggestions(editor, textContent, cursorPosition, theme as string);
					}
				}
			}, 200), // Throttle the entire onChange to once every 200ms
		[debouncedOnChange, editorRef, handleMentionSuggestions, theme, props.readOnly]
	);

	// Simplified handleChange - just call the throttled version
	const handleChange = useCallback(
		(newMarkdown: string) => {
			throttledHandleChange(newMarkdown);
		},
		[throttledHandleChange]
	);

	// Memoize processed markdown to avoid re-processing on every render
	const processedMarkdown = useMemo(() => (props.readOnly ? preprocessMarkdown(props.markdown || '') : props.markdown), [props.readOnly, props.markdown, preprocessMarkdown]);

	const imageUploadHandler = useCallback(async (file: File) => {
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
	}, []);

	// Memoize YouTube directive to prevent recreation on every render
	// OPTIMIZATION: Lazy load YouTube iframes for better performance
	const YoutubeDirectiveDescriptor: any = useMemo(
		() => ({
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
							loading='lazy' // Lazy load iframe for performance
						/>
					</div>
				);
			}
		}),
		[]
	);

	// Memoize plugins array - prevents recreation on every render
	// OPTIMIZATION: Only load plugins needed for the current mode
	const plugins = useMemo(() => {
		// Essential plugins - always needed for rendering
		const essentialPlugins = [
			listsPlugin(),
			quotePlugin(),
			headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
			linkPlugin(),
			imagePlugin({
				disableImageSettingsButton: true,
				imageUploadHandler // Pass the upload handler to imagePlugin
			}),
			codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
			directivesPlugin({ directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor] })
		];

		// Editing plugins - only needed in edit mode
		if (!props.readOnly) {
			return [
				...essentialPlugins,
				linkDialogPlugin(), // Link editing
				tablePlugin(), // Table editing
				thematicBreakPlugin(), // HR insertion
				frontmatterPlugin(), // Frontmatter editing
				diffSourcePlugin({ viewMode: 'rich-text' }), // Source toggle
				markdownShortcutPlugin() // Keyboard shortcuts
			];
		}

		// Readonly mode - minimal plugins for display only
		return essentialPlugins;
	}, [YoutubeDirectiveDescriptor, props.readOnly, imageUploadHandler]);

	// Memoize toolbar to prevent recreation on every render
	const toolbarContents = useCallback(() => {
		if (props.readOnly) {
			return null;
		}
		return (
			<DiffSourceToggleWrapper>
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
					<ButtonWithTooltip
						onClick={() => {
							setOpenImageUploadDialog(true);
						}}
						title={t('insertImage')}
					>
						<ImagePlus className='h-5 w-5' />
					</ButtonWithTooltip>

					<Separator />

					<InsertTable />
					<InsertThematicBreak />
				</>
			</DiffSourceToggleWrapper>
		);
	}, [props.readOnly, t, setOpenImageUploadDialog]);

	// Conditionally add toolbar plugin - only in edit mode
	const pluginsWithToolbar = useMemo(() => {
		if (props.readOnly) {
			return plugins;
		}
		return [...plugins, toolbarPlugin({ toolbarContents, toolbarClassName: 'relative' })];
	}, [plugins, props.readOnly, toolbarContents]);

	return (
		<div className='mdxEditorWrapper w-full'>
			<ImageUploadDialog
				editorRef={editorRef as RefObject<MDXEditorMethods>}
				imageUploadHandler={imageUploadHandler}
				isDialogOpen={openImageUploadDialog}
				setIsDialogOpen={setOpenImageUploadDialog}
			/>
			<MDXEditor
				plugins={pluginsWithToolbar}
				{...props}
				markdown={processedMarkdown}
				className={cn(theme === ETheme.DARK ? 'dark-theme' : '', props.readOnly && 'p-0', props.className)}
				ref={editorRef}
				onChange={handleChange}
				onError={(error) => {
					console.error(error);
				}}
			/>
		</div>
	);
}
