import { parse } from 'csv-parse/sync';

export function parseImportCsv(buffer: Buffer): Record<string, string>[] {
	return parse(buffer, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
	}) as Record<string, string>[];
}

export function escapeCsvField(field: string): string {
	let sanitized = field;
	// Prefix formula trigger characters (=, +, -, @, \t, \r) with a single quote to prevent spreadsheet formula injection
	if (/^[=+\-@\t\r]/.test(sanitized)) {
		sanitized = `'${sanitized}`;
	}
	if (/[",\n\r]/.test(sanitized)) {
		return `"${sanitized.replace(/"/g, '""')}"`;
	}
	return sanitized;
}

export function toCsv(rows: string[][]): string {
	return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
