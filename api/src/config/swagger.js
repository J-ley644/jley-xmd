import swaggerJsdoc from "swagger-jsdoc";

const options = {

    definition: {

        openapi: "3.0.0",

        info: {

            title: "JLEY-XMD API",

            version: "1.0.0",

            description:
                "Official API for JLEY-XMD Multi-Bot Platform"

        },

        servers: [

            {
                url: "http://localhost:5000"
            }

        ]

    },

    apis: [

        "./src/routes/*.js"

    ]

};

const swaggerSpec =
    swaggerJsdoc(options);

export default swaggerSpec;