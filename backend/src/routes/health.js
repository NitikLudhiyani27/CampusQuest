// GET /health - simple liveness check.
export default async function healthRoutes(app) {
  app.get('/health', async () => {
    return { message: 'Server running' };
  });
}
