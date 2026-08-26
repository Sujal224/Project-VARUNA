/**
 * VARUNA Live AIS Vessels API Client
 */

import { apiClient } from './client';
import { VesselRadarResponse, VesselLiveItem } from '../../domain/models/vessel';

export const vesselsApi = {
  async getVesselRadar(
    lat: number,
    lng: number,
    radiusNm: number = 35,
    speedKnots: number = 8.4,
    courseDeg: number = 120
  ): Promise<VesselRadarResponse> {
    return apiClient.get<VesselRadarResponse>('/vessels/radar', {
      params: {
        lat,
        lng,
        radius_nm: radiusNm,
        speed_knots: speedKnots,
        course_deg: courseDeg,
      },
    });
  },

  async getVesselDetails(mmsi: string, lat?: number, lng?: number): Promise<VesselLiveItem> {
    return apiClient.get<VesselLiveItem>(`/vessels/${mmsi}`, {
      params: { lat, lng },
    });
  },
};
