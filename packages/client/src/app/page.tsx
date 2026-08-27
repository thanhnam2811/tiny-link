import { HealthGate } from '@/components/HealthGate';
import { Zap, Shield, BarChart2, Globe } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
	const t = await getTranslations('home');

	const FEATURES = [
		{
			icon: Zap,
			title: t('features.lightning.title'),
			description: t('features.lightning.description'),
		},
		{
			icon: BarChart2,
			title: t('features.analytics.title'),
			description: t('features.analytics.description'),
		},
		{
			icon: Shield,
			title: t('features.security.title'),
			description: t('features.security.description'),
		},
		{
			icon: Globe,
			title: t('features.global.title'),
			description: t('features.global.description'),
		},
	];

	return (
		<main className="flex min-h-screen flex-col items-center px-4 pb-24 relative overflow-hidden bg-background">
			{/* Hero Section */}
			<section className="w-full max-w-2xl flex flex-col items-center gap-6 text-center mt-16 mb-10 z-10">
				<h1 className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 text-balance text-5xl sm:text-[4rem] font-heading font-black leading-[1.05] tracking-tight text-foreground">
					{t('heroTitle1')} <br className="hidden sm:block" />
					<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">
						{t('heroTitle2')}
					</span>
				</h1>

				<p
					className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 text-base sm:text-lg text-muted-foreground max-w-[540px] font-sans font-medium leading-relaxed"
					style={{ animationDelay: '80ms' }}
				>
					{t('heroSubtitle')}
				</p>
			</section>

			{/* Main Form Card */}
			<HealthGate />

			{/* Bento-grid Feature Section */}
			<section className="w-full max-w-2xl mt-12 z-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{FEATURES.map((feature, i) => (
						<div
							key={feature.title}
							className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:hover:-translate-y-1 transition-transform glass-subtle rounded-lg p-5 flex gap-4 items-start cursor-default"
							style={{ animationDelay: `${(i + 3) * 80}ms` }}
						>
							<div className="p-2.5 rounded-md shrink-0 bg-primary/10">
								<feature.icon className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-heading font-bold text-foreground text-sm mb-1">{feature.title}</h3>
								<p className="text-xs text-muted-foreground leading-relaxed font-sans">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
