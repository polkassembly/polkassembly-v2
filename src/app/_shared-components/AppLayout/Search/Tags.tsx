// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styles from './Search.module.scss';

function Tags({ tags }: { tags: string[] }) {
	return (
		<div className={styles.tags_wrapper}>
			{tags[0]?.length > 6 ? (
				<div className={styles.tags_wrapper}>
					<span className={styles.tag}>{tags[0]}</span>
					{tags.length > 1 && <span className={styles.tag}>+{tags.length - 1}</span>}
				</div>
			) : (
				<div className={styles.tags_wrapper}>
					{tags.slice(0, 2).map((tag) => (
						<span
							key={tag}
							className={styles.tag}
						>
							{tag}
						</span>
					))}
					{tags.length > 2 && <span>+{tags.length - 2}</span>}
				</div>
			)}
		</div>
	);
}

export default Tags;
