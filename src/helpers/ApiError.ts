import { ApiErrorInterface } from '@/types/ApiError';

function ApiError<T>(
    status: number,
    success: boolean,
    message: string,
    error?: string,
    errors?: {
        [key: string]: string[];
    },
    data?: T,
    stack?: string
): Response {
    const errorData: ApiErrorInterface = {
        status,
        success,
        message,
        error,
        errors,
        data,
        stack,
    };

    return Response.json(errorData, { status: status });
}

export default ApiError;
