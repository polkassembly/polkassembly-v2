// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { convertMarkdownToHtml } from '@/_shared/_utils/convertMarkdownToHtml';
import { convertHtmlToBlocksServer } from './convertHtmlToBlocksServer';

export function convertMarkdownToBlocksServer(markdown: string) {
	const html = convertMarkdownToHtml(markdown);
	return convertHtmlToBlocksServer(html);
}
