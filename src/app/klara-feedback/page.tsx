// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { Metadata } from 'next';
import KlaraFeedbackForm from './KlaraFeedbackForm';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();

	return getGeneratedContentMetadata({
		description: 'Klara Feedback Form - Share your feedback to help us improve your experience with Klara AI Assistant.',
		imageAlt: 'Polkassembly - Klara Feedback',
		title: 'Klara Feedback - AI-Powered Governance Assistant',
		url: `https://${network}.polkassembly.io/klara-feedback`,
		network
	});
}

interface PageProps {
	searchParams: Promise<{
		userId?: string;
		conversationId?: string;
		messageId?: string;
		dislike?: string;
	}>;
}

async function KlaraFeedbackPage({ searchParams }: PageProps) {
	const params = await searchParams;

	return (
		<KlaraFeedbackForm
			userId={params.userId}
			conversationId={params.conversationId}
			messageId={params.messageId}
			isDislike={params.dislike === 'true'}
		/>
	);
}

export default KlaraFeedbackPage;
