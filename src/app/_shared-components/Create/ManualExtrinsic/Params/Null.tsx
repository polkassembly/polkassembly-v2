// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect } from 'react';

function NullComp({ onChange }: { onChange: (value: null) => void }) {
	useEffect(() => {
		onChange(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}

export default NullComp;
