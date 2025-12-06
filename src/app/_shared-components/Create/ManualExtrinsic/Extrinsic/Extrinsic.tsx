// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ICallState } from '@/_shared/types';
import { Transaction } from 'polkadot-api';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import SelectSection from '../SelectSection/SelectSection';
import SelectMethod from '../SelectMethod/SelectMethod';
// eslint-disable-next-line import/no-cycle
import Params from '../Params';

export function Extrinsic({ onChange }: { onChange?: (extrinsic: (SubmittableExtrinsic<'promise', ISubmittableResult> & Transaction<any, any, any, any>) | null) => void }) {
	const [selectedSection, setSelectedSection] = useState<string>();
	const [selectedMethod, setSelectedMethod] = useState<string>();
	const { apiService } = usePolkadotApiService();

	const [{ extrinsic, paramValues }, setExtrinsicValues] = useState<ICallState>({
		extrinsic: {
			extrinsicFn: null,
			params: []
		},
		paramValues: []
	});

	const getCallState = useCallback(
		(fn: SubmittableExtrinsicFunction<'promise'> & Transaction<any, any, any, any>, values: unknown[] = []): ICallState => {
			const params =
				apiService instanceof PolkadotApiService ? (apiService?.getPreimageParams({ extrinsicFn: fn() as any }) ?? []) : (apiService?.getPreimageParams({ extrinsicFn: fn }) ?? []);
			return {
				extrinsic: {
					extrinsicFn: fn,
					params
				},
				paramValues: values
			};
		},
		[apiService]
	);

	const onMethodChange = useCallback(
		(extFn: SubmittableExtrinsicFunction<'promise'> & Transaction<any, any, any, any>, method: string) => {
			setSelectedMethod(method);
			setExtrinsicValues(getCallState(extFn));
			onChange?.(null);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getCallState]
	);

	const setParamValues = useCallback((values: unknown[]) => setExtrinsicValues((prev) => ({ ...prev, paramValues: values })), []);

	useEffect(() => {
		if (paramValues.length === extrinsic.params.length) {
			try {
				let method;
				if (apiService instanceof PolkadotApiService) {
					// PAPI expects named object: { param1: value1, param2: value2 }
					const argsObject = extrinsic.params.reduce(
						(obj, param, index) => {
							// eslint-disable-next-line no-param-reassign
							obj[param.name] = paramValues[`${index}`];
							return obj;
						},
						{} as Record<string, unknown>
					);
					method = extrinsic.extrinsicFn?.(argsObject);
				} else {
					// PolkadotJS uses positional arguments
					method = extrinsic.extrinsicFn?.(...paramValues);
				}
				if (method) {
					onChange?.(method as any);
				}
			} catch (error) {
				console.error(error);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extrinsic, paramValues, apiService]);

	return (
		<div className='flex flex-col gap-y-4'>
			<SelectSection
				selectedSection={selectedSection}
				onChange={(value) => {
					setSelectedSection(value);
				}}
			/>
			<SelectMethod
				selectedSection={selectedSection}
				selectedMethod={selectedMethod}
				onChange={onMethodChange}
			/>
			<Params
				params={extrinsic.params}
				onChange={setParamValues}
			/>
		</div>
	);
}
