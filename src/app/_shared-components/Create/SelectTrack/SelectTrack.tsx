// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useEffect, useState } from 'react';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { BN, BN_ZERO } from '@polkadot/util';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';

function SelectTrack({
	selectedTrack,
	onChange,
	isTreasury,
	requestedAmount
}: {
	selectedTrack?: string;
	onChange: (track: EPostOrigin) => void;
	isTreasury?: boolean;
	requestedAmount?: BN;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const trackArr: { name: EPostOrigin; trackId: number }[] = [];

	const [track, setTrack] = useState<{ name: string; trackId: number }>();

	if (network) {
		Object.entries(NETWORKS_DETAILS?.[`${network}`].trackDetails).forEach(([key, value]) => {
			if (isTreasury) {
				if ('maxSpend' in value || (network === ENetwork.WESTEND && key === EPostOrigin.TREASURER)) {
					trackArr.push({ name: key as EPostOrigin, trackId: value.trackId });
				}
			} else {
				trackArr.push({ name: key as EPostOrigin, trackId: value.trackId });
			}
		});
	}

	useEffect(() => {
		if (!requestedAmount || requestedAmount.isZero()) return;

		const tracks = [...trackArr];
		const filteredTrack = tracks
			.sort((a, b) => {
				const maxSpendA = NETWORKS_DETAILS?.[`${network}`].trackDetails[`${a.name}`]?.maxSpend;
				const maxSpendB = NETWORKS_DETAILS?.[`${network}`].trackDetails[`${b.name}`]?.maxSpend;
				return maxSpendA?.gte(maxSpendB || BN_ZERO) ? 1 : -1;
			})
			.find((tr) => {
				const maxSpend = NETWORKS_DETAILS?.[`${network}`].trackDetails[`${tr.name}`]?.maxSpend;
				return maxSpend && maxSpend.gte(requestedAmount);
			});

		if (filteredTrack) {
			setTrack(filteredTrack);
			onChange(filteredTrack.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, requestedAmount]);

	return (
		<div className='flex flex-col gap-y-1'>
			<p className='text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.track')}</p>
			<DropdownMenu>
				<DropdownMenuTrigger className='text-sm font-medium text-text_primary'>
					{track?.trackId && `[${track?.trackId}]`} {selectedTrack?.split(/(?=[A-Z])/).join(' ') || t('CreateTreasuryProposal.selectTrack')}
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{trackArr.map((tr) => (
						<DropdownMenuItem
							key={tr.trackId}
							onClick={() => {
								setTrack(tr);
								onChange(tr.name);
							}}
						>
							[{tr.trackId}] {tr.name.split(/(?=[A-Z])/).join(' ')}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default SelectTrack;
