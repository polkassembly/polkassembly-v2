// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import classes from './CreatedAtTime.module.scss';

function CreatedAtTime({ createdAt }: { createdAt: Date }) {
	const formattedCreatedAt = dayjs(createdAt).fromNow();

	return (
		<div className={classes.infoItem}>
			<FaRegClock className={classes.infoIcon} />
			<span className={classes.infoTimer}>{formattedCreatedAt}</span>
		</div>
	);
}

export default CreatedAtTime;
