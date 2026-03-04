abstract class AppError extends Error {
	readonly timestamp: Date;
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = this.constructor.name;
		this.timestamp = new Date();
	}
}

interface DBErrorOptions extends ErrorOptions {
	location: string;
	field?: string;
	statusCode?: number;
}

export class DBError extends AppError {
	location: string;
	statusCode: number;
	field?: string;

	constructor(message: string, options: DBErrorOptions) {
		super(message, { cause: options.cause });
		this.name = this.constructor.name;
		this.statusCode = options.statusCode ?? 500;
		this.location = options.location;
		this.field = options.field;
	}
}
