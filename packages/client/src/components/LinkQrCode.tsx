'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { downloadSvgElement } from '@/lib/download';

interface LinkQrCodeProps {
	shortUrl: string;
	size?: number;
}

export function LinkQrCode({ shortUrl, size = 160 }: LinkQrCodeProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const shortCode = shortUrl.split('/').pop() || 'tinylink';

	const handleDownload = (format: 'svg' | 'png') => {
		if (!svgRef.current) return;
		downloadSvgElement(svgRef.current, `${shortCode}-qr.${format}`, format);
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="rounded-lg border bg-white p-3 shadow-sm">
				<QRCodeSVG ref={svgRef} value={shortUrl} size={size} level="L" marginSize={0} />
			</div>
			<div className="flex w-full gap-2">
				<Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload('png')}>
					Download PNG
				</Button>
				<Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload('svg')}>
					Download SVG
				</Button>
			</div>
		</div>
	);
}
