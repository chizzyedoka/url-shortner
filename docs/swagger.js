export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: 'API documentation for creating, listing, redirecting, and deleting shortened URLs.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  tags: [
    {
      name: 'URLs',
      description: 'Short URL operations'
    }
  ],
  paths: {
    '/api/urls/shorten': {
      post: {
        tags: ['URLs'],
        summary: 'Create a shortened URL',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUrlRequest' },
              example: {
                originalUrl: 'https://example.com/a-long-page',
                shortCode: 'example'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Short URL created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUrlResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/urls': {
      get: {
        tags: ['URLs'],
        summary: 'List the authenticated user\'s URLs',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'URLs returned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Url' }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/urls/{shortCode}': {
      parameters: [
        {
          name: 'shortCode',
          in: 'path',
          required: true,
          description: 'The short code assigned to the URL',
          schema: { type: 'string', minLength: 3, maxLength: 20 },
          example: 'example'
        }
      ],
      get: {
        tags: ['URLs'],
        summary: 'Redirect to the original URL',
        description: 'This public endpoint responds with an HTTP redirect to the original URL.',
        responses: {
          302: {
            description: 'Redirects to the original URL',
            headers: {
              Location: {
                description: 'The original URL',
                schema: { type: 'string', format: 'uri' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['URLs'],
        summary: 'Delete a shortened URL',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'URL deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'message', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'URL deleted successfully' },
                    data: {
                      type: 'object',
                      properties: { shortCode: { type: 'string', example: 'example' } }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      CreateUrlRequest: {
        type: 'object',
        required: ['originalUrl'],
        properties: {
          originalUrl: { type: 'string', format: 'uri', example: 'https://example.com/a-long-page' },
          shortCode: { type: 'string', minLength: 3, maxLength: 20, example: 'example' }
        }
      },
      Url: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123' },
          originalUrl: { type: 'string', format: 'uri', example: 'https://example.com/a-long-page' },
          shortCode: { type: 'string', example: 'example' }
        }
      },
      CreateUrlResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            required: ['id', 'shortCode', 'originalUrl'],
            properties: {
              id: { type: 'string', example: '123' },
              shortCode: { type: 'string', example: 'example' },
              originalUrl: { type: 'string', format: 'uri', example: 'https://example.com/a-long-page' }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'URL not found' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Authentication required or token is invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      NotFound: {
        description: 'URL not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  }
};
