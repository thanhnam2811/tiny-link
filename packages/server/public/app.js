/* global Chart */

// --- DOM Elements ---
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Create Elements
const advancedToggle = document.getElementById('advanced-toggle');
const advancedSettings = document.getElementById('advanced-settings');
const createForm = document.getElementById('create-form');
const createBtn = document.getElementById('create-btn');
const createSpinner = document.getElementById('create-spinner');
const resultCard = document.getElementById('result-card');
const resultLinkElem = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const resultPasswordMsg = document.getElementById('result-password-msg');

// Analytics Elements
const fetchStatsBtn = document.getElementById('fetch-stats-btn');
const statsCodeInput = document.getElementById('stats-code');
const statsLoading = document.getElementById('stats-loading');
const statsDashboard = document.getElementById('stats-dashboard');
const statsTitle = document.getElementById('stats-title');
const statsOriginal = document.getElementById('stats-original');
const statsClicks = document.getElementById('stats-clicks');

/// Dynamically set prefixes to the current host
document.querySelectorAll('.prefix').forEach((el) => {
	el.textContent = window.location.host + '/';
});

let countryChartInstance = null;
let cityChartInstance = null;

// --- Tab Switching ---
tabs.forEach((tab) => {
	tab.addEventListener('click', () => {
		tabs.forEach((t) => {
			t.classList.remove('active', 'text-brand-500', 'border-brand-500');
			t.classList.add('text-slate-400', 'border-transparent');
		});
		tabContents.forEach((c) => c.classList.add('hidden'));
		tabContents.forEach((c) => c.classList.remove('block'));

		tab.classList.remove('text-slate-400', 'border-transparent');
		tab.classList.add('active', 'text-brand-500', 'border-brand-500');

		const target = document.getElementById(tab.dataset.tab);
		target.classList.remove('hidden');
		setTimeout(() => target.classList.add('block'), 10);
	});
});

// --- Advanced Settings Toggle ---
const chevron = document.getElementById('advanced-chevron');
advancedToggle.addEventListener('click', () => {
	chevron.classList.toggle('rotate-180');
	advancedSettings.classList.toggle('hidden');
});

// --- Create Link Logic ---
createForm.addEventListener('submit', async (e) => {
	e.preventDefault();

	createBtn.disabled = true;
	createSpinner.classList.remove('hidden');
	createBtn.querySelector('span').textContent = 'Shortening...';
	resultCard.classList.add('hidden');

	const payload = {
		originalUrl: document.getElementById('originalUrl').value,
		customCode: document.getElementById('customCode').value || undefined,
		password: document.getElementById('password').value || undefined,
	};

	const maxClicks = document.getElementById('maxClicks').value;
	if (maxClicks) payload.maxClicks = parseInt(maxClicks, 10);

	const expiresAt = document.getElementById('expiresAt').value;
	if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

	try {
		const res = await fetch('/api/links', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (!res.ok) throw new Error(data.message || data.error || 'Failed to create link');

		resultLinkElem.href = data.shortUrl;
		resultLinkElem.textContent = data.shortUrl;
		resultCard.classList.remove('hidden');

		// The container isn't flex until it's unhidden, but fastify is serving HTML changes nicely
		// Add light entrance animation handling if needed

		if (payload.password) {
			resultPasswordMsg.classList.remove('hidden');
			resultPasswordMsg.classList.add('flex');
		} else {
			resultPasswordMsg.classList.add('hidden');
			resultPasswordMsg.classList.remove('flex');
		}

		showToast('Link created successfully!', 'success');
		createForm.reset();
		chevron.classList.remove('rotate-180');
		advancedSettings.classList.add('hidden');
	} catch (err) {
		showToast(err.message, 'error');
	} finally {
		createBtn.disabled = false;
		createSpinner.classList.add('hidden');
		createBtn.querySelector('span').textContent = 'Shorten Magic 🌟';
	}
});

// --- Copy Button Logic ---
copyBtn.addEventListener('click', async () => {
	try {
		await navigator.clipboard.writeText(resultLinkElem.href);
		const originalText = copyBtn.textContent;
		copyBtn.textContent = 'Copied!';
		copyBtn.classList.replace('bg-slate-800', 'bg-emerald-600');
		copyBtn.classList.replace('hover:bg-slate-700', 'hover:bg-emerald-500');
		copyBtn.classList.replace('text-slate-300', 'text-white');

		setTimeout(() => {
			copyBtn.textContent = originalText;
			copyBtn.classList.replace('bg-emerald-600', 'bg-slate-800');
			copyBtn.classList.replace('hover:bg-emerald-500', 'hover:bg-slate-700');
			copyBtn.classList.replace('text-white', 'text-slate-300');
		}, 2000);
	} catch (err) {
		showToast(err.message || 'Failed to copy to clipboard', 'error');
	}
});

// --- Analytics Logic ---
fetchStatsBtn.addEventListener('click', async () => {
	const code = statsCodeInput.value.trim();
	if (!code) {
		showToast('Please enter a short code', 'error');
		return;
	}

	statsDashboard.classList.add('hidden');
	statsLoading.classList.remove('hidden');
	statsLoading.classList.add('flex');
	fetchStatsBtn.disabled = true;

	try {
		const res = await fetch(`/api/stats/${code}`);
		const data = await res.json();

		if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');

		statsTitle.textContent = `/${data.shortCode}`;
		statsOriginal.href = data.originalUrl;
		statsOriginal.textContent = data.originalUrl;

		animateValue(statsClicks, 0, data.totalClicks, 1000);
		renderCharts(data.geo);

		statsLoading.classList.add('hidden');
		statsLoading.classList.remove('flex');
		statsDashboard.classList.remove('hidden');
	} catch (err) {
		statsLoading.classList.add('hidden');
		statsLoading.classList.remove('flex');
		showToast(err.message, 'error');
	} finally {
		fetchStatsBtn.disabled = false;
	}
});

function animateValue(obj, start, end, duration) {
	let startTimestamp = null;
	const step = (timestamp) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		obj.innerHTML = Math.floor(progress * (end - start) + start);
		if (progress < 1) window.requestAnimationFrame(step);
	};
	window.requestAnimationFrame(step);
}

