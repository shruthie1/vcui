import axios from 'axios';

export async function fetchWithTimeout(url, config = {}, sendErr = true, maxRetries = 1) {
    const timeout = config?.timeout || 10000;

    for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
        try {
            const response = await axios({
                url,
                ...config,
                timeout,
            });
            return response;
        } catch (error) {
            if (sendErr) {
                console.log(`Error (${retryCount + 1}/${maxRetries + 1}): ${error} - ${url}`);
                if (error.code !== "ECONNABORTED" && !axios.isCancel(error)) {
                    await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`VideoCall: Failed | url: ${url}\n${retryCount + 1}/${maxRetries + 1}\nMethod:${config.method || "get"}\n${parseError(error).message}\nCode:${error.code}`)}`)
                }
            }

            if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            } else {
                console.error(`All ${maxRetries + 1} retries failed for ${url}`);
                if (error.code !== "ECONNABORTED" && !axios.isCancel(error)) {
                    await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`All ${maxRetries + 1} retries failed for ${url}\n${parseError(error).message}\nCode:${error.code}`)}`)
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