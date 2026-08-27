import { describe, it, expect } from 'vitest';
import { escapeCsvField, toCsv, parseImportCsv } from '../../src/modules/link/csv.util';

describe('CSV Utility & Formula Injection Sanitization (TL-SEC-06)', () => {
	describe('escapeCsvField', () => {
		it('sanitizes formula injection trigger characters by prefixing with a single quote', () => {
			expect(escapeCsvField('=1+1')).toBe("'=1+1");
			expect(escapeCsvField('+cmd|')).toBe("'+cmd|");
			expect(escapeCsvField('-12345')).toBe("'-12345");
			expect(escapeCsvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
			expect(escapeCsvField('\tDDE(cmd)')).toBe("'\tDDE(cmd)");
			expect(escapeCsvField('\rDDE(cmd)')).toBe('"\'\rDDE(cmd)"'); // \r triggers quoting
		});

		it('leaves normal alphanumeric text and URLs untouched', () => {
			expect(escapeCsvField('https://example.com')).toBe('https://example.com');
			expect(escapeCsvField('my-custom-link')).toBe('my-custom-link');
			expect(escapeCsvField('100')).toBe('100');
			expect(escapeCsvField('true')).toBe('true');
		});

		it('properly quotes and escapes fields with commas and double quotes', () => {
			expect(escapeCsvField('hello,world')).toBe('"hello,world"');
			expect(escapeCsvField('hello "world"')).toBe('"hello ""world"""');
			expect(escapeCsvField('=hello,world')).toBe('"\'=hello,world"');
			expect(escapeCsvField('\tDDE("cmd")')).toBe('"\'\tDDE(""cmd"")"');
		});
	});

	describe('toCsv', () => {
		it('generates CRLF-separated CSV with formula-safe rows', () => {
			const data = [
				['url', 'title', 'code'],
				['https://example.com', "=cmd|' /C calc'!A0", 'calc-code'],
				['https://google.com', 'Google', 'google-link'],
			];

			const csv = toCsv(data);
			expect(csv).toContain('url,title,code\r\n');
			expect(csv).toContain("https://example.com,'=cmd|' /C calc'!A0,calc-code\r\n");
			expect(csv).toContain('https://google.com,Google,google-link');
		});
	});

	describe('parseImportCsv', () => {
		it('parses valid CSV buffer into object records', () => {
			const csvBuffer = Buffer.from(
				'originalUrl,customCode,maxClicks\nhttps://example.com,my-code,100\nhttps://test.com,,50',
			);
			const records = parseImportCsv(csvBuffer);

			expect(records).toHaveLength(2);
			expect(records[0]).toEqual({
				originalUrl: 'https://example.com',
				customCode: 'my-code',
				maxClicks: '100',
			});
			expect(records[1]).toEqual({
				originalUrl: 'https://test.com',
				customCode: '',
				maxClicks: '50',
			});
		});
	});
});
