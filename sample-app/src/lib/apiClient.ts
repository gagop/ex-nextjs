import { TOKEN_EXPIRED_HEADER } from "./authTokens";

export type ApiFetchInit = RequestInit & { retryOnAuthError?: boolean };

async function attemptRefresh(): Promise<boolean> {
	try {
		const res = await fetch("/api/auth/refresh", {
			method: "POST",
			credentials: "include",
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchInit = {}): Promise<Response> {
	const { retryOnAuthError = true, ...rest } = init;
	const res = await fetch(input, {
		credentials: "include",
		...rest,
	});
	if (res.status === 401 && res.headers.get(TOKEN_EXPIRED_HEADER) === "1" && retryOnAuthError) {
		const refreshed = await attemptRefresh();
		if (refreshed) {
			return fetch(input, { credentials: "include", ...rest, retryOnAuthError: false } as ApiFetchInit);
		}
	}
	return res;
}

export async function apiJson<T>(input: RequestInfo | URL, init: ApiFetchInit = {}): Promise<T> {
	const res = await apiFetch(input, init);
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(text || `Request failed with status ${res.status}`);
	}
	return (await res.json()) as T;
}


