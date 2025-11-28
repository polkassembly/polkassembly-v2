// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { KLARA_API_BASE_URL, KLARA_AI_TOKEN } from '@/app/api/_api-constants/apiEnvVars';

export async function GET() {
	const apiUrl = KLARA_API_BASE_URL;
	const apiToken = KLARA_AI_TOKEN;

	console.log('🧪 API Test Starting...');
	console.log('Environment Check:');
	console.log(`- KLARA_API_BASE_URL: ${apiUrl || 'NOT SET'}`);
	// eslint-disable-next-line sonarjs/no-nested-template-literals
	console.log(`- KLARA_AI_TOKEN: ${apiToken ? `SET (length: ${apiToken.length})` : 'NOT SET'}`);

	if (!apiUrl || !apiToken) {
		return NextResponse.json({
			success: false,
			error: 'API URL or token not configured',
			details: {
				hasUrl: !!apiUrl,
				hasToken: !!apiToken,
				url: apiUrl
			}
		});
	}

	const testPayload = {
		question: 'What is Polkadot?',
		user_id: 'test_user',
		client_ip: '127.0.0.1',
		max_chunks: 3,
		include_sources: true,
		conversation_history: []
	};

	console.log(`📤 Testing API call to: ${apiUrl}`);
	console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));

	try {
		const startTime = Date.now();

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
				'User-Agent': 'Polkassembly-Klara-Test/1.0',
				Accept: 'application/json'
			},
			body: JSON.stringify(testPayload)
		});

		const responseTime = Date.now() - startTime;
		console.log(`📥 Response received in ${responseTime}ms`);
		console.log(`📥 Status: ${response.status} ${response.statusText}`);
		console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));

		const responseText = await response.text();
		console.log(`📥 Raw response: ${responseText}`);

		let parsedResponse;
		try {
			parsedResponse = JSON.parse(responseText);
		} catch (parseError) {
			console.error('❌ JSON parse error:', parseError);
			return NextResponse.json({
				success: false,
				error: 'Invalid JSON response',
				details: {
					status: response.status,
					statusText: response.statusText,
					headers: Object.fromEntries(response.headers.entries()),
					rawResponse: responseText.substring(0, 1000),
					responseTime
				}
			});
		}

		return NextResponse.json({
			success: response.ok,
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
			response: parsedResponse,
			responseTime,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('❌ API test failed:', error);

		return NextResponse.json({
			success: false,
			error: 'Network/connection error',
			details: {
				errorName: error instanceof Error ? error.name : 'Unknown',
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
				apiUrl,
				hasToken: !!apiToken
			}
		});
	}
}
