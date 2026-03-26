#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newVersion = process.argv[2];

if (!newVersion) {
	console.error('Usage: node scripts/bump-version.mjs <new-version>');
	process.exit(1);
}

const packages = [
	'packages/client/package.json',
	'packages/server/package.json',
	'packages/shared/package.json',
	'packages/db/package.json'
];

const rootDir = path.join(__dirname, '..');

packages.forEach(p => {
	const filePath = path.join(rootDir, p);
	if (fs.existsSync(filePath)) {
		const file = fs.readFileSync(filePath, 'utf8');
		// Replaces "version": "1.2.3" with "version": "<newVersion>"
		const updated = file.replace(/("version":\s*")[^"]+(")/, `$1${newVersion}$2`);
		fs.writeFileSync(filePath, updated);
		console.log(`✅ Updated ${p} to version ${newVersion}`);
	} else {
		console.warn(`⚠️ File not found: ${filePath}`);
	}
});

console.log(`🎉 Successfully synchronized workspace packages to version ${newVersion}`);
