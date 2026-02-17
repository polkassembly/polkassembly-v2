// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useRef } from 'react';
import { ENetwork } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

const AD_CDN_HOSTS = ['cdn.bmcdn6.com'];

const NETWORK_AD_SCRIPT_IDS: Partial<Record<ENetwork, string>> = {
	[ENetwork.POLKADOT]: '69941e70ce3e72c00151f7f8',
	[ENetwork.KUSAMA]: '69949ccc99501aa67c4f54a7'
};

const DEFAULT_AD_SCRIPT_ID = NETWORK_AD_SCRIPT_IDS[ENetwork.POLKADOT]!;

function AdBanner() {
	const adScriptId = NETWORK_AD_SCRIPT_IDS[getCurrentNetwork()] ?? DEFAULT_AD_SCRIPT_ID;

	const adRef = useRef<HTMLDivElement>(null);
	const scriptRef = useRef<HTMLScriptElement | null>(null);

	useEffect(() => {
		if (!adScriptId) return undefined;

		let cancelled = false;

		const loadAdScript = (hosts: string[], hostIndex: number, cacheBuster: number) => {
			if (cancelled) return;

			const script = document.createElement('script');
			script.async = true;
			script.src = `https://${hosts[hostIndex]}/js/${adScriptId}.js?v=${cacheBuster}`;
			script.onerror = () => {
				script.remove();
				const nextIndex = hostIndex + 1;
				if (!cancelled && nextIndex < hosts.length) {
					loadAdScript(hosts, nextIndex, cacheBuster);
				}
			};
			scriptRef.current = script;
			document.head.appendChild(script);
		};

		loadAdScript(AD_CDN_HOSTS, 0, new Date().getTime());

		return () => {
			cancelled = true;
			if (scriptRef.current) {
				scriptRef.current.remove();
				scriptRef.current = null;
			}
		};
	}, [adScriptId]);

	return (
		<div
			ref={adRef}
			className='mx-auto mb-4 hidden w-full items-center justify-center md:flex'
		>
			<ins
				className={adScriptId}
				style={{ display: 'inline-block', height: '90px', width: '728px' }}
			/>
		</div>
	);
}

export default AdBanner;
