// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor';
import { cn } from '@/lib/utils';

// This is the only place InitMdxEditor is imported directly.
const Editor = dynamic(() => import('./InitMdxEditor'), {
	ssr: false
});

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const MarkdownEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => (
	<Editor
		{...props}
		markdown={props.markdown || ''}
		editorRef={ref}
		className={cn(!props.readOnly && 'w-full rounded-md border border-border_grey', props.className)}
	/>
));

// TS complains without the following line
MarkdownEditor.displayName = 'MarkdownEditor';
