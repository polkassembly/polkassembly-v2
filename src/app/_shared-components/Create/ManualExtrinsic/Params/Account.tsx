// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import React, { useCallback } from 'react';
import { Registry } from '@polkadot/types/types';
// eslint-disable-next-line import/no-cycle
import Enum from './Enum';
import AddressInput from '../../../AddressInput/AddressInput';

function Account({ param, onChange, defaultValue, registry }: { param: IParamDef; onChange: (value: unknown) => void; defaultValue: unknown; registry: Registry }) {
	const onAddressChange = useCallback((value: unknown) => onChange(value), [onChange]);

	if (param.type.type === 'MultiAddress') {
		// if ( !value || (value as MultiAddress).type !== 'Id') {
		return (
			<Enum
				param={param}
				onChange={onChange}
				defaultValue={defaultValue}
				registry={registry}
			/>
		);
		// }
	}

	return <AddressInput onChange={onAddressChange} />;
}

export default Account;
