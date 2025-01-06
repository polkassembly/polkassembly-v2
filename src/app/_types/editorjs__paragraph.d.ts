// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BlockToolConstructable } from '@editorjs/editorjs';

declare module '@editorjs/paragraph' {
	const Paragraph: BlockToolConstructable;
	export = Paragraph;
}
