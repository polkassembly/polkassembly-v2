// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactElement } from 'react';
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

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{parts}</>;
}

function ArgumentsTable({ argumentsJSON }: { argumentsJSON: Record<string, unknown> }) {
	if (!argumentsJSON) return null;
	return (
		<>
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
								<ArgumentsTable argumentsJSON={value as Record<string, unknown>} />
							</td>
						)}
					</tr>
				);
			})}
		</>
	);
}

export default ArgumentsTable;
