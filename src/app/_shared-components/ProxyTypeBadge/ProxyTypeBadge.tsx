// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProxyType } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import styles from './ProxyTypeBadge.module.scss';

interface Props {
	proxyType: EProxyType;
	className?: string;
}

function ProxyTypeBadge({ proxyType, className = '' }: Props) {
	const t = useTranslations('ProxyType');

	// Map enum values to translation keys
	const getTranslationKey = (type: EProxyType): string => {
		switch (type) {
			case EProxyType.ANY:
				return 'any';
			case EProxyType.NON_TRANSFER:
				return 'non_transfer';
			case EProxyType.GOVERNANCE:
				return 'governance';
			case EProxyType.STAKING:
				return 'staking';
			case EProxyType.IDENTITY_JUDGEMENT:
				return 'identity_judgement';
			case EProxyType.AUCTION:
				return 'auction';
			case EProxyType.CANCEL_PROXY:
				return 'cancel_proxy';
			case EProxyType.PARAREGISTRATION:
				return 'pararegistration';
			case EProxyType.NOMINATION_POOLS:
				return 'nomination_pools';
			case EProxyType.SUDO_BALANCES:
				return 'sudo_balances';
			default:
				return 'any';
		}
	};

	const translationKey = getTranslationKey(proxyType);
	const normalizedProxyType = translationKey;

	return <div className={`${styles.base} ${normalizedProxyType ? styles[String(normalizedProxyType)] : ''} ${className}`}>{t(`${translationKey}`)}</div>;
}

export default ProxyTypeBadge;
