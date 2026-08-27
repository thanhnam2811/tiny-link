import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Eye, EyeOff, Minus, Plus, Clock } from 'lucide-react';
import { Controller, type Control } from 'react-hook-form';
import type { LinkFormValues } from '@/hooks/useLinkForm';

interface LinkAdvancedOptionsProps {
	control: Control<LinkFormValues>;
	loading: boolean;
	host: string;
	showPassword: boolean;
	setShowPassword: (fn: (prev: boolean) => boolean) => void;
	showPasswordConfirm: boolean;
	setShowPasswordConfirm: (fn: (prev: boolean) => boolean) => void;
}

export function LinkAdvancedOptions({
	control,
	loading,
	host,
	showPassword,
	setShowPassword,
	showPasswordConfirm,
	setShowPasswordConfirm,
}: LinkAdvancedOptionsProps) {
	return (
		<>
			{/* Row 1: Alias and Max Clicks */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<Controller
					name="customCode"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80">
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
							<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80">
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
										className="h-full w-10 md:h-7 md:w-7 md:my-auto rounded-sm hover:bg-muted"
										aria-label="Decrease max clicks limit"
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
										className="h-full w-10 md:h-7 md:w-7 md:my-auto rounded-sm hover:bg-muted ml-0.5"
										aria-label="Increase max clicks limit"
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
							<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80">
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
										className="h-full px-3"
										aria-label={showPassword ? 'Hide password' : 'Show password'}
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
							<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80">
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
										className="h-full px-3"
										aria-label={
											showPasswordConfirm ? 'Hide confirm password' : 'Show confirm password'
										}
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

			{/* Row 3: Expiration Date and Time — one Controller drives both fields */}
			<Controller
				control={control}
				name="expiresAt"
				render={({ field, fieldState }) => {
					const value = field.value instanceof Date ? field.value : undefined;
					return (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<Field className="flex flex-col items-start gap-2" data-invalid={fieldState.invalid}>
								<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80 w-full rounded-none border-0 bg-transparent p-0 flex">
									Expiration Date
								</FieldLabel>
								<Popover>
									<PopoverTrigger
										render={
											<Button
												variant="outline"
												className={`w-full h-11 justify-start text-left font-normal border-border bg-background/50 shadow-sm ${!value && 'text-muted-foreground'}`}
												aria-invalid={fieldState.invalid}
											/>
										}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{value ? format(value, 'PPP') : <span>Pick a date</span>}
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0 border-border" align="start">
										<Calendar
											mode="single"
											selected={value}
											onSelect={(date) => {
												if (date) {
													if (value) {
														date.setHours(value.getHours(), value.getMinutes(), 0, 0);
													} else {
														date.setHours(23, 59, 0, 0);
													}
													field.onChange(date);
												} else {
													field.onChange(undefined);
												}
											}}
											disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
											initialFocus
										/>
										{value && (
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

							<Field className="flex flex-col items-start gap-2">
								<FieldLabel className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground/80 w-full rounded-none border-0 bg-transparent p-0 flex">
									Expiration Time
								</FieldLabel>
								<InputGroup
									className={`h-11 w-full bg-background/50 transition-all border-border shadow-sm ${!value ? 'opacity-50 pointer-events-none' : ''}`}
								>
									<InputGroupAddon className="pl-3 text-muted-foreground text-sm border-r-0 mr-0 pr-0">
										<Clock className="w-4 h-4" />
									</InputGroupAddon>
									<InputGroupInput
										type="time"
										className="text-sm px-2 w-full bg-transparent border-0 focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
										value={value ? format(value, 'HH:mm') : ''}
										onChange={(e) => {
											const timeStr = e.target.value;
											if (!timeStr || !value) return;
											const [hours, minutes] = timeStr.split(':').map(Number);
											const newDate = new Date(value);
											newDate.setHours(hours, minutes, 0, 0);
											field.onChange(newDate);
										}}
										disabled={!value}
									/>
								</InputGroup>
							</Field>
						</div>
					);
				}}
			/>
		</>
	);
}
