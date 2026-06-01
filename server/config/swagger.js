const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E.G.S College Management Information System (CMIS) API',
      version: '1.0.0',
      description: 'API Documentation for E.G.S College CMIS',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        adminToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-admin-token',
          description: 'Special administrative token for admin verification session'
        }
      },
    },
  },
  apis: ['./routes/*.js', './routes/v1/*.js'],
}

const specs = swaggerJsdoc(options)

module.exports = {
  swaggerUi,
  specs
}
