// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/app/api/_api-services/klara/chatService';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const POST = withErrorHandling(async (request: NextRequest) => {
	const { text, sources, followUpQuestions, isNewConversation, conversationId } = await ChatService.processMessage(request);
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			// Send conversation ID first if this is a new conversation
			if (isNewConversation && conversationId) {
				const conversationData = JSON.stringify({ conversationId });
				controller.enqueue(encoder.encode(`data: ${conversationData}\n\n`));
			}

			// Simulate token-by-token streaming like ChatGPT
			const words = text.split(' ');

			await words.reduce(
				(promise, word, i) =>
					promise.then(() => {
						const chunk = i === 0 ? word : ` ${word}`;
						const data = JSON.stringify({ content: chunk });
						controller.enqueue(encoder.encode(`data: ${data}\n\n`));
						return new Promise((resolve) => {
							setTimeout(resolve, 50 + Math.random() * 100);
						});
					}),
				Promise.resolve()
			);

			// Send sources if available
			if (sources && sources.length > 0) {
				const sourcesData = JSON.stringify({ sources });
				controller.enqueue(encoder.encode(`data: ${sourcesData}\n\n`));
			}

			// Send follow-up questions if available
			if (followUpQuestions && followUpQuestions.length > 0) {
				const followUpData = JSON.stringify({ followUpQuestions });
				controller.enqueue(encoder.encode(`data: ${followUpData}\n\n`));
			}

			// Send completion signal
			controller.enqueue(encoder.encode('data: [DONE]\n\n'));
			controller.close();
		}
	});
	return new NextResponse(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
});
