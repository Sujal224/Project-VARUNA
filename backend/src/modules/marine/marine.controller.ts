import { Request, Response, NextFunction } from 'express';
import { getMarineConditions } from './marine.service';

export async function getConditions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required.',
      });
      return;
    }

    if (latitude < -90 || latitude > 90) {
      res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90.',
      });
      return;
    }

    if (longitude < -180 || longitude > 180) {
      res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180.',
      });
      return;
    }

    const conditions = await getMarineConditions(
      latitude,
      longitude,
    );

    res.status(200).json({
      success: true,
      data: conditions,
      message: 'Marine conditions retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
}