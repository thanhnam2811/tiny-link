export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function downloadSvgElement(svg: SVGSVGElement, filename: string, format: 'svg' | 'png' = 'svg') {
	const svgData = new XMLSerializer().serializeToString(svg);

	if (format === 'svg') {
		downloadBlob(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }), filename);
		return;
	}

	const width = Number(svg.getAttribute('width')) || svg.clientWidth || 256;
	const height = Number(svg.getAttribute('height')) || svg.clientHeight || 256;
	const svgUrl = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }));

	const image = new Image();
	image.onload = () => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			URL.revokeObjectURL(svgUrl);
			return;
		}
		// QR SVGs have a transparent background; flatten onto white before rasterizing to PNG.
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(image, 0, 0, width, height);
		URL.revokeObjectURL(svgUrl);
		canvas.toBlob((pngBlob) => {
			if (pngBlob) downloadBlob(pngBlob, filename);
		}, 'image/png');
	};
	image.src = svgUrl;
}