// --- Chart.js Integration ---
Chart.defaults.color = '#94A3B8';
Chart.defaults.font.family = 'Inter';

function renderCharts(geoData) {
	if (countryChartInstance) countryChartInstance.destroy();
	if (cityChartInstance) cityChartInstance.destroy();

	const countryCtx = document.getElementById('countryChart').getContext('2d');
	const cityCtx = document.getElementById('cityChart').getContext('2d');

	const countryLabels = Object.keys(geoData.countries);
	const countryData = Object.values(geoData.countries);

	const cityEntries = Object.entries(geoData.cities)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);
	const cityLabels = cityEntries.map((e) => (e[0] == 'Unknown' ? 'Other' : e[0]));
	const cityData = cityEntries.map((e) => e[1]);

	const vibrantPalette = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#F43F5E'];

	countryChartInstance = new Chart(countryCtx, {
		type: 'doughnut',
		data: {
			labels: countryLabels.length ? countryLabels : ['No Data'],
			datasets: [
				{
					data: countryData.length ? countryData : [1],
					backgroundColor: countryData.length ? vibrantPalette : ['#334155'],
					borderWidth: 0,
					hoverOffset: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { position: 'bottom' } },
			cutout: '70%',
		},
	});

	cityChartInstance = new Chart(cityCtx, {
		type: 'bar',
		data: {
			labels: cityLabels.length ? cityLabels : ['No Data'],
			datasets: [
				{
					label: 'Clicks',
					data: cityData.length ? cityData : [0],
					backgroundColor: vibrantPalette[1],
					borderRadius: 4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
				x: { grid: { display: false } },
			},
			plugins: { legend: { display: false } },
		},
	});
}

// --- Toast System ---
function showToast(message, type = 'success') {
	const container = document.getElementById('toast-container');
	const toast = document.createElement('div');

	const baseClasses =
		'px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 transform translate-y-4 opacity-0 flex items-center gap-2';
	const typeClasses =
		type === 'success'
			? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/50'
			: 'bg-rose-500/20 text-rose-100 border-rose-500/50';

	toast.className = `${baseClasses} ${typeClasses}`;
	toast.textContent = message;

	container.appendChild(toast);

	// Trigger entrance animation
	requestAnimationFrame(() => {
		toast.classList.remove('translate-y-4', 'opacity-0');
		toast.classList.add('translate-y-0', 'opacity-100');
	});

	setTimeout(() => {
		toast.classList.remove('translate-y-0', 'opacity-100');
		toast.classList.add('translate-y-4', 'opacity-0');
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}
