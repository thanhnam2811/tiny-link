'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { LinkIcon } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useLinkForm } from '@/hooks/useLinkForm';
import { LinkAdvancedOptions } from '@/components/LinkAdvancedOptions';

interface LinkShortenerFormProps {
	disabled: boolean;
	onSuccess: (shortUrl: string) => void;
}

export function LinkShortenerForm({ disabled, onSuccess }: LinkShortenerFormProps) {
	const {
		control,
		handleSubmit,
		onSubmit,
		urlValue,
		loading,
		showPassword,
		setShowPassword,
		showPasswordConfirm,
		setShowPasswordConfirm,
		host,
	} = useLinkForm(onSuccess);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={`flex flex-col gap-6 transition-opacity duration-300 ${disabled ? 'opacity-40' : ''}`}
		>
			<fieldset disabled={disabled} aria-busy={disabled} className="contents border-0 p-0 m-0 min-w-0">
				<Controller
					name="url"
					control={control}
					render={({ field, fieldState }) => (
						<Field className="w-full text-left" data-invalid={fieldState.invalid}>
							<FieldLabel className="text-sm font-heading font-semibold ml-1 mb-1">
								Shorten a long link
							</FieldLabel>
							<div className="relative flex flex-col sm:flex-row gap-3">
								<InputGroup className="h-14 w-full bg-background/50 backdrop-blur-sm group-data-[invalid=true]:ring-destructive group-focus-within/field:ring-1 focus-within:ring-primary transition-all border-border rounded-xl shadow-sm">
									<InputGroupAddon className="pl-3 text-muted-foreground">
										<LinkIcon className="h-5 w-5" />
									</InputGroupAddon>
									<InputGroupInput
										{...field}
										placeholder="Paste long URL..."
										className="text-base font-sans placeholder:text-muted-foreground/60 border-0 focus-visible:ring-0 px-2"
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
									size="xl"
									className={`w-full sm:w-auto font-heading font-bold transition-all rounded-xl z-10 ${
										!loading && urlValue
											? 'bg-primary hover:bg-primary/90 text-primary-foreground hover:-translate-y-0.5'
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
							<AccordionTrigger className="px-3 py-3 text-sm font-heading font-semibold text-muted-foreground hover:text-foreground hover:no-underline hover:bg-muted/10 transition-colors">
								<div className="flex items-center justify-between w-full">
									<span className="flex items-center gap-2">Advanced Options</span>
									<span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md mr-2 uppercase tracking-widest">
										Optional
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-5 pb-5 pt-3 flex flex-col gap-6 border-t border-border/30">
								<LinkAdvancedOptions
									control={control}
									loading={loading}
									host={host}
									showPassword={showPassword}
									setShowPassword={setShowPassword}
									showPasswordConfirm={showPasswordConfirm}
									setShowPasswordConfirm={setShowPasswordConfirm}
								/>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</fieldset>
		</form>
	);
}
