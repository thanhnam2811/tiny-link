export type AppErrorCode =
	| 'LINK_NOT_FOUND'
	| 'LINK_GONE'
	| 'LINK_CODE_CONFLICT'
	| 'RATE_LIMIT_EXCEEDED'
	| 'VALIDATION_ERROR'
	| 'INTERNAL_ERROR';

export class AppError extends Error {
	readonly statusCode: number;
	readonly code: AppErrorCode;

	constructor(statusCode: number, code: AppErrorCode, message: string) {
		super(message);
		this.name = 'AppError';
		this.statusCode = statusCode;
		this.code = code;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
