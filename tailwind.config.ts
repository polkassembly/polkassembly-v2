// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { Config } from 'tailwindcss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createThemes } from 'tw-colors';
import { THEME_COLORS } from './src/app/_style/theme';

const config: Config = {
	content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
	darkMode: 'class',
	plugins: [createThemes(THEME_COLORS)]
};
export default config;
