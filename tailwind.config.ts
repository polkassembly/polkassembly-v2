// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { nextui } from '@nextui-org/theme/plugin';
import type { Config } from 'tailwindcss';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createThemes } from 'tw-colors';
import { THEME_COLORS } from './src/app/_style/theme';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
	],
	darkMode: 'class',
	plugins: [
		nextui({
			prefix: 'nui',
			defaultTheme: 'light',
			defaultExtendTheme: 'light',
			layout: {
				radius: {
					small: '8px', // rounded-small
					medium: '14px', // rounded-medium
					large: '20px' // rounded-large
				}
			},
			themes: {
				light: {
					colors: {
						background: '#F8FAFC', // the page background color
						foreground: '#243A57', // the page text color
						primary: {
							foreground: '#FFFFFF',
							DEFAULT: '#E5007A'
						},
						secondary: {
							foreground: '#FFFFFF',
							DEFAULT: '#151532'
						},
						warning: '#F89118'
					}
				},
				dark: {
					colors: {
						background: '#151532', // the page background color
						foreground: '#FFFFFF', // the page text color
						primary: {
							foreground: '#FFFFFF',
							DEFAULT: '#C30068'
						},
						secondary: {
							foreground: '#FFFFFF',
							DEFAULT: '#2D2D6C'
						}
					}
				}
			}
		}),
		createThemes(THEME_COLORS)
	]
};
export default config;
