
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
        url: '/api',
        description: 'API Server',
      },
    ],
  },
  apis: ['./server/routes.ts'],
};

export const specs = swaggerJsdoc(options);
