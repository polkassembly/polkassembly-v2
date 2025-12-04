// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import SetIdentityIllustration from '@assets/illustrations/set-identity.svg';
import Image from 'next/image';
import { BN } from '@polkadot/util';
import { Separator } from '@/app/_shared-components/Separator';
import { Button } from '@/app/_shared-components/Button';
import { useTranslations } from 'next-intl';
import classes from './SetIdentityFees.module.scss';
import IdentityFeeCollaps from '../IdentityFeeCollaps/IdentityFeeCollaps';

function SetIdentityFees({ onNext, onRequestJudgement, registrarFee }: { onNext: () => void; onRequestJudgement: () => void; registrarFee: BN }) {
	const t = useTranslations();

	return (
		<div className={classes.wrapper}>
			<div className='flex flex-1 flex-col overflow-y-auto'>
				<div className={classes.illustration}>
					<Image
						src={SetIdentityIllustration}
						alt='Set Identity Illustration'
					/>
				</div>
				<ul className={classes.description}>
					<li>{t('SetIdentity.identityDescription1')}</li>
					<li>{t('SetIdentity.identityDescription2')}</li>
				</ul>
			</div>
			<IdentityFeeCollaps registrarFee={registrarFee} />
			<Separator />
			<Button onClick={onNext}>{t('SetIdentity.letBegin')}</Button>
			<Button
				variant='secondary'
				onClick={onRequestJudgement}
			>
				{t('SetIdentity.requestJudgement')}
			</Button>
		</div>
	);
}

export default SetIdentityFees;
