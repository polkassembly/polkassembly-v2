// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useToast } from '@/hooks/useToast';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ENotificationStatus } from '@/_shared/types';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaCopy } from '@react-icons/all-files/fa/FaCopy';
import { TextQuote } from 'lucide-react';
import { useQuoteCommentText } from '@/hooks/useQuoteCommentText';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '../Button';
import classes from './HighlightMenu.module.scss';

const SELECTION_DELAY = 150;
const MENU_OFFSET_Y = 60;
const MENU_VISUAL_ADJUSTMENT = 40;

interface SelectionData {
	text: string;
	rect: DOMRect | null;
	timestamp: number;
}

function HighlightMenu({ markdownRef }: { markdownRef: React.RefObject<HTMLDivElement | null> }) {
	const t = useTranslations();
	const { toast } = useToast();
	const { user } = useUser();
	const { setQuoteCommentText } = useQuoteCommentText();
	const [selectedText, setSelectedText] = useState('');
	const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
	const [isVisible, setIsVisible] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	// Use debounce for selection processing
	const { debouncedValue: debouncedSelectionTrigger, setValue: setSelectionTrigger } = useDebounce<SelectionData>(
		{
			text: '',
			rect: null,
			timestamp: 0
		},
		SELECTION_DELAY
	);

	const copyToClipboard = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
				toast({
					title: t('PostDetails.HighlightMenu.textCopiedToClipboard'),
					status: ENotificationStatus.SUCCESS
				});
			} catch {
				toast({
					title: t('PostDetails.HighlightMenu.failedToCopyText'),
					status: ENotificationStatus.ERROR
				});
			}
		},
		[toast, t]
	);

	// Process the debounced selection
	useEffect(() => {
		if (!debouncedSelectionTrigger.text || !debouncedSelectionTrigger.rect) {
			setSelectedText('');
			setIsVisible(false);
			return;
		}

		const { text, rect } = debouncedSelectionTrigger;
		const markdown = markdownRef?.current;

		if (markdown && rect) {
			const markdownRect = markdown.getBoundingClientRect();

			// Check if selection is within the markdown area
			if (rect.left >= markdownRect.left && rect.right <= markdownRect.right && rect.top >= markdownRect.top && rect.bottom <= markdownRect.bottom) {
				// Use fixed positioning relative to viewport
				setMenuPosition({
					left: rect.left + rect.width / 2,
					top: rect.top - MENU_OFFSET_Y // Position 60px above the selection
				});

				setSelectedText(text);
				setIsVisible(true);
				return;
			}
		}

		setSelectedText('');
		setIsVisible(false);
	}, [debouncedSelectionTrigger, markdownRef]);

	const handleSelection = useCallback(() => {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			setSelectionTrigger({
				text: '',
				rect: null,
				timestamp: Date.now()
			});
			return;
		}

		const text = selection.toString().trim();

		if (text && text.length > 0) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			setSelectionTrigger({
				text,
				rect,
				timestamp: Date.now()
			});
		} else {
			setSelectionTrigger({
				text: '',
				rect: null,
				timestamp: Date.now()
			});
		}
	}, [setSelectionTrigger]);

	const clearSelection = useCallback(() => {
		setSelectionTrigger({
			text: '',
			rect: null,
			timestamp: Date.now()
		});
		setSelectedText('');
		setIsVisible(false);
	}, [setSelectionTrigger]);

	const shareSelection = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			const twitterText = `"${selectedText}" ${window.location.href}`;
			const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

			window.open(twitterLink, '_blank');
			clearSelection();
		},
		[selectedText, clearSelection]
	);

	const handleCopy = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			copyToClipboard(selectedText || '');
			clearSelection();
		},
		[selectedText, copyToClipboard, clearSelection]
	);

	const handleQuote = useCallback(
		(event: React.MouseEvent) => {
			setQuoteCommentText(selectedText || '');

			if (user) {
				// Scroll to comment form if user is logged in
				event.preventDefault();
				event.stopPropagation();
				const commentForm = document.getElementById('commentForm');
				commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				// Scroll to login prompt if user is not logged in
				const loginPrompt = document.getElementById('commentLoginPrompt');
				loginPrompt?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}

			clearSelection();
		},
		[selectedText, setQuoteCommentText, user, clearSelection]
	);

	useEffect(() => {
		const markdown = markdownRef.current;
		if (!markdown) return undefined;

		// Handle selection change globally
		const handleSelectionChange = () => {
			const selection = window.getSelection();
			if (!selection || selection.toString().trim() === '') {
				clearSelection();
				return;
			}

			// Check if the selection is within our markdown container
			if (selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const container = range.commonAncestorContainer;
				const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

				if (element && markdown.contains(element)) {
					handleSelection();
				} else {
					clearSelection();
				}
			}
		};

		// Handle clicks outside to clear selection
		const handleDocumentClick = (event: MouseEvent) => {
			// Don't clear if clicking on the menu
			if (menuRef.current && menuRef.current.contains(event.target as Node)) {
				return;
			}

			// Don't clear if clicking within markdown (let selectionchange handle it)
			if (markdown.contains(event.target as Node)) {
				return;
			}

			// Clear if clicking completely outside
			clearSelection();
		};

		// Use selectionchange instead of mouseup for better accuracy
		document.addEventListener('selectionchange', handleSelectionChange);
		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
			document.removeEventListener('click', handleDocumentClick);
		};
	}, [markdownRef, handleSelection, clearSelection]);

	if (!isVisible || !selectedText) {
		return null;
	}

	return (
		<div
			ref={menuRef}
			className={classes.container}
			style={{
				left: `${menuPosition.left}px`,
				top: `${menuPosition.top - MENU_VISUAL_ADJUSTMENT}px`,
				transform: 'translateX(-50%)'
			}}
		>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleQuote}
			>
				{user ? (
					<div className='flex cursor-pointer items-center gap-x-1'>
						<TextQuote className='w-3 text-basic_text' />
						<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.quote')}</span>
					</div>
				) : (
					<Link
						href='/login'
						className='flex items-center gap-x-1 hover:no-underline'
					>
						<TextQuote className='w-3 text-basic_text' />
						<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.quote')}</span>
					</Link>
				)}
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={shareSelection}
			>
				<FaTwitter className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.share')}</span>
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleCopy}
			>
				<FaCopy className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.copy')}</span>
			</Button>
		</div>
	);
}

export default HighlightMenu;
