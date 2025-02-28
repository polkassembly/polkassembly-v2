// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { SubsquidService } from '@/app/api/_api-services/onchain_db_service/subsquid_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ENetwork, EProposalType, ICalendarEvent, IOffChainPost } from '@/_shared/types';
import { RedisService } from '@/app/api/_api-services/redis_service';

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

export async function POST(req: NextRequest) {
	try {
		const network = req.headers.get('x-network');
		if (!network) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Network is required');
		}

		const body = await req.json();
		const { startBlockNo, endBlockNo } = body;

		if (!startBlockNo || !endBlockNo) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Start and end block numbers are required');
		}

		// Check Redis cache first
		const cachedEvents = await RedisService.GetCalendarData({ network, startBlockNo, endBlockNo });

		if (cachedEvents) {
			return Response.json(JSON.parse(cachedEvents));
		}

		// If not in cache, fetch events from Subsquid
		try {
			const subsquidEvents = await SubsquidService.GetCalendarEvents({
				network: network as ENetwork,
				startBlock: startBlockNo,
				endBlock: endBlockNo
			});

			const eventsData = subsquidEvents || [];

			if (!eventsData?.length) {
				if (process.env.IS_CACHE_ENABLED === 'true') {
					await RedisService.SetCalendarData({ network, startBlockNo, endBlockNo, data: JSON.stringify([]) });
				}
				return Response.json([]);
			}

			// Group events by proposal type
			const eventsByProposalType: Record<string, ICalendarEvent[]> = {};
			subsquidEvents.forEach((event: ICalendarEvent) => {
				if (!eventsByProposalType[event.type as EProposalType]) {
					eventsByProposalType[event.type as EProposalType] = [];
				}
				eventsByProposalType[event.type as EProposalType].push(event);
			});

			const events: ICalendarEvent[] = [];

			// Process each proposal type
			await Promise.all(
				Object.entries(eventsByProposalType).map(async ([proposalType, proposalEvents]) => {
					const chunks = chunkArray(proposalEvents, CHUNK_SIZE);

					await Promise.all(
						chunks.map(async (chunk) => {
							const indexes = chunk.map((item) => item?.index);

							// Get posts from offchain database
							const postsPromises = indexes.map((index) =>
								OffChainDbService.GetOffChainPostData({
									network: network as ENetwork,
									indexOrHash: index.toString(),
									proposalType: proposalType as EProposalType
								})
							);
							const postsData = await Promise.all(postsPromises);

							await Promise.all(
								chunk.map(async (subsquidEvent) => {
									const payload: ICalendarEvent = {
										createdAt: subsquidEvent?.createdAt,
										index: subsquidEvent?.index,
										parentBountyIndex: subsquidEvent?.parentBountyIndex,
										proposalType: subsquidEvent?.type as EProposalType,
										proposer: subsquidEvent?.proposer,
										source: 'polkasembly',
										status: subsquidEvent?.status,
										statusHistory: subsquidEvent?.statusHistory,
										title: '',
										trackNo: subsquidEvent?.trackNo
									};

									// Find matching post
									const post = postsData.find((p: IOffChainPost) => p.index === subsquidEvent.index);

									if (post?.title) {
										payload.title = post.title;
									} else {
										// Try getting title from Subsquare
										const subsquareData = await OffChainDbService.GetOffChainPostData({
											network: network as ENetwork,
											indexOrHash: subsquidEvent.index.toString(),
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

			// Cache the results
			await RedisService.SetCalendarData({
				network,
				startBlockNo,
				endBlockNo,
				data: JSON.stringify(eventsWithTimestamps)
			});

			return Response.json(eventsWithTimestamps);
		} catch (subsquidError) {
			console.error('Subsquid Error:', subsquidError);
			return Response.json({ error: 'Failed to fetch calendar events', details: subsquidError }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
		}
	} catch (error) {
		return Response.json({ error: error instanceof APIError ? error.message : 'Error while fetching calendar events' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
