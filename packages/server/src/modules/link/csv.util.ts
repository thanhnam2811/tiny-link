import { parse } from 'csv-parse/sync';

export function parseImportCsv(buffer: Buffer): Record<string, string>[] {
	return parse(buffer, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
	}) as Record<string, string>[];
}

function escapeCsvField(field: string): string {
	if (/[",\n\r]/.test(field)) {
		return `"${field.replace(/"/g, '""')}"`;
	}
	return field;
}

export function toCsv(rows: string[][]): string {
	return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
