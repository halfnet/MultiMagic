import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MultiMagic API',
      version: '1.0.0',
      description: 'API documentation for the MultiMagic application',
    },
    servers: [
      {
        url: '/',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        csrf: {
          type: 'apiKey',
          in: 'header',
          name: 'CSRF-Token',
          description:
            'CSRF token required for POST/PUT/DELETE requests. Get it from /api/csrf-token endpoint.',
        },
      },
    },
    security: [
      {
        csrf: [],
      },
    ],
  },
  apis: ['./server/routes.ts'],
};

export const specs = swaggerJsdoc(options);
