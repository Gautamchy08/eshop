import swaggerAutogen from 'swagger-autogen';
import { join } from 'path';

const doc = {
    info: {
        title: "Auth Service",
        description: "API documentation for the Auth Service",
        version: "1.0.0",
    },
    host: "localhost:6001",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
        {
            name: "Auth",
            description: "Authentication endpoints"
        }
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
        }
    },
};

const outputFile = join(__dirname, 'swagger-output.json');
const endpointsFiles = [join(__dirname, 'routes/auth.router.ts')];

const swagger = swaggerAutogen();
swagger(outputFile, endpointsFiles, doc);