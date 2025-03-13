// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';

function SelectTrack({ selectedTrack, onChange, trackGroup }: { selectedTrack?: string; onChange: (track: string) => void; trackGroup?: string[] }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const trackArr: string[] = [];

	if (network) {
		Object.entries(NETWORKS_DETAILS?.[`${network}`].trackDetails).forEach(([key, value]) => {
			if (trackGroup) {
				if (trackGroup.includes(value.group || 'Treasury')) {
					trackArr.push(key);
				}
			} else {
				trackArr.push(key);
			}
		});
	}
	return (
		<div className='flex flex-col gap-y-1'>
			<p className='text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.track')}</p>
			<DropdownMenu>
				<DropdownMenuTrigger className='flex w-full items-center gap-x-2 rounded border border-border_grey px-4 py-2'>
					{selectedTrack || t('CreateTreasuryProposal.selectTrack')}
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{trackArr.map((track) => (
						<DropdownMenuItem
							key={track}
							onClick={() => onChange(track)}
						>
							{track.split(/(?=[A-Z])/).join(' ')}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default SelectTrack;
