export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Portfolio API',
    description:
      "API for Lucas Gutknecht's portfolio website. Built in TypeScript, running on AWS Lambda " +
      'behind API Gateway and CloudFront.',
    version: '2.0.0',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/hello': {
      get: {
        tags: ['General'],
        summary: 'A simple hello world API.',
        responses: {
          '200': {
            description: 'Returns a greeting',
            content: {
              'application/json': { example: { message: 'You just made a successful API call!' } },
            },
          },
        },
      },
    },
    '/api/send_portfolio_email': {
      post: {
        tags: ['Email'],
        summary: 'Sends an intro email to the specified recipient.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipient_email'],
                properties: { recipient_email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Email sent successfully.' },
          '400': { description: 'Invalid request or missing recipient email.' },
          '500': { description: 'Failed to send email.' },
        },
      },
    },
    '/api/openapi.json': {
      get: {
        tags: ['General'],
        summary: 'This OpenAPI document.',
        responses: { '200': { description: 'OpenAPI 3 specification' } },
      },
    },
  },
} as const;
