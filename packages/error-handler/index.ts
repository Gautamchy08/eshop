export class AppError extends Error {

    public readonly statusCode: number;
    public readonly isOprational: boolean;
    public readonly details?:any;


    constructor(message: string, statusCode: number,isOperational:true, details?:any) {
        super(message);
        this.statusCode = statusCode;
        this.isOprational = isOperational;
        this.details = details;
        // Maintains proper stack trace so that we know where error occurred in which file and line
        Error.captureStackTrace(this);
}
}
  

// not found error

export class NotFoundError extends AppError {
    // bydefault message if none provided
    constructor(message: string = 'Not Found') {
        super(message, 404,true);
    }
}

// validation errror (use for joi/zod/react-hook-form validation errors)

export class ValidationError extends AppError {
    constructor(message: string = 'Validation Error', details?:any) {
        super(message, 400,true, details);
    }
}

// authentication error

export class AuthenticationError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401,true);
    }
}

// forbidden error  (for insufficient permissions)

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403,true);
    }   
}

// database error (for mongodb postgres etc)

export class DatabaseError extends AppError {
    constructor(message: string = 'Database Error') {
        super(message, 500,true);
    }
}

// rate limit error (if user exceeds rate limit)

export class RateLimitError extends AppError {
    constructor(message: string = 'Too Many Requests please try again later.') {
        super(message, 429,true);
    }
}

