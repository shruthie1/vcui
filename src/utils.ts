import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ErrorResponse {
    status?: number;
    message: string;
    error?: string;
}

type FetchOptions = AxiosRequestConfig & {
    timeout?: number;
    family?: number;
};

export async function fetchWithTimeout(
    resource: string,
    options: FetchOptions = {},
    sendErr: boolean = true,
    maxRetries: number = 1
): Promise<AxiosResponse | undefined> {
    options.timeout = options.timeout || 50000;
    options.method = options.method || 'GET';

    const fetchWithProtocol = async (url: string, version: number): Promise<AxiosResponse | undefined> => {
        const source = axios.CancelToken.source();
        const id = setTimeout(() => {
            source.cancel(`Request timed out after ${options.timeout}ms`);
        }, options.timeout);

        try {
            const response = await axios({
                ...options,
                url,
                headers: { 'Content-Type': 'application/json', ...options.headers },
                cancelToken: source.token,
                family: version
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            console.error(`Error at URL (IPv${version}): `, url);
            const parsedError = parseError(error as Error);
            console.error(parsedError);
            
            if (axios.isCancel(error)) {
                console.log('Request canceled:', (error as AxiosError).message, url);
                return undefined;
            }
            throw error;
        }
    };

    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
        try {
            // Try IPv4 first
            const responseIPv4 = await fetchWithProtocol(resource, 4);
            if (responseIPv4) return responseIPv4;

            // If IPv4 fails, try IPv6
            const responseIPv6 = await fetchWithProtocol(resource, 6);
            if (responseIPv6) return responseIPv6;
        } catch (error) {
            const errorDetails = parseError(error as Error);
            if (retryCount < maxRetries) {
                console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error(`All ${maxRetries + 1} retries failed for ${resource}`);
                if (sendErr && 
                    !(error as AxiosError).code?.match(/^(ECONNABORTED|ETIMEDOUT)$/) &&
                    !errorDetails.message.toLowerCase().includes('too many requests') && 
                    !axios.isCancel(error)) {
                    try {
                        await axios.get(
                            `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${
                                encodeForTelegram(
                                    `All ${maxRetries + 1} retries failed for ${resource}\n${errorDetails.message}\nCode:${(error as AxiosError).code}`
                                )
                            }`
                        );
                    } catch (reportError) {
                        console.error('Failed to report error:', reportError);
                    }
                }
                return undefined;
            }
        }
    }
    return undefined;
}

export function parseError(
    err: unknown,
    prefix?: string,
): ErrorResponse {
    if (!err) {
        return { message: 'Unknown error occurred' };
    }

    const axiosError = err as AxiosError;
    const status = 
        (axiosError.response?.data as any)?.status || 
        axiosError.response?.status ||
        (err as any).status;

    const message =
        (axiosError.response?.data as any)?.message ||
        axiosError.response?.statusText ||
        axiosError.message ||
        (err as any).message ||
        String(err);

    const error = 
        (axiosError.response?.data as any)?.error || 
        axiosError.name ||
        'Unknown Error';

    const msg = prefix ? `${prefix}::${message}` : message;
    
    return { status, message: msg, error };
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function encodeForTelegram(message: string): string {
    return encodeURIComponent(message)
        .replace(/\*/g, "%2A")  // Encode `*`
        .replace(/\[/g, "%5B")  // Encode `[`
        .replace(/\]/g, "%5D")  // Encode `]`
        .replace(/\(/g, "%28")  // Encode `(`
        .replace(/\)/g, "%29"); // Encode `)`
}
