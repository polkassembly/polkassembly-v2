// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IParamDef } from '@/_shared/types';
import React, { useCallback } from 'react';
// eslint-disable-next-line import/no-cycle
import Enum from './Enum';
import AddressInput from '../../../AddressInput/AddressInput';

function Account({ param, onChange }: { param: IParamDef; onChange: (value: unknown) => void }) {
	const onAddressChange = useCallback((value: unknown) => onChange(value), [onChange]);

	if (param.type.type === 'MultiAddress') {
		// if ( !value || (value as MultiAddress).type !== 'Id') {
		return (
			<Enum
				param={param}
				onChange={onChange}
			/>
		);
		// }
	}

	return <AddressInput onChange={onAddressChange} />;
}

export default Account;
