// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OutputData } from '@editorjs/editorjs';
import { htmlToMarkdown } from './htmlToMarkdown';
import { editorJsToHtml } from './editorJsToHtml';

export function htmlAndMarkdownFromEditorJs(data: OutputData) {
	const html = editorJsToHtml(data);
	const markdown = htmlToMarkdown(html);
	return { html, markdown };
}
