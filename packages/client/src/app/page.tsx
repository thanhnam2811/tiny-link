'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, ApiError } from '@/lib/api';
import { CreateLinkBodyType, ERROR_MESSAGES } from '@tiny-link/shared';
import { format } from 'date-fns';
import {
	CalendarIcon,
	Check,
	Copy,
	Download,
	Eye,
	EyeOff,
	LinkIcon,
	Loader2,
	Minus,
	Plus,
	PlusCircle,
	BarChart2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z
	.object({
		url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
		customCode: z
			.string()
			.optional()
			.refine((val) => !val || /^[a-zA-Z0-9-_]+$/.test(val), {
				message: 'Custom alias can only contain letters, numbers, hyphens, and underscores',
			}),
		password: z.string().optional(),
		passwordConfirm: z.string().optional(),
		maxClicks: z.union([z.number().min(1, 'Must be at least 1'), z.literal('')]).optional(),
		expiresAt: z.date().optional(),
	})
	.refine(
		(data) => {
			if (data.password && data.password !== data.passwordConfirm) {
				return false;
			}
			return true;
		},
		{
			message: 'Passwords do not match',
			path: ['passwordConfirm'],
		},
	);

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [shortUrl, setShortUrl] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [host, setHost] = useState('');
	const [serverStatus, setServerStatus] = useState<'warming' | 'ready' | 'error'>('warming');

	const { handleSubmit, control, watch, reset, setFocus } = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: '',
			customCode: '',
			password: '',
			passwordConfirm: '',
			maxClicks: '',
		},
	});

	const urlValue = watch('url');

	useEffect(() => {
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
			setHost(new URL(apiUrl).host);
		} catch {
			setHost(window.location.host);
		}
	}, []);

	// Server Warmup Polling Logic
	useEffect(() => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
		const healthUrl = `${apiUrl.replace(/\/api\/?$/, '')}/healthz`;
		let attempts = 0;
		const maxAttempts = 30; // 30 attempts * 2s = 60s max
		const abortController = new AbortController();

		const pingServer = async () => {
			try {
				const response = await fetch(healthUrl, {
					signal: abortController.signal,
					// Ensure we're not getting a cached response
					headers: { 'Cache-Control': 'no-cache' },
				});
				if (response.ok) {
					setServerStatus('ready');
					return true;
				}
			} catch (err) {
				// Avoid throwing on AbortError, it's expected on cleanup
				if (err instanceof Error && err.name === 'AbortError') return false;
			}
			return false;
		};

		const poll = setInterval(async () => {
			if (serverStatus === 'ready' || serverStatus === 'error') {
				clearInterval(poll);
				return;
			}

			attempts++;
			if (attempts >= maxAttempts) {
				setServerStatus('error');
				clearInterval(poll);
				return;
			}

			const isReady = await pingServer();
			if (isReady) {
				clearInterval(poll);
			}
		}, 2000);

		// Initial ping
		pingServer().then((isReady) => {
			if (isReady) clearInterval(poll);
		});

		// Cleanup function to clear interval and abort pending fetch
		return () => {
			clearInterval(poll);
			abortController.abort();
		};
	}, [serverStatus]);

	const onSubmit = async (values: FormValues) => {
		setLoading(true);
		setShortUrl(null);

		const payload: CreateLinkBodyType = { originalUrl: values.url };
		if (values.customCode) payload.customCode = values.customCode.trim();
		if (values.password) payload.password = values.password.trim();
		if (values.maxClicks && typeof values.maxClicks === 'number') payload.maxClicks = values.maxClicks;
		if (values.expiresAt) payload.expiresAt = values.expiresAt.toISOString();

		try {
			const response = await api.links.create(payload);
			setShortUrl(response.shortUrl);
			toast.success('Link Shortened successfully!');
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.code === ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
					toast.error('Whoa there! You are creating links too fast.');
				} else if (err.code === ERROR_MESSAGES.LINK_CODE_CONFLICT) {
					toast.error('Custom code already taken. Please pick a different one.');
				} else {
					toast.error(`Failed to create link: ${err.message}`);
				}
			} else {
				toast.error('Network error. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = () => {
		if (shortUrl) {
			navigator.clipboard.writeText(shortUrl);
			setIsCopied(true);
			toast.success('Copied to clipboard!');
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center p-6 sm:p-24 relative overflow-hidden bg-background">
			<div className="z-10 w-full max-w-2xl flex flex-col items-center gap-6 text-center mt-12 mb-10">
				<div className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-foreground/80 tracking-wide">
					<span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
					TinyLink
				</div>
				<h1 className="text-5xl sm:text-[4rem] font-[800] leading-[1.1] tracking-tight text-foreground font-[family-name:var(--font-inter-tight)]">
					Shorten your links. <br className="hidden sm:block" />
					<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-extrabold pb-1">
						Track everything.
					</span>
				</h1>
				<p className="text-base sm:text-lg text-muted-foreground max-w-[540px] font-sans font-medium leading-relaxed">
					A lightning-fast URL shortener built for power users. <br className="hidden sm:block" />
					Enter your long URL below to get started.
				</p>
			</div>

			<Card className="w-full max-w-2xl border-border bg-card shadow-sm rounded-2xl overflow-hidden relative">
				<CardContent className="p-6 sm:p-8">
					{serverStatus !== 'ready' && !shortUrl && (
						<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-300">
							<div className="bg-background border border-border/50 shadow-lg rounded-xl p-6 flex flex-col items-center gap-3 max-w-[280px] text-center">
								{serverStatus === 'warming' ? (
									<>
										<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
										<p className="text-sm font-medium text-foreground">Waking up server...</p>
										<p className="text-xs text-muted-foreground leading-relaxed">
											This might take a few seconds as the free-tier backend spins up.
										</p>
									</>
								) : (
									<>
										<div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
											<Minus className="w-5 h-5" />
										</div>
										<p className="text-sm font-medium text-foreground">Server Unavailable</p>
										<p className="text-xs text-muted-foreground leading-relaxed">
											Server is undergoing maintenance. Please try again later.
										</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-2 w-full h-8 text-xs"
											onClick={() => {
												setServerStatus('warming');
											}}
										>
											Retry
										</Button>
									</>
								)}
							</div>
						</div>
					)}
					{!shortUrl ? (
						<form
							onSubmit={handleSubmit(onSubmit)}
							className={`flex flex-col gap-6 transition-opacity duration-300 ${serverStatus !== 'ready' ? 'opacity-40 pointer-events-none select-none' : ''}`}
						>
							<Controller
								name="url"
								control={control}
								render={({ field, fieldState }) => (
									<Field className="w-full text-left" data-invalid={fieldState.invalid}>
										<FieldLabel className="text-sm font-semibold ml-1 mb-1">
											Shorten a long link
										</FieldLabel>
										<div className="relative flex flex-col sm:flex-row gap-3">
											<InputGroup className="h-14 w-full bg-background group-data-[invalid=true]:ring-destructive group-focus-within/field:ring-1 focus-within:ring-blue-500 transition-all border-border rounded-xl shadow-sm">
												<InputGroupAddon className="pl-3 text-muted-foreground">
													<LinkIcon className="h-5 w-5" />
												</InputGroupAddon>
												<InputGroupInput
													{...field}
													placeholder="Paste long URL..."
													className="text-base placeholder:text-muted-foreground/60 border-0 focus-visible:ring-0 px-2"
													autoComplete="off"
													autoFocus
													disabled={loading}
													aria-invalid={fieldState.invalid}
												/>
												<div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-60">
													<kbd className="bg-muted px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-border">
														↵
													</kbd>
												</div>
											</InputGroup>
											<Button
												type="submit"
												className={`h-14 w-full sm:w-auto px-7 font-semibold text-base transition-all rounded-xl z-10 ${
													!loading && urlValue
														? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white hover:-translate-y-0.5'
														: 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
												}`}
												disabled={loading || !urlValue}
											>
												{loading ? 'Shortening...' : 'Shorten'}
											</Button>
										</div>
										{fieldState.invalid && (
											<FieldError className="mt-1">{fieldState.error?.message}</FieldError>
										)}
									</Field>
								)}
							/>

							<div className="border border-border/40 rounded-xl bg-transparent overflow-hidden">
								<Accordion className="w-full">
									<AccordionItem value="advanced" className="border-b-0">
										<AccordionTrigger className="px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline hover:bg-muted/10 transition-colors">
											<div className="flex items-center justify-between w-full">
												<span className="flex items-center gap-2">Advanced Options</span>
												<span className="text-[11px] font-semibold px-2 py-0.5 bg-muted text-muted-foreground rounded-md mr-2 uppercase tracking-wider">
													Optional
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className="px-5 pb-5 pt-3 flex flex-col gap-6 border-t border-border/30">
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
												<Controller
													name="customCode"
													control={control}
													render={({ field, fieldState }) => (
														<Field data-invalid={fieldState.invalid}>
															<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
																Custom Alias
															</FieldLabel>
															<InputGroup className="h-11 bg-background/50 group-data-[invalid=true]:ring-destructive transition-all border-border shadow-sm">
																<InputGroupAddon className="text-foreground/60 p-0 pl-3 border-r-0 mr-0 pr-0">
																	{host ? `${host}/` : 'tinylink.com/'}
																</InputGroupAddon>
																<InputGroupInput
																	{...field}
																	placeholder="custom-alias"
																	className="text-sm border-0 focus-visible:ring-0 pl-0"
																	autoComplete="off"
																	disabled={loading}
																	aria-invalid={fieldState.invalid}
																/>
															</InputGroup>
															{fieldState.invalid && (
																<FieldError>{fieldState.error?.message}</FieldError>
															)}
														</Field>
													)}
												/>

												<Controller
													name="password"
													control={control}
													render={({ field, fieldState }) => (
														<Field data-invalid={fieldState.invalid}>
															<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
																Password Protection
															</FieldLabel>
															<InputGroup className="h-11 bg-background/50 group-data-[invalid=true]:ring-destructive transition-all border-border shadow-sm">
																<InputGroupInput
																	{...field}
																	type={showPassword ? 'text' : 'password'}
																	placeholder="Secure with password..."
																	autoComplete="new-password"
																	aria-invalid={fieldState.invalid}
																/>
																<InputGroupAddon align="inline-end">
																	<InputGroupButton
																		type="button"
																		onClick={() => setShowPassword((p) => !p)}
																		variant="ghost"
																		size="icon-sm"
																	>
																		{showPassword ? <EyeOff /> : <Eye />}
																	</InputGroupButton>
																</InputGroupAddon>
															</InputGroup>
															{fieldState.invalid && (
																<FieldError>{fieldState.error?.message}</FieldError>
															)}
														</Field>
													)}
												/>

												<Controller
													name="passwordConfirm"
													control={control}
													render={({ field, fieldState }) => (
														<Field data-invalid={fieldState.invalid}>
															<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
																Confirm Password
															</FieldLabel>
															<InputGroup className="h-11 bg-background/50 group-data-[invalid=true]:ring-destructive transition-all border-border shadow-sm">
																<InputGroupInput
																	{...field}
																	type={showPasswordConfirm ? 'text' : 'password'}
																	placeholder="Confirm password..."
																	autoComplete="new-password"
																	aria-invalid={fieldState.invalid}
																/>
																<InputGroupAddon align="inline-end">
																	<InputGroupButton
																		type="button"
																		onClick={() =>
																			setShowPasswordConfirm((p) => !p)
																		}
																		variant="ghost"
																		size="icon-sm"
																	>
																		{showPasswordConfirm ? <EyeOff /> : <Eye />}
																	</InputGroupButton>
																</InputGroupAddon>
															</InputGroup>
															{fieldState.invalid && (
																<FieldError>{fieldState.error?.message}</FieldError>
															)}
														</Field>
													)}
												/>

												<Controller
													name="maxClicks"
													control={control}
													render={({ field, fieldState }) => (
														<Field data-invalid={fieldState.invalid}>
															<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
																Max Clicks Limit
															</FieldLabel>
															<InputGroup className="h-11 bg-background/50 group-data-[invalid=true]:ring-destructive transition-all border-border shadow-sm pr-1">
																<InputGroupInput
																	{...field}
																	onChange={(e) => {
																		const v = e.target.value;
																		field.onChange(v === '' ? '' : Number(v));
																	}}
																	value={field.value ?? ''}
																	type="number"
																	min="1"
																	placeholder="e.g. 100"
																	className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pl-3"
																	aria-invalid={fieldState.invalid}
																/>
																<InputGroupAddon
																	align="inline-end"
																	className="pl-0 gap-0"
																>
																	<InputGroupButton
																		type="button"
																		onClick={() => {
																			const val = parseInt(
																				(field.value as string) || '0',
																				10,
																			);
																			field.onChange(
																				isNaN(val) || val <= 1 ? '' : val - 1,
																			);
																		}}
																		variant="ghost"
																		size="icon-xs"
																		className="h-7 w-7 rounded-sm hover:bg-muted"
																	>
																		<Minus className="h-3 w-3" />
																	</InputGroupButton>
																	<InputGroupButton
																		type="button"
																		onClick={() => {
																			const val = parseInt(
																				(field.value as string) || '0',
																				10,
																			);
																			field.onChange(isNaN(val) ? 1 : val + 1);
																		}}
																		variant="ghost"
																		size="icon-xs"
																		className="h-7 w-7 rounded-sm hover:bg-muted ml-0.5"
																	>
																		<Plus className="h-3 w-3" />
																	</InputGroupButton>
																</InputGroupAddon>
															</InputGroup>
															{fieldState.invalid && (
																<FieldError>{fieldState.error?.message}</FieldError>
															)}
														</Field>
													)}
												/>

												<Controller
													control={control}
													name="expiresAt"
													render={({ field, fieldState }) => (
														<Field
															className="flex flex-col items-start gap-2"
															data-invalid={fieldState.invalid}
														>
															<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-full rounded-none border-0 bg-transparent p-0 flex">
																Expiration Date
															</FieldLabel>
															<Popover>
																<PopoverTrigger
																	render={
																		<Button
																			variant="outline"
																			className={`w-full h-11 justify-start text-left font-normal border-border bg-background/50 shadow-sm ${!field.value && 'text-muted-foreground'}`}
																			aria-invalid={fieldState.invalid}
																		/>
																	}
																>
																	<CalendarIcon className="mr-2 h-4 w-4" />
																	{field.value ? (
																		format(field.value, 'PPP HH:mm')
																	) : (
																		<span>Pick a date & time</span>
																	)}
																</PopoverTrigger>
																<PopoverContent
																	className="w-auto p-0 border-border"
																	align="start"
																>
																	<Calendar
																		mode="single"
																		selected={field.value}
																		onSelect={(date) => {
																			if (date) {
																				// Preserve existing time if a date is already selected
																				if (field.value) {
																					date.setHours(
																						field.value.getHours(),
																					);
																					date.setMinutes(
																						field.value.getMinutes(),
																					);
																				} else {
																					// Default to 23:59
																					date.setHours(23);
																					date.setMinutes(59);
																				}
																				field.onChange(date);
																			} else {
																				field.onChange(undefined);
																			}
																		}}
																		disabled={(date) =>
																			date <
																			new Date(new Date().setHours(0, 0, 0, 0))
																		}
																		initialFocus
																	/>
																	{field.value && (
																		<div className="p-3 border-t border-border flex items-center justify-between">
																			<Button
																				variant="secondary"
																				size="sm"
																				className="h-8 px-3 text-xs"
																				onClick={() =>
																					field.onChange(undefined)
																				}
																			>
																				Clear
																			</Button>
																			<div className="flex items-center gap-2">
																				<span className="text-sm font-medium">
																					Time
																				</span>
																				<InputGroup className="w-28 h-8">
																					<InputGroupInput
																						type="time"
																						className="text-sm text-center px-2"
																						value={format(
																							field.value,
																							'HH:mm',
																						)}
																						onChange={(e) => {
																							const timeStr =
																								e.target.value;
																							if (!timeStr) return;
																							const [hours, minutes] =
																								timeStr
																									.split(':')
																									.map(Number);
																							const newDate = new Date(
																								field.value as Date,
																							);
																							newDate.setHours(hours);
																							newDate.setMinutes(minutes);
																							field.onChange(newDate);
																						}}
																					/>
																				</InputGroup>
																			</div>
																		</div>
																	)}
																</PopoverContent>
															</Popover>
															{fieldState.invalid && (
																<FieldError>{fieldState.error?.message}</FieldError>
															)}
														</Field>
													)}
												/>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</div>
						</form>
					) : (
						<div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 relative">
							<div className="flex flex-col items-start gap-5 w-full">
								<div className="flex items-center gap-2 mb-1">
									<span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
										<Check className="w-4 h-4 stroke-[3]" />
									</span>
									<h2 className="text-lg font-bold text-foreground font-[family-name:var(--font-inter-tight)]">
										Link Shortened
									</h2>
								</div>

								<div className="w-full flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl bg-background border border-border gap-6 shadow-sm ring-1 ring-border/50">
									<div className="relative w-full text-center sm:text-left overflow-hidden">
										<a
											href={shortUrl}
											target="_blank"
											rel="noreferrer"
											className="relative z-10 text-xl sm:text-[22px] font-semibold text-foreground hover:text-blue-600 transition-colors truncate block font-sans"
										>
											{shortUrl.replace(/^https?:\/\//, '')}
										</a>
									</div>
									<div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
										<Button
											size="default"
											variant="secondary"
											onClick={() => {
												window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank');
											}}
											className="shrink-0 h-10 px-4 w-full sm:w-auto font-medium rounded-md transition-all gap-2 shadow-sm"
										>
											<BarChart2 className="h-4 w-4" /> Stats
										</Button>
										<Button
											size="default"
											onClick={handleCopy}
											className={`shrink-0 h-10 px-4 w-full sm:w-auto font-medium rounded-md transition-all gap-2 shadow-sm ${
												isCopied
													? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
													: 'bg-white hover:bg-gray-50 text-foreground border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800'
											}`}
										>
											{isCopied ? (
												<>
													<Check className="h-4 w-4" /> Copied!
												</>
											) : (
												<>
													<Copy className="h-4 w-4" /> Copy
												</>
											)}
										</Button>
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border/50 gap-4">
								<div className="flex items-center gap-5">
									<div className="p-2 bg-white rounded-lg border shadow-sm flex items-center justify-center relative group">
										<QRCodeSVG
											id="qr-code-svg"
											value={shortUrl}
											size={60}
											level="L"
											includeMargin={false}
											className="rounded-sm"
										/>
										<Button
											variant="secondary"
											size="icon-xs"
											type="button"
											className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full shadow-md z-10"
											onClick={() => {
												const svg = document.getElementById('qr-code-svg');
												if (!svg) return;
												const svgData = new XMLSerializer().serializeToString(svg);
												const blob = new Blob([svgData], {
													type: 'image/svg+xml;charset=utf-8',
												});
												const url = URL.createObjectURL(blob);
												const a = document.createElement('a');
												a.href = url;
												a.download = 'tinylink-qr.svg';
												a.click();
												URL.revokeObjectURL(url);
											}}
										>
											<Download className="h-3 w-3" />
										</Button>
									</div>
									<div className="flex flex-col text-sm text-muted-foreground justify-center my-auto">
										<span className="font-semibold text-foreground leading-tight">QR Code</span>
										<span className="mt-0.5 leading-tight">Scan to open the link</span>
									</div>
								</div>

								<Button
									variant="ghost"
									className="text-sm font-medium hover:bg-muted/50 rounded-lg text-muted-foreground w-full sm:w-auto flex items-center justify-center gap-2"
									onClick={() => {
										setShortUrl(null);
										reset();
										setTimeout(() => {
											setFocus('url');
											window.scrollTo({ top: 0, behavior: 'smooth' });
										}, 100);
									}}
								>
									<PlusCircle className="w-4 h-4" /> Shorten another
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
