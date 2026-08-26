/**
 * src/routes/index.ts
 *
 * Master route registry for /api/v1.
 * Domain modules will be registered here as development progresses through subsequent phases.
 */

import { Router, Request, Response } from 'express';
import { ApiResponse } from '../common/responses/apiResponse';

export const apiRouter = Router();

/**
 * GET /api/v1/health
 * Verifies that the VARUNA API process is alive and healthy.
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  const requestId = req.id || (req.headers['x-request-id'] as string) || 'unknown';

  const healthData = {
    service: 'VARUNA API',
    status: 'healthy',
  };

  res
    .status(200)
    .json(ApiResponse.success(healthData, 'VARUNA API is healthy.', requestId));
});
