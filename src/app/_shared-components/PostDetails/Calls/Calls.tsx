// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-underscore-dangle */
import { EAssets, IBeneficiary, IProposalArguments } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useTokenUSDPrice } from '@/hooks/useCurrentTokenUSDPrice';
import { useDEDTokenUSDPrice } from '@/hooks/useDEDTokenUSDPrice';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronRightIcon } from 'lucide-react';
import { Skeleton } from '../../Skeleton';
import classes from './Call.module.scss';
import BeneficiaryPaymentsList from '../BeneficiariesDetails/BeneficiaryPaymentsList';
import { Dialog, DialogContent, DialogTrigger } from '../../Dialog/Dialog';
import ArgumentsTableJSONView from '../OnchainInfo/ArgumentsTableJSONView';
import { Button } from '../../Button';

const MAX_CALLS_TO_SHOW = 4;

function extractCallDetails(args?: IProposalArguments) {
	if (!args) return [];

	const calls: { section: string; method: string }[] = [];
	if (Array.isArray(args?.args?.calls)) {
		args.args.calls?.forEach((call: { value: { __kind: string }; __kind: string }) => {
			if (call.value.__kind && call.__kind) {
				calls.push({ section: call.__kind, method: call.value.__kind });
			}
		});
	}
	return calls;
}

function Calls({ proposalHash, beneficiaries, args, isFetching }: { proposalHash?: string; beneficiaries?: IBeneficiary[]; args?: IProposalArguments; isFetching?: boolean }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { getCachedTokenUSDPrice } = useTokenUSDPrice();
	const { getCachedDEDTokenUSDPrice } = useDEDTokenUSDPrice();
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string | null>(null);
	const [dedTokenUSDPrice, setDEDTokenUSDPrice] = useState<string | null>(null);
	const calls = useMemo(() => extractCallDetails(args), [args]);
	const [showAllCalls, setShowAllCalls] = useState(false);

	const fetchTokenPrices = useCallback(async () => {
		if (beneficiaries?.find((beneficiary) => !beneficiary.assetId)) {
			const tokenPrice = await getCachedTokenUSDPrice();
			setCurrentTokenPrice(tokenPrice);
		}
		if (beneficiaries?.find((beneficiary) => beneficiary.assetId && getAssetDataByIndexForNetwork({ network, generalIndex: beneficiary.assetId })?.symbol === EAssets.DED)) {
			const dedTokenPrice = await getCachedDEDTokenUSDPrice();
			setDEDTokenUSDPrice(dedTokenPrice);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getCachedTokenUSDPrice, getCachedDEDTokenUSDPrice]);

	useEffect(() => {
		fetchTokenPrices();
	}, [fetchTokenPrices]);

	return (
		<div>
			{!proposalHash ? (
				<Skeleton className='my-2 h-7 w-full' />
			) : (
				proposalHash && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposalHash')}</p>
						<p className={cn(classes.infoRowValue, 'break-words')}>{proposalHash}</p>
					</div>
				)
			)}
			{!args && isFetching ? (
				<div className={classes.infoRow}>
					<Skeleton className='my-2 h-8' />
					<Skeleton className='my-2 h-8' />
				</div>
			) : (
				!!args && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.call')}</p>
						<div className={cn('flex flex-col gap-y-1', classes.infoRowValue, 'break-words')}>
							<div className='flex gap-x-2'>
								<span className={cn(classes.argsLabel)}>{args.section}</span>
								<span className={cn(classes.argsLabel)}>{args.method.replace('_', ' ')}</span>

								<Dialog>
									<DialogTrigger className='flex items-center gap-x-0.5 text-xs text-text_pink'>
										{t('PostDetails.OnchainInfo.details')}
										<ChevronRightIcon className='h-3.5 w-3.5' />
									</DialogTrigger>
									<DialogContent className='max-h-[80vh] w-[500px] p-6 max-lg:w-full'>
										<div className='max-h-[80vh] overflow-x-auto overflow-y-auto'>
											<ArgumentsTableJSONView postArguments={args} />
										</div>
									</DialogContent>
								</Dialog>
							</div>
							{calls?.length > 0 && (
								<div className='relative ml-4 mt-2 flex flex-col gap-y-1 border-l-2 border-dashed border-border_grey pl-4 dark:border-gray-600'>
									{calls.slice(0, showAllCalls ? undefined : MAX_CALLS_TO_SHOW).map((call) => (
										<div className='flex gap-x-1'>
											<span className={classes.argsLabel}>{call.section}</span>
											<span className={classes.argsLabel}>{call.method}</span>
										</div>
									))}
									{calls.length > MAX_CALLS_TO_SHOW && (
										<div className='mt-1 flex justify-start'>
											<Button
												variant='ghost'
												className='flex h-4 w-full items-center justify-start p-0 text-xs font-medium text-text_pink'
												onClick={() => setShowAllCalls(!showAllCalls)}
											>
												{showAllCalls ? t('PostDetails.OnchainInfo.showLess') : t('PostDetails.OnchainInfo.showMore')}
											</Button>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)
			)}

			{!!beneficiaries && beneficiaries?.length > 0 && (
				<div className={classes.infoRow}>
					<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.requested')}</p>
					<p className={classes.infoRowValue}>
						<BeneficiaryPaymentsList
							currentTokenPrice={currentTokenPrice}
							dedTokenUSDPrice={dedTokenUSDPrice}
							beneficiaries={beneficiaries}
							usedInOnchainInfo
						/>
					</p>
				</div>
			)}
		</div>
	);
}

export default Calls;
