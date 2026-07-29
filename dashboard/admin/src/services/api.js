
const API_URL = "https://jley-xmd-api.onrender.com";


export async function apiRequest(endpoint, options = {}) {

    const token =
        localStorage.getItem("adminToken");

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

        throw new Error(
            "The API returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "API request failed."
        );

    }


    return data;

}


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export async function adminLogin(
    email,
    password
) {

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


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export async function getAdminDashboard() {

    return apiRequest(
        "/api/admin/dashboard"
    );

}


/*
|--------------------------------------------------------------------------
| Clients
|--------------------------------------------------------------------------
*/

export async function getAdminClients() {

    return apiRequest(
        "/api/admin/clients"
    );

}


/*
|--------------------------------------------------------------------------
| Suspend Client
|--------------------------------------------------------------------------
*/

export async function suspendClient(
    clientId
) {

    return apiRequest(
        `/api/admin/clients/${clientId}/suspend`,
        {
            method: "PATCH"
        }
    );

}


/*
|--------------------------------------------------------------------------
| Unsuspend Client
|--------------------------------------------------------------------------
*/

export async function unsuspendClient(
    clientId
) {

    return apiRequest(
        `/api/admin/clients/${clientId}/unsuspend`,
        {
            method: "PATCH"
        }
    );

}


/*
|--------------------------------------------------------------------------
| Block Client
|--------------------------------------------------------------------------
*/

export async function blockClient(
    clientId
) {

    return apiRequest(
        `/api/admin/clients/${clientId}/block`,
        {
            method: "PATCH"
        }
    );

}


/*
|--------------------------------------------------------------------------
| Unblock Client
|--------------------------------------------------------------------------
*/

export async function unblockClient(
    clientId
) {

    return apiRequest(
        `/api/admin/clients/${clientId}/unblock`,
        {
            method: "PATCH"
        }
    );

}


/*
|--------------------------------------------------------------------------
| Delete Client
|--------------------------------------------------------------------------
*/

export async function deleteClient(
    clientId
) {

    return apiRequest(
        `/api/admin/clients/${clientId}`,
        {
            method: "DELETE"
        }
    );

}


/*
|--------------------------------------------------------------------------
| Credit JL To One Client
|--------------------------------------------------------------------------
*/

export async function creditClientJL(
    clientId,
    amount
) {

    return apiRequest(
        `/api/admin/clients/${clientId}/credit-jl`,
        {
            method: "POST",

            body: JSON.stringify({
                amount
            })
        }
    );

}


/*
|--------------------------------------------------------------------------
| Credit JL To All Clients
|--------------------------------------------------------------------------
*/

export async function creditAllClientsJL(
    amount
) {

    return apiRequest(
        "/api/admin/clients/credit-all-jl",
        {
            method: "POST",

            body: JSON.stringify({
                amount
            })
        }
    );

}

