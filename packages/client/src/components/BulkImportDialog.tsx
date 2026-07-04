'use client';

import { useRef, useState } from 'react';
import { Upload, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BulkImportResponseType } from '@tiny-link/shared';
import { api, ApiError } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

interface BulkImportDialogProps {
	onImported: () => void;
}

export function BulkImportDialog({ onImported }: BulkImportDialogProps) {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [importing, setImporting] = useState(false);
	const [result, setResult] = useState<BulkImportResponseType | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const reset = () => {
		setFile(null);
		setResult(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) reset();
	};

	const handleImport = async () => {
		if (!file) return;
		setImporting(true);
		setResult(null);
		try {
			const data = await api.links.bulkImport(file);
			setResult(data);
			if (data.successCount > 0) {
				toast.success(`${data.successCount} link${data.successCount === 1 ? '' : 's'} imported`);
				onImported();
			}
			if (data.failureCount > 0) {
				toast.error(`${data.failureCount} row${data.failureCount === 1 ? '' : 's'} could not be imported`);
			}
		} catch (error) {
			console.error('Bulk import failed:', error);
			toast.error(error instanceof ApiError ? error.message : 'Bulk import failed');
		} finally {
			setImporting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger className={buttonVariants({ variant: 'outline', className: 'h-10 gap-2 px-5' })}>
				<Upload className="h-4 w-4" />
				Import
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Import Links from CSV</DialogTitle>
					<DialogDescription>
						CSV columns: <code>originalUrl</code> (required), <code>customCode</code>,{' '}
						<code>maxClicks</code>, <code>expiresAt</code> (all optional).
					</DialogDescription>
				</DialogHeader>

				<input
					ref={fileInputRef}
					type="file"
					accept=".csv,text/csv"
					onChange={(e) => {
						setFile(e.target.files?.[0] ?? null);
						setResult(null);
					}}
					className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/80"
				/>

				{result && (
					<div className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-border p-2.5 text-xs">
						<p className="mb-1.5 font-medium text-foreground">
							{result.successCount} succeeded, {result.failureCount} failed (of {result.totalRows})
						</p>
						{result.results.map((r) => (
							<div
								key={r.row}
								className={`flex items-center gap-1.5 ${r.success ? 'text-success' : 'text-destructive'}`}
							>
								{r.success ? (
									<CheckCircle2 className="h-3 w-3 shrink-0" />
								) : (
									<XCircle className="h-3 w-3 shrink-0" />
								)}
								<span className="truncate">
									Row {r.row}: {r.success ? r.shortCode : r.error}
								</span>
							</div>
						))}
					</div>
				)}

				<DialogFooter>
					<button
						type="button"
						onClick={() => handleOpenChange(false)}
						className={buttonVariants({ variant: 'outline' })}
					>
						Close
					</button>
					<button
						type="button"
						onClick={handleImport}
						disabled={!file || importing}
						className={buttonVariants({ variant: 'default' })}
					>
						{importing ? 'Importing...' : 'Upload'}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
