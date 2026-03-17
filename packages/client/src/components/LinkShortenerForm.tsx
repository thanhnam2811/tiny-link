'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, ApiError } from '@/lib/api';
import { CreateLinkBodyType, ERROR_MESSAGES } from '@tiny-link/shared';
import { format } from 'date-fns';
import { CalendarIcon, Eye, EyeOff, LinkIcon, Minus, Plus, Clock } from 'lucide-react';
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

interface LinkShortenerFormProps {
	disabled: boolean;
	onSuccess: (shortUrl: string) => void;
}

export function LinkShortenerForm({ disabled, onSuccess }: LinkShortenerFormProps) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const [host, setHost] = useState('');

	const { handleSubmit, control, watch } = useForm<FormValues>({
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

	const onSubmit = async (values: FormValues) => {
		setLoading(true);

		const payload: CreateLinkBodyType = { originalUrl: values.url };
		if (values.customCode) payload.customCode = values.customCode.trim();
		if (values.password) payload.password = values.password.trim();
		if (values.maxClicks && typeof values.maxClicks === 'number') payload.maxClicks = values.maxClicks;
		if (values.expiresAt) payload.expiresAt = values.expiresAt.toISOString();

		try {
			const response = await api.links.create(payload);
			toast.success('Link Shortened successfully!');
			onSuccess(response.shortUrl);
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

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={`flex flex-col gap-6 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none select-none' : ''}`}
		>
			<Controller
				name="url"
				control={control}
				render={({ field, fieldState }) => (
					<Field className="w-full text-left" data-invalid={fieldState.invalid}>
						<FieldLabel className="text-sm font-semibold ml-1 mb-1">Shorten a long link</FieldLabel>
						<div className="relative flex flex-col sm:flex-row gap-3">
							<InputGroup className="h-14 w-full bg-background group-data-[invalid=true]:ring-destructive group-focus-within/field:ring-1 focus-within:ring-blue-500 transition-all border-border rounded-xl shadow-sm">
								<InputGroupAddon className="pl-3 text-muted-foreground">
									<LinkIcon className="h-5 w-5" />
								</InputGroupAddon>
								<InputGroupInput
									{...field}
									placeholder="Paste long URL..."
									className="text-base placeholder:text-muted-foreground/60 border-0 focus-visible:ring-0 px-2"
									autoComplete="nope"
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
						{fieldState.invalid && <FieldError className="mt-1">{fieldState.error?.message}</FieldError>}
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
							{/* Row 1: Alias and Max Clicks */}
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
												<InputGroupAddon className="text-foreground/60 p-0 pl-3 border-r-0 mr-0 pr-0 bg-muted/50 rounded-l-md pr-2 border-r border-border h-full flex items-center">
													{host ? `${host}/` : 'tinylink.com/'}
												</InputGroupAddon>
												<InputGroupInput
													{...field}
													placeholder="custom-alias"
													className="text-sm border-0 focus-visible:ring-0 pl-0"
													autoComplete="nope"
													disabled={loading}
													aria-invalid={fieldState.invalid}
												/>
											</InputGroup>
											{fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
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
													autoComplete="nope"
												/>
												<InputGroupAddon align="inline-end" className="pl-0 gap-0">
													<InputGroupButton
														type="button"
														onClick={() => {
															const val = parseInt((field.value as string) || '0', 10);
															field.onChange(isNaN(val) || val <= 1 ? '' : val - 1);
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
															const val = parseInt((field.value as string) || '0', 10);
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
											{fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
										</Field>
									)}
								/>
							</div>

							{/* Row 2: Password and Confirm Password */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
											{fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
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
														onClick={() => setShowPasswordConfirm((p) => !p)}
														variant="ghost"
														size="icon-sm"
													>
														{showPasswordConfirm ? <EyeOff /> : <Eye />}
													</InputGroupButton>
												</InputGroupAddon>
											</InputGroup>
											{fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
										</Field>
									)}
								/>
							</div>

							{/* Row 3: Expiration Date and Time */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
														format(field.value, 'PPP')
													) : (
														<span>Pick a date</span>
													)}
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0 border-border" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={(date) => {
															if (date) {
																if (field.value) {
																	date.setHours(
																		field.value.getHours(),
																		field.value.getMinutes(),
																		0,
																		0,
																	);
																} else {
																	date.setHours(23, 59, 0, 0);
																}
																field.onChange(date);
															} else {
																field.onChange(undefined);
															}
														}}
														disabled={(date) =>
															date < new Date(new Date().setHours(0, 0, 0, 0))
														}
														initialFocus
													/>
													{field.value && (
														<div className="p-3 border-t border-border flex items-center justify-between">
															<Button
																variant="secondary"
																size="sm"
																className="h-8 px-3 text-xs w-full"
																onClick={() => field.onChange(undefined)}
															>
																Clear Selection
															</Button>
														</div>
													)}
												</PopoverContent>
											</Popover>
											{fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
										</Field>
									)}
								/>

								{/* Time element controlled independently */}
								<Controller
									control={control}
									name="expiresAt"
									render={({ field }) => (
										<Field className="flex flex-col items-start gap-2">
											<FieldLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-full rounded-none border-0 bg-transparent p-0 flex">
												Expiration Time
											</FieldLabel>
											<InputGroup
												className={`h-11 w-full bg-background/50 transition-all border-border shadow-sm ${!field.value ? 'opacity-50 pointer-events-none' : ''}`}
											>
												<InputGroupAddon className="pl-3 text-muted-foreground text-sm border-r-0 mr-0 pr-0">
													<Clock className="w-4 h-4" />
												</InputGroupAddon>
												<InputGroupInput
													type="time"
													className="text-sm px-2 w-full bg-transparent border-0 focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
													value={field.value ? format(field.value, 'HH:mm') : ''}
													onChange={(e) => {
														const timeStr = e.target.value;
														if (!timeStr || !field.value) return;
														const [hours, minutes] = timeStr.split(':').map(Number);
														const newDate = new Date(field.value);
														newDate.setHours(hours, minutes, 0, 0);
														field.onChange(newDate);
													}}
													disabled={!field.value}
												/>
											</InputGroup>
										</Field>
									)}
								/>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</form>
	);
}
