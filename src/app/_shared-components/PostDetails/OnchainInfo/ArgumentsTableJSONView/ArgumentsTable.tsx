// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactElement } from 'react';
import { IProposalArguments } from '@/_shared/types';
import classes from './ArgumentsTable.module.scss';

const urlRegex = /\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/gi;

function UrlText({ text }: { text: string }) {
	if (!text || typeof text !== 'string') return null;

	const parts: (string | ReactElement)[] = [];
	let lastIndex = 0;

	text.replace(urlRegex, (url, index) => {
		// Add text before the URL
		if (index > lastIndex) {
			parts.push(text.slice(lastIndex, index));
		}

		// Add the URL as a link
		parts.push(
			<a
				key={url + index}
				className='text-text_pink'
				href={url}
				target='_blank'
				rel='noopener noreferrer'
			>
				{url}
			</a>
		);

		lastIndex = index + url.length;
		return url;
	});

	// Add remaining text after last URL
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	// Replace fragment with span to prevent DOM node issues
	return <span className='inline'>{parts}</span>;
}

function ArgumentsTable({ argumentsJSON }: { argumentsJSON: IProposalArguments }) {
	if (!argumentsJSON) return null;
	return (
		<tbody>
			{Object.entries(argumentsJSON).map(([name, value]) => {
				return (
					<tr
						key={`${name}-${value}`}
						// className={classes.tableRow}
					>
						<td className={classes.tableCellName}>{name}</td>
						{typeof value !== 'object' ? (
							<td className={classes.tableCellValue}>
								<UrlText text={value as string} />
							</td>
						) : (
							<td>
								<table className='w-full'>
									<ArgumentsTable argumentsJSON={value as IProposalArguments} />
								</table>
							</td>
						)}
					</tr>
				);
			})}
		</tbody>
	);
}

export default ArgumentsTable;
