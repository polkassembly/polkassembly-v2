// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as React from 'react';
import ReactJson from 'react-json-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ETheme } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import ArgumentsTable from './ArgumentsTable';
import classes from './ArgumentsTable.module.scss';

interface Props {
	className?: string;
	postArguments: Record<string, unknown>;
}

enum Etabs {
	TABLE = 'table',
	JSON = 'json'
}

function ArgumentsTableJSONView({ className, postArguments }: Props) {
	const { userPreferences } = useUserPreferences();
	const t = useTranslations();
	if (postArguments) {
		return (
			<div className={className}>
				<Tabs defaultValue={Etabs.TABLE}>
					<TabsList className='mb-2'>
						<TabsTrigger value={Etabs.TABLE}>{t('PostDetails.OnchainInfo.table')}</TabsTrigger>
						<TabsTrigger value={Etabs.JSON}>{t('PostDetails.OnchainInfo.json')}</TabsTrigger>
					</TabsList>
					<TabsContent value={Etabs.TABLE}>
						<div>
							<table
								cellSpacing={0}
								cellPadding={0}
							>
								<article className={classes.tableHeader}>
									<span className='col-span-1'>{t('PostDetails.OnchainInfo.name')}</span>
									<span className='col-span-3'>{t('PostDetails.OnchainInfo.value')}</span>
								</article>
								<tbody className={classes.tableBody}>
									<ArgumentsTable argumentsJSON={postArguments} />
								</tbody>
							</table>
						</div>
					</TabsContent>
					<TabsContent value={Etabs.JSON}>
						<div className={classes.jsonContainer}>
							<ReactJson
								theme={userPreferences.theme === ETheme.DARK ? 'monokai' : 'rjv-default'}
								src={postArguments}
								iconStyle='circle'
								enableClipboard={false}
								displayDataTypes={false}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		);
	}
	return <div />;
}

export default ArgumentsTableJSONView;
