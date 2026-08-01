const API_BASE_URL = "http://localhost:5000";


async function request(
    path,
    options = {}
) {

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


    const response =
        await fetch(
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


export function apiPost(
    path,
    body
) {

    return request(path, {
        method: "POST",
        body: JSON.stringify(body)
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
