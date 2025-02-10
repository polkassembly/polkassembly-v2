// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styles from './Delegation.module.scss';
import DelegationSupplyData from './DelegationSupplyData';
import DelegationCard from './DelegationCard';
import DelegationPopupCard from './DelegationPopupCard';

function Delegation() {
	return (
		<div className={styles.delegation}>
			<h1 className={styles.delegation_title}>Delegation</h1>
			<DelegationPopupCard />
			<DelegationSupplyData />
			<DelegationCard />
		</div>
	);
}

export default Delegation;
