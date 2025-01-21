// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classes from './ArgumentsTable.module.scss';

const urlRegex = /(https?:\/\/[^\s]+)/g;

const constructAnchorTag = (value: string) => {
	if (value && typeof value === 'string') {
		const urls = value.match(urlRegex);
		if (urls && Array.isArray(urls)) {
			urls?.forEach((url) => {
				if (url && typeof url === 'string') {
					// eslint-disable-next-line no-param-reassign
					value = value.replace(url, `<a class="text-pink_primary" href='${url}' target='_blank'>${url}</a>`);
				}
			});
		}
	}
	return value;
};

function ArgumentsTable({ argumentsJSON }: { argumentsJSON: Record<string, unknown> }) {
	if (!argumentsJSON) return null;
	return (
		<>
			{Object.entries(argumentsJSON).map(([name, value]) => {
				return (
					<div key={`${name}-${value}`}>
						<tr className={classes.tableRow}>
							<td className={classes.tableCell}>{name}</td>
							{typeof value !== 'object' ? (
								<td
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: constructAnchorTag(value as string)
									}}
									className='col-span-3 truncate p-2 text-sm'
								/>
							) : (
								<td className='col-span-3 text-sm sm:w-auto'>
									<ArgumentsTable argumentsJSON={value as Record<string, unknown>} />
								</td>
							)}
						</tr>
					</div>
				);
			})}
		</>
	);
}

export default ArgumentsTable;
