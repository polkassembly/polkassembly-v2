// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import { ENetwork, IParachain } from '@/_shared/types';
import { useQuery } from '@tanstack/react-query';
import styles from '../../parachains.module.scss';
import ParachainsInfoCard from '../ParachainsInfoCard/ParachainsInfoCard';
import ParachainTable from '../ParachainTable/ParachainTable';

function ParachainComponent() {
	const [parachainsData, setParachainsData] = useState<IParachain[]>([]);

	const { data } = useQuery({
		queryKey: ['parachains'],
		queryFn: async () => {
			const response = await fetch('/parachains.json');
			return response.json();
		}
	});

	useEffect(() => {
		if (data) {
			setParachainsData(data);
		}
	}, [data]);

	const polkadotParachainsDataLength = parachainsData.filter((parachain) => parachain.chain === ENetwork.POLKADOT).length;
	const kusamaParachainsDataLength = parachainsData.filter((parachain) => parachain.chain === ENetwork.KUSAMA).length;

	return (
		<div className={styles.parachainsPage}>
			<ParachainsInfoCard
				polkadotParachainsDataLength={polkadotParachainsDataLength}
				kusamaParachainsDataLength={kusamaParachainsDataLength}
			/>
			<ParachainTable parachainsData={parachainsData} />
		</div>
	);
}

export default ParachainComponent;
