export default {

    name: "weather",

    aliases: [
        "forecast"
    ],

    category: "tools",

    description: "Get current weather information",

    usage: ".weather <city>",

    permissions: {},

    async execute(ctx) {

        const city =
            ctx.args.join(" ").trim();

        if (!city) {

            return ctx.error(
`??? Weather

Usage:
${ctx.prefix}weather <city>

Example:
${ctx.prefix}weather Nairobi`
            );

        }

        try {

            const geoResponse =
                await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
                );

            if (!geoResponse.ok) {
                throw new Error("Geocoding request failed");
            }

            const geoData =
                await geoResponse.json();

            if (!geoData.results?.length) {

                return ctx.error(
`? Location not found

I couldn't find:
${city}`
                );

            }

            const location =
                geoData.results[0];

            const weatherResponse =
                await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
                );

            if (!weatherResponse.ok) {
                throw new Error("Weather request failed");
            }

            const data =
                await weatherResponse.json();

            const current =
                data.current;

            const weatherCodes = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy",
                3: "Overcast",
                45: "Fog",
                48: "Depositing rime fog",
                51: "Light drizzle",
                53: "Moderate drizzle",
                55: "Dense drizzle",
                61: "Slight rain",
                63: "Moderate rain",
                65: "Heavy rain",
                71: "Slight snow",
                73: "Moderate snow",
                75: "Heavy snow",
                80: "Slight rain showers",
                81: "Moderate rain showers",
                82: "Violent rain showers",
                95: "Thunderstorm",
                96: "Thunderstorm with slight hail",
                99: "Thunderstorm with heavy hail"
            };

            const condition =
                weatherCodes[current.weather_code] ||
                "Unknown";

            const country =
                location.country
                    ? `, ${location.country}`
                    : "";

            return ctx.success(
`??? Weather

?? Location • ${location.name}${country}

??? Temperature • ${current.temperature_2m}°C
?? Feels like • ${current.apparent_temperature}°C
?? Humidity • ${current.relative_humidity_2m}%
??? Precipitation • ${current.precipitation} mm
?? Wind • ${current.wind_speed_10m} km/h
?? Condition • ${condition}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Weather command error:",
                error
            );

            return ctx.error(
                "? Weather service is currently unavailable."
            );

        }

    }

};
