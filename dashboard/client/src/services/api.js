
const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://jley-xmd-v2.onrender.com";

async function request(path, options = {}) {

    const token =
        localStorage.getItem("jley_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            ...options,
            headers
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {

        throw new Error(
            data?.message ||
            `API request failed: ${response.status}`
        );
    }

    return data;
}

export function apiGet(path) {

    return request(path, {
        method: "GET"
    });
}

export function apiPost(path, body = undefined) {

    const options = {
        method: "POST"
    };

    if (body !== undefined) {
        options.body =
            JSON.stringify(body);
    }

    return request(path, options);
}

export function apiPut(path, body = {}) {

    return request(path, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

export function apiDelete(path) {

    return request(path, {
        method: "DELETE"
    });
}

export function saveToken(token) {

    localStorage.setItem(
        "jley_token",
        token
    );
}

export function getToken() {

    return localStorage.getItem(
        "jley_token"
    );
}

export function clearToken() {

    localStorage.removeItem(
        "jley_token"
    );
}

