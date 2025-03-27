// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useState } from 'react';
import { ENetwork, EPostOrigin } from '@/_shared/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';

function SelectTrack({ selectedTrack, onChange, isTreasury }: { selectedTrack?: string; onChange: (track: string) => void; isTreasury?: boolean }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const trackArr: { name: string; trackId: number }[] = [];

	const [track, setTrack] = useState<{ name: string; trackId: number }>();

	if (network) {
		Object.entries(NETWORKS_DETAILS?.[`${network}`].trackDetails).forEach(([key, value]) => {
			if (isTreasury) {
				if ('maxSpend' in value || (network === ENetwork.WESTEND && key === EPostOrigin.TREASURER)) {
					trackArr.push({ name: key, trackId: value.trackId });
				}
			} else {
				trackArr.push({ name: key, trackId: value.trackId });
			}
		});
	}
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
