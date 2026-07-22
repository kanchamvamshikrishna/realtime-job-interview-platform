import swaggerJSDoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time Job Interview Platform API',
      version: '1.0.0',
      description:
        'API documentation for the KRIBUDWEBTECH MERN Real-Time Job Interview Platform assessment project.',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Jobs' },
      { name: 'Applications' },
      { name: 'Chat' },
      { name: 'Dashboard' },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
});

export default swaggerSpec;
