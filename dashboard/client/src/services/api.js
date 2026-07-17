const API_URL = "http://localhost:5000";


export async function apiRequest(endpoint, options = {}) {


    const token = localStorage.getItem("token");


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



    const data = await response.json();



    if(!response.ok){

        throw new Error(
            data.message || "API request failed"
        );

    }



    return data;

}