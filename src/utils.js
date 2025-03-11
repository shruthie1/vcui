import axios from 'axios';

export async function fetchWithTimeout(resource, options = {}, sendErr = true, maxRetries = 1) {
    options.timeout = options.timeout || 50000;
    options.method = options.method || 'GET';

    const fetchWithProtocol = async (url, version) => {
        const source = axios.CancelToken.source();
        const id = setTimeout(() => {
            source.cancel(`Request timed out after ${options.timeout}ms`);
        }, options.timeout);

        try {
            const response = await axios({
                ...options,
                url,
                headers: { 'Content-Type': 'application/json' },
                cancelToken: source.token,
                family: version
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            console.log(`Error at URL (IPv${version}): `, url);
            parseError(error);
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message, url);
                return undefined;
            }
            throw error; // Rethrow the error to handle retry logic outside
        }
    };

    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
        try {
            // First try with IPv4
            const responseIPv4 = await fetchWithProtocol(resource, 4);
            if (responseIPv4) return responseIPv4;

            // If IPv4 fails, try with IPv6
            const responseIPv6 = await fetchWithProtocol(resource, 6);
            if (responseIPv6) return responseIPv6;
        } catch (error) {
            const errorDetails = parseError(error);
            if (retryCount < maxRetries) {
                console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
            } else {
                console.log(`All ${maxRetries + 1} retries failed for ${resource}`);
                if (sendErr && error.code !== "ECONNABORTED" && error.code !== "ETIMEDOUT" && !errorDetails.message.toLowerCase().includes('too many requests') && !axios.isCancel(error)) {
                    try {
                        await axios.get(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`All ${maxRetries + 1} retries failed for ${resource}\n${parseError(error).message}\nCode:${error.code}`)}`);
                    } catch (error) {
                        console.log(error);
                    }
                }
                return undefined;
            }
        }
    }
}

export function parseError(
    err,
    prefix,
) {
    const status =
        err.response?.data?.status || err.response?.status || err.status;
    const message =
        err.response?.data?.message ||
        err.response?.message ||
        err.response?.statusText ||
        err.message ||
        err.response?.data;
    const error = err.response?.data?.error || err.response?.error || err.name;
    const msg = prefix
        ? `${prefix}::${message}` : message;
    return { status, message: msg, error };
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function encodeForTelegram(message) {
    return encodeURIComponent(message)
        .replace(/\*/g, "%2A")  // Encode `*`
        .replace(/\[/g, "%5B")  // Encode `[`
        .replace(/\]/g, "%5D")  // Encode `]`
        .replace(/\(/g, "%28")  // Encode `(`
        .replace(/\)/g, "%29"); // Encode `)`
}
