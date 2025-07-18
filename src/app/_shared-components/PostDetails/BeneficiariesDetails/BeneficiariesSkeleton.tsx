// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from '../../Skeleton';
import classes from './BeneficiariesDetails.module.scss';

function BeneficiariesSkeleton({ usedInDialog = false }: { usedInDialog?: boolean }) {
	return (
		<div className={classes.beneficiariesSkeleton}>
			{usedInDialog && <Skeleton className='full h-8' />}
			<Skeleton className={classes.beneficiariesSkeletonItemAmount} />
			<Skeleton className={classes.beneficiariesSkeletonItemAmount} />
			<Skeleton className={classes.beneficiariesSkeletonItemAmount} />
			<Skeleton className={classes.beneficiariesSkeletonItemExpireIn} />
		</div>
	);
}

export default BeneficiariesSkeleton;
