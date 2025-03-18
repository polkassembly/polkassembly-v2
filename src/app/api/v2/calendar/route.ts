// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ENetwork, EProposalType, ICalendarEvent, IOffChainPost } from '@/_shared/types';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { OnChainDbService } from '../../_api-services/onchain_db_service';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';

const CHUNK_SIZE = 30;

const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunks.push(arr.slice(i, i + chunkSize));
	}
	return chunks;
};

const updateEventsWithTimeStamps = (events: ICalendarEvent[], blockNo: number) => {
	if (!events?.length) return [];

	return events
		.flatMap((item) =>
			item.statusHistory
				?.filter((status) => status.block >= blockNo)
				?.map((timeline) => ({
					...item,
					blockNo: timeline.block,
					createdAt: timeline.timestamp
				}))
		)
		.sort((a, b) => a.blockNo - b.blockNo);
};

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	try {
		const network = await getNetworkFromHeaders();
		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_NETWORK, StatusCodes.BAD_REQUEST);
		}

		const body = await req.json();
		const { startBlockNo, endBlockNo } = body;

		if (!startBlockNo || !endBlockNo) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Start and end block numbers are required');
		}

		const cachedEvents = await RedisService.GetCalendarData({ network, startBlockNo, endBlockNo });

		if (cachedEvents) {
			return NextResponse.json(JSON.parse(cachedEvents));
		}

		try {
			const onChainEvents = await OnChainDbService.GetCalendarEvents({
				network: network as ENetwork,
				startBlock: startBlockNo,
				endBlock: endBlockNo
			});

			const eventsData = onChainEvents || [];

			if (!eventsData?.length) {
				if (process.env.IS_CACHE_ENABLED === 'true') {
					await RedisService.SetCalendarData({ network, startBlockNo, endBlockNo, data: JSON.stringify([]) });
				}
				return NextResponse.json([]);
			}

			const eventsByProposalType: Record<string, ICalendarEvent[]> = {};
			onChainEvents.forEach((event: ICalendarEvent) => {
				if (!eventsByProposalType[event.type as EProposalType]) {
					eventsByProposalType[event.type as EProposalType] = [];
				}
				eventsByProposalType[event.type as EProposalType].push(event);
			});

			const events: ICalendarEvent[] = [];

			await Promise.all(
				Object.entries(eventsByProposalType).map(async ([proposalType, proposalEvents]) => {
					const chunks = chunkArray(proposalEvents, CHUNK_SIZE);

					await Promise.all(
						chunks.map(async (chunk) => {
							const indexes = chunk.map((item) => item?.index);
							const postsPromises = indexes.map((index) =>
								OffChainDbService.GetOffChainPostData({
									network: network as ENetwork,
									indexOrHash: index.toString(),
									proposalType: proposalType as EProposalType
								})
							);
							const postsData = await Promise.all(postsPromises);

							await Promise.all(
								chunk.map(async (onChainEvent) => {
									const payload: ICalendarEvent = {
										createdAt: onChainEvent?.createdAt,
										index: onChainEvent?.index,
										parentBountyIndex: onChainEvent?.parentBountyIndex,
										proposalType: onChainEvent?.type as EProposalType,
										proposer: onChainEvent?.proposer,
										source: 'polkasembly',
										status: onChainEvent?.status,
										statusHistory: onChainEvent?.statusHistory,
										title: '',
										trackNo: onChainEvent?.trackNo
									};
									const post = postsData.find((p: IOffChainPost) => p.index === onChainEvent.index);

									if (post?.title) {
										payload.title = post.title;
									} else {
										const subsquareData = await OffChainDbService.GetOffChainPostData({
											network: network as ENetwork,
											indexOrHash: onChainEvent.index.toString(),
											proposalType: proposalType as EProposalType
										});

										if (subsquareData?.title) {
											payload.title = subsquareData.title;
											payload.source = 'subsquare';
										}
									}

									if (!payload.title) {
										payload.title = `${proposalType === EProposalType.REFERENDUM_V2 ? 'ReferendumV2' : (proposalType as EProposalType) || ''} Proposal`;
									}

									events.push(payload);
								})
							);
						})
					);
				})
			);

			const eventsWithTimestamps = updateEventsWithTimeStamps(events, startBlockNo);
			await RedisService.SetCalendarData({
				network,
				startBlockNo,
				endBlockNo,
				data: JSON.stringify(eventsWithTimestamps)
			});

			return NextResponse.json(eventsWithTimestamps);
		} catch (onChainError) {
			console.error('onChain Error:', onChainError);
			return NextResponse.json({ error: 'Failed to fetch calendar events', details: onChainError }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
		}
	} catch (error) {
		return NextResponse.json({ error: error instanceof APIError ? error.message : 'Error while fetching calendar events' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
});
