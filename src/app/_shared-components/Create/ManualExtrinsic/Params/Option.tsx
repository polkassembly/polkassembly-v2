// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import { useCallback, useEffect, useState } from 'react';
import { TypeDef } from '@polkadot/types/types';
import { Switch } from '@/app/_shared-components/Switch';
import { useTranslations } from 'next-intl';
// eslint-disable-next-line import/no-cycle
import Param from './Param';

function Option({ param, onChange }: { param: IParamDef; onChange: (value: unknown) => void }) {
	const t = useTranslations();
	const { sub } = param.type;

	const [isActive, setIsActive] = useState(true);

	const onParamChange = useCallback(
		(value: unknown) => {
			onChange(value);
		},
		[onChange]
	);

	useEffect((): void => {
		if (!isActive) {
			onParamChange(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive]);

	return (
		<div>
			<div className='flex items-center justify-end gap-x-1'>
				<span className='text-sm text-text_primary'>{t('CreatePreimage.includeOption')}</span>
				<Switch
					checked={isActive}
					onCheckedChange={setIsActive}
				/>
			</div>
			{sub && isActive && (
				<Param
					param={{
						name: param.name,
						type: sub as TypeDef
					}}
					onChange={(value) => {
						onParamChange(value);
					}}
				/>
			)}
		</div>
	);
}

export default Option;
