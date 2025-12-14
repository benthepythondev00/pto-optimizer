/**
 * Structured logging utility for production observability
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	userId?: string;
	customerId?: string;
	action?: string;
	ip?: string;
	userAgent?: string;
	[key: string]: unknown;
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
}

function formatLog(entry: LogEntry): string {
	return JSON.stringify(entry);
}

export const logger = {
	debug(message: string, context?: LogContext) {
		if (process.env.NODE_ENV !== 'production') {
			console.debug(formatLog({
				timestamp: new Date().toISOString(),
				level: 'debug',
				message,
				context
			}));
		}
	},

	info(message: string, context?: LogContext) {
		console.log(formatLog({
			timestamp: new Date().toISOString(),
			level: 'info',
			message,
			context
		}));
	},

	warn(message: string, context?: LogContext) {
		console.warn(formatLog({
			timestamp: new Date().toISOString(),
			level: 'warn',
			message,
			context
		}));
	},

	error(message: string, error?: unknown, context?: LogContext) {
		const errorDetails = error instanceof Error 
			? { errorMessage: error.message, errorStack: error.stack }
			: { errorDetails: String(error) };
		
		console.error(formatLog({
			timestamp: new Date().toISOString(),
			level: 'error',
			message,
			context: { ...context, ...errorDetails }
		}));
	}
};
