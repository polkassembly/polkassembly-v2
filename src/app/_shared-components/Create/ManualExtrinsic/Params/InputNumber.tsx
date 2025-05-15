// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputHTMLAttributes, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { IParamDef } from '@/_shared/types';
import { BN, BN_ONE, BN_TWO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '../../../Input';

type InputNumberProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	onChange: (value: number) => void;
	param?: IParamDef;
	bitLength?: number;
	isDecimal?: boolean;
	isSigned?: boolean;
};

const DEFAULT_BITLENGTH = 32;

function getGlobalMaxValue(bitLength?: number): BN {
	return BN_TWO.pow(new BN(bitLength || DEFAULT_BITLENGTH)).isub(BN_ONE);
}

function getRegexForNumberInput(isDecimal: boolean, isSigned: boolean): RegExp {
	const decimal = '.';

	// eslint-disable-next-line security/detect-non-literal-regexp
	return new RegExp(isDecimal ? `^${isSigned ? '-?' : ''}(0|[1-9]\\d*)(\\${decimal}\\d*)?$` : `^${isSigned ? '-?' : ''}(0|[1-9]\\d*)$`);
}

function InputNumber({ onChange, ...props }: InputNumberProps) {
	const t = useTranslations();
	const maxValueLength = getGlobalMaxValue(props.bitLength).toString().length;
	const [error, setError] = useState<string>('');
	const [valueString, setValueString] = useState<string>(props.defaultValue ? props.defaultValue.toString() : '');

	const onKeyDown = useCallback(
		(event: KeyboardEvent<Element>): void => {
			if (event.key.length === 1) {
				const { selectionEnd: j, selectionStart: i, value } = event.target as HTMLInputElement;
				const newValue = `${value.substring(0, i || 0)}${event.key}${value.substring(j || 0)}`;

				if (!getRegexForNumberInput(!!props.isDecimal, !!props.isSigned).test(newValue)) {
					event.preventDefault();
				}
			}
		},
		[props.isDecimal, props.isSigned]
	);

	useEffect(() => {
		onChange(Number(props.defaultValue));
		setValueString(props.defaultValue?.toString() || '');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.defaultValue]);

	return (
		<div className='flex flex-col gap-y-1'>
			<Input
				type='text'
				onChange={(e) => {
					const { value } = e.target;
					if (new BN(value).lt(getGlobalMaxValue(props.bitLength))) {
						setValueString(value);
						onChange(Number(value));
						setError('');
					} else {
						setError(t('errorMessages.valueTooLarge'));
					}
				}}
				maxLength={maxValueLength}
				onKeyDown={onKeyDown}
				className={cn('w-full', props.className)}
				value={valueString}
			/>
			{error && <p className='text-sm text-failure'>{error}</p>}
		</div>
	);
}

export default InputNumber;
