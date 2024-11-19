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
	darkMode: ['class'],
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
		createThemes(THEME_COLORS),
		require('tailwindcss-animate')
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	}
};
export default config;
