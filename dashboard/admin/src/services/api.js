const API_URL = "https://jley-xmd-api.onrender.com";

export async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("adminToken");

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token && {
                    Authorization: `Bearer ${token}`
                }),

                ...options.headers
            }
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The API returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.message || "API request failed."
        );
    }

    return data;
}


export async function adminLogin(email, password) {

    return apiRequest(
        "/api/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password
            })
        }
    );

}


export async function getAdminDashboard() {

    return apiRequest(
        "/api/admin/dashboard"
    );

}


export async function getAdminClients() {

    return apiRequest(
        "/api/admin/clients"
    );

}
