// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

function Tags({ tags }: { tags: string[] }) {
	return (
		<div className='flex flex-wrap gap-2'>
			{tags[0]?.length > 6 ? (
				<div className='flex items-center gap-1'>
					<span className='rounded-full border border-border_grey px-2 py-0.5 text-xs text-btn_secondary_text'>{tags[0]}</span>
					{tags.length > 1 && <span className='text-xs text-btn_secondary_text'>+{tags.length - 1}</span>}
				</div>
			) : (
				<div className='flex items-center gap-1'>
					{tags.slice(0, 2).map((tag) => (
						<span
							key={tag}
							className='rounded-full border border-border_grey px-2 py-0.5 text-xs text-btn_secondary_text'
						>
							{tag}
						</span>
					))}
					{tags.length > 2 && <span className='text-xs text-btn_secondary_text'>+{tags.length - 2}</span>}
				</div>
			)}
		</div>
	);
}

export default Tags;
