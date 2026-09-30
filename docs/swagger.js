import 'dotenv/config';

const port = process.env.PORT;

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: 'API documentation for user registration and login, and for creating, listing, redirecting, and deleting shortened URLs.'
  },
  servers: [
    {
      url: port ? `http://localhost:${port}` : '/',
      description: 'API server'
    }
  ],
  tags: [
    {
      name: 'Users',
      description: 'Create an account and get a token for protected URL operations.'
    },
    {
      name: 'URLs',
      description: 'Create and manage short codes that point to original URLs.'
    }
  ],
  paths: {
    '/api/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register a user',
        description: 'Create an account with your name, email, and password. Use the same email and password with the login endpoint to get an access token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterUserRequest' },
              example: {
                firstname: 'Jane',
                lastname: 'Doe',
                email: 'jane@example.com',
                password: 'password123'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterUserResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: {
            description: 'A user with this email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Log in a user',
        description: 'Sign in to receive a JWT in `data.token`. In Swagger UI, click Authorize and paste the token value to use protected URL endpoints.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginUserRequest' },
              example: {
                email: 'jane@example.com',
                password: 'password123'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful; returns a bearer token for authenticated URL operations',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginUserResponse' }
              }
            }
          },
          400: {
            description: 'Invalid request data or email and password combination',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/urls/shorten': {
      post: {
        tags: ['URLs'],
        summary: 'Create a shortened URL',
        description: 'Save an original URL and receive its short code. You can provide a unique `shortCode` of 3 to 20 characters, or omit it to generate a six-character code. Use the returned code with `/api/urls/{shortCode}` to redirect or delete the URL.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUrlRequest' },
              examples: {
                generatedCode: {
                  summary: 'Generate a short code',
                  value: { originalUrl: 'https://example.com/a-long-page' }
                },
                customCode: {
                  summary: 'Choose a short code',
                  value: {
                    originalUrl: 'https://example.com/a-long-page',
                    shortCode: 'example'
                  }
                }
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
        description: 'Return the URLs created by the signed-in user. Each result includes the `shortCode` needed for redirect and delete requests.',
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
          description: 'The exact `shortCode` returned when the URL was created, for example `example` in `/api/urls/example`.',
          schema: { type: 'string', minLength: 3, maxLength: 20 },
          example: 'example'
        }
      ],
      get: {
        tags: ['URLs'],
        summary: 'Redirect to the original URL',
        description: 'Look up a saved short code and redirect to its original URL. No token is needed. Open `/api/urls/{shortCode}` in a browser to follow the redirect.',
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
        description: 'Remove a short code created by the signed-in user. After deletion, requests to `/api/urls/{shortCode}` return 404.',
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
                      properties: {
                        shortCode: {
                          type: 'string',
                          description: 'The short code that was deleted.',
                          example: 'example'
                        }
                      }
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
        bearerFormat: 'JWT',
        description: 'Paste the `data.token` value returned by `/api/users/login`; Swagger UI adds the Bearer prefix.'
      }
    },
    schemas: {
      RegisterUserRequest: {
        type: 'object',
        required: ['firstname', 'lastname', 'email', 'password'],
        properties: {
          firstname: { type: 'string', example: 'Jane' },
          lastname: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 3, format: 'password', example: 'password123' }
        }
      },
      LoginUserRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 3, format: 'password', example: 'password123' }
        }
      },
      RegisterUserResponse: {
        type: 'object',
        required: ['message', 'data'],
        properties: {
          message: { type: 'string', example: 'User registered successfully' },
          data: {
            type: 'object',
            required: ['user_id'],
            properties: {
              user_id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
            }
          }
        }
      },
      LoginUserResponse: {
        type: 'object',
        required: ['message', 'data'],
        properties: {
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            required: ['user_id', 'token'],
            properties: {
              user_id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              token: { type: 'string', description: 'JWT bearer token' }
            }
          }
        }
      },
      CreateUrlRequest: {
        type: 'object',
        required: ['originalUrl'],
        properties: {
          originalUrl: {
            type: 'string',
            format: 'uri',
            description: 'The full URL to visit when someone opens the short code.',
            example: 'https://example.com/a-long-page'
          },
          shortCode: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            description: 'Optional custom code. It must be unique; omit it to generate a six-character code.',
            example: 'example'
          }
        }
      },
      Url: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123' },
          originalUrl: { type: 'string', format: 'uri', example: 'https://example.com/a-long-page' },
          shortCode: { type: 'string', description: 'Use this code in `/api/urls/{shortCode}`.', example: 'example' }
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
              shortCode: { type: 'string', description: 'The saved custom or generated code.', example: 'example' },
              originalUrl: { type: 'string', format: 'uri', example: 'https://example.com/a-long-page' }
            }
          }
        }
      },
      Error: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: { description: 'Validation details, when available' }
        }
      },
      UnauthorizedError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', example: 'Unauthorized' }
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
            schema: { $ref: '#/components/schemas/UnauthorizedError' }
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
