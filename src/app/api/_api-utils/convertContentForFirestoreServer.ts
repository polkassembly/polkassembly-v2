// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { OutputData } from '@editorjs/editorjs';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { convertMarkdownToBlocksServer } from '@/app/api/_api-utils/convertMarkdownToBlocksServer';
import { convertHtmlToBlocksServer } from '@/app/api/_api-utils/convertHtmlToBlocksServer';
import { EDITOR_JS_VERSION } from '@/_shared/_constants/editorJsVersion';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { isValidEditorJsBlock } from '@/_shared/_utils/isValidEditorJsBlock';
import { APIError } from './apiError';
import { encodeEditorJsDataForFirestore } from './encodeEditorJsDataForFirestore';

export function convertContentForFirestoreServer(content: string | Record<string, unknown>): OutputData {
	// validation for EditorJS structure
	if (
		typeof content === 'object' &&
		content !== null &&
		'blocks' in content &&
		Array.isArray((content as any).blocks) &&
		'version' in content &&
		'time' in content &&
		(content as any).blocks.every(isValidEditorJsBlock)
	) {
		return content as unknown as OutputData;
	}

	const contentStr = typeof content === 'object' ? JSON.stringify(content) : content;

	let contentBlocks: OutputData['blocks'] = [];

	// If content is Markdown, convert to HTML first
	if (ValidatorService.isMarkdown(contentStr)) {
		contentBlocks = convertMarkdownToBlocksServer(contentStr) as OutputData['blocks'];
	}

	// At this point, content is either HTML or plain text
	if (ValidatorService.isHTML(content as string)) {
		// Convert HTML to EditorJS blocks
		contentBlocks = convertHtmlToBlocksServer(content as string) as OutputData['blocks'];
	}

	if (!contentBlocks.length) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid content');
	}

	const outputData: OutputData = {
		version: EDITOR_JS_VERSION,
		blocks: contentBlocks,
		time: Date.now()
	};

	return encodeEditorJsDataForFirestore(outputData);
}
