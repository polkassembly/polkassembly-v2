// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { ETheme, IProposalArguments } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import ArgumentsTable from './ArgumentsTable';
import classes from './ArgumentsTable.module.scss';

const ReactJson = dynamic(() => import('react-json-view'), {
	ssr: false
});

interface Props {
	className?: string;
	postArguments: IProposalArguments;
}

enum Etabs {
	TABLE = 'table',
	JSON = 'json'
}

function ArgumentsTableJSONView({ className, postArguments }: Props) {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();

	if (postArguments) {
		return (
			<div className={className}>
				<Tabs defaultValue={Etabs.TABLE}>
					<TabsList className='mb-2'>
						<TabsTrigger value={Etabs.TABLE}>{t('PostDetails.OnchainInfo.table')}</TabsTrigger>
						<TabsTrigger value={Etabs.JSON}>{t('PostDetails.OnchainInfo.json')}</TabsTrigger>
					</TabsList>
					<TabsContent value={Etabs.TABLE}>
						<div className='max-h-[500px] w-full max-w-full overflow-auto border-b border-border_grey'>
							<table
								cellSpacing={0}
								cellPadding={0}
								className='w-full'
							>
								<thead>
									<tr className={classes.tableHeader}>
										<th className='p-2'>{t('PostDetails.OnchainInfo.name')}</th>
										<th className='p-2'>{t('PostDetails.OnchainInfo.value')}</th>
									</tr>
								</thead>
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
