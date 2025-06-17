// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import React, { useEffect, useMemo } from 'react';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';

const getMaxSpend = (network: ENetwork, trackName: EPostOrigin) => {
	return NETWORKS_DETAILS[`${network}`].trackDetails[`${trackName}`]?.maxSpend || BN_ZERO;
};

const getTracksForNetwork = (network: ENetwork, isTreasury?: boolean) => {
	const trackArr: { name: EPostOrigin; trackId: number }[] = [];
	if (!network) return trackArr;

	Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).forEach(([key, value]) => {
		if (isTreasury) {
			if ('maxSpend' in value || (network === ENetwork.WESTEND && key === EPostOrigin.TREASURER)) {
				trackArr.push({ name: key as EPostOrigin, trackId: value.trackId });
			}
		} else {
			trackArr.push({ name: key as EPostOrigin, trackId: value.trackId });
		}
	});

	return trackArr;
};

const getSortedTracks = (tracks: { name: EPostOrigin; trackId: number }[], network: ENetwork) => {
	return [...tracks].sort((a, b) => {
		const maxSpendA = getMaxSpend(network, a.name);
		const maxSpendB = getMaxSpend(network, b.name);
		return maxSpendA.gte(maxSpendB) ? 1 : -1;
	});
};

function SelectTrack({
	selectedTrack,
	onChange,
	isTreasury,
	requestedAmount
}: {
	selectedTrack?: { name: EPostOrigin; trackId: number };
	onChange: (track: { name: EPostOrigin; trackId: number }) => void;
	isTreasury?: boolean;
	requestedAmount?: BN;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const trackArr = useMemo(() => getTracksForNetwork(network, isTreasury), [network, isTreasury]);

	const sortedTracks = useMemo(() => getSortedTracks(trackArr, network), [trackArr, network]);

	useEffect(() => {
		if (!requestedAmount || requestedAmount.isZero()) {
			return;
		}

		const suitableTrack = sortedTracks.find((tr) => {
			const maxSpend = getMaxSpend(network, tr.name);
			return maxSpend.gte(requestedAmount);
		});

		const trackToUse = suitableTrack || sortedTracks[sortedTracks.length - 1];

		if (trackToUse) {
			onChange(trackToUse);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [requestedAmount]);

	return (
		<div className='flex flex-col gap-y-1'>
			<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('CreateTreasuryProposal.track')}</p>
			<DropdownMenu>
				<DropdownMenuTrigger className='text-sm font-medium text-text_primary'>
					{!selectedTrack ? t('CreateTreasuryProposal.selectTrack') : `[${selectedTrack.trackId}] ${convertCamelCaseToTitleCase(selectedTrack.name)}`}
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{sortedTracks.map((tr) => (
						<DropdownMenuItem
							key={tr.trackId}
							onClick={() => onChange(tr)}
						>
							[{tr.trackId}] {convertCamelCaseToTitleCase(tr.name)}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default React.memo(SelectTrack);
