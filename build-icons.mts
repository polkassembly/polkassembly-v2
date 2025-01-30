// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as path from 'node:path';
import fsExtra from 'fs-extra';
import { glob } from 'glob';
import { parse } from 'node-html-parser';
import { optimize } from 'svgo';

const cwd = process.cwd();
const inputDir = path.join(cwd, 'src', '_assets');
const outputDir = path.join(cwd, 'public', 'icons');
const typeDir = path.join(cwd, 'types');
const MAX_SPRITE_SIZE = 1024 * 500; // 500KB limit

await Promise.all([fsExtra.ensureDir(outputDir), fsExtra.ensureDir(typeDir)]);

const folders = fsExtra.readdirSync(inputDir).filter((file) => fsExtra.statSync(path.join(inputDir, file)).isDirectory());

const shouldVerboseLog = process.argv.includes('--log=verbose');
const logVerbose = shouldVerboseLog ? console.log : () => {};

const iconName = (file: string) => file.replace(/\.svg$/, '').replace(/\\/g, '/');

const writeIfChanged = async (filepath: string, newContent: string) => {
	const currentContent = await fsExtra.readFile(filepath, 'utf8').catch(() => '');
	if (currentContent === newContent) return false;
	await fsExtra.writeFile(filepath, newContent, 'utf8');
	return true;
};

const optimizeSvg = (svgContent: string) => {
	const result = optimize(svgContent, {
		plugins: [{ name: 'removeComments' }, { name: 'removeMetadata' }, { name: 'removeTitle' }, { name: 'removeEmptyAttrs' }]
	});
	return result.data;
};

const generateSvgSprite = async (folder: string, files: string[]) => {
	if (files.length === 0) return;

	const symbols = await Promise.all(
		files.map(async (file) => {
			let input = await fsExtra.readFile(path.join(inputDir, folder, file), 'utf8');
			input = optimizeSvg(input); // Optimize SVG before adding to sprite

			const root = parse(input);
			const svg = root.querySelector('svg');

			if (!svg) throw new Error(`No SVG element found in ${file}`);

			svg.tagName = 'symbol';
			svg.setAttribute('id', iconName(file));
			['xmlns', 'xmlns:xlink', 'version', 'width', 'height'].forEach((attr) => svg.removeAttribute(attr));

			return svg.toString().trim();
		})
	);

	const output = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		`<!-- This file is auto-generated from ${folder} folder -->`,
		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">',
		'<defs>',
		...symbols,
		'</defs>',
		'</svg>',
		'' // trailing newline
	].join('\n');

	const outputPath = path.join(outputDir, `${folder}.svg`);

	// Check the file size and warn if it exceeds the limit
	await writeIfChanged(outputPath, output);
	const stats = await fsExtra.stat(outputPath);

	if (stats.size > MAX_SPRITE_SIZE) {
		console.warn(`⚠️  WARNING: ${folder}.svg exceeds ${MAX_SPRITE_SIZE / 1024}KB (${(stats.size / 1024).toFixed(2)}KB). Consider splitting icons into smaller sprites.`);
	}

	logVerbose(`✅ Saved to /public/icons/${folder}.svg`);
};

const generateIconFiles = async () => {
	await Promise.all(
		folders.map(async (folder) => {
			const files = glob.sync('*.svg', { cwd: path.join(inputDir, folder) }).sort();
			logVerbose(`Generating sprite for ${folder}`);
			await generateSvgSprite(folder, files);
		})
	);

	console.log(`Generated ${folders.length} icon sprites.`);
};

await generateIconFiles();
