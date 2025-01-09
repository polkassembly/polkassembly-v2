// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { convertMarkdownToHtml } from '@/_shared/_utils/convertMarkdownToHtml';
import { OutputData } from '@editorjs/editorjs';
import { convertHtmlToEditorJsServer } from './convertHtmlToEditorJsServer';

export function convertMarkdownToEditorJsServer(markdown: string): OutputData {
	const html = convertMarkdownToHtml(markdown);
	return convertHtmlToEditorJsServer(html);
}
