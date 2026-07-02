#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const newVersion = process.argv[2];

if (!newVersion) {
	console.error('Usage: node scripts/bump-version.mjs <new-version>');
	process.exit(1);
}

const targets = [
	'package.json',
	...fs
		.readdirSync(path.join(rootDir, 'packages'), { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => `packages/${entry.name}/package.json`)
		.filter(p => fs.existsSync(path.join(rootDir, p)))
];

targets.forEach(p => {
	const filePath = path.join(rootDir, p);
	const file = fs.readFileSync(filePath, 'utf8');
	const updated = file.replace(/("version":\s*")[^"]+(")/, `$1${newVersion}$2`);
	fs.writeFileSync(filePath, updated);
	console.log(`✅ Updated ${p} to version ${newVersion}`);
});

console.log(`🎉 Synchronized ${targets.length} package.json files to version ${newVersion}`);
