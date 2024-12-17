// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import ArrowIcon from '@/_assets/icons/Treasury/arrow-icon.svg';
import Image from 'next/image';
import TokenDetails from './TokenDetails/TokenDetails';
import styles from './TreasuryBalance.module.scss';
import TreasuryDetailsModal from './TreasuryDetailsModal/TreasuryDetailsModal';

function TreasuryBalance() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => setIsModalOpen(true);

	return (
		<>
			<main className={styles.treasuryBalanceWrapper}>
				<div className={styles.header}>
					<div className={styles.treasuryInfo}>
						<span className={styles.title}>Treasury</span>
						<Image
							src={InfoIcon}
							alt='Info'
							width={16}
							height={16}
							className={styles.infoIcon}
						/>
					</div>
				</div>

				<div className={styles.detailsWrapper}>
					<div className={styles.detailsHeader}>
						<span className={styles.totalValue}>~$280.11M</span>
						<div
							className={styles.detailsLink}
							onClick={handleOpenModal}
						>
							<span className={styles.linkText}>Details</span>
							<Image
								src={ArrowIcon}
								alt='Details'
								width={16}
								height={16}
								className={styles.arrowIcon}
							/>
						</div>
					</div>
					<TokenDetails />
				</div>
			</main>

			{isModalOpen && <TreasuryDetailsModal />}
		</>
	);
}

export default TreasuryBalance;
