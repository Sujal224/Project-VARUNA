/**
 * VARUNA AIS Vessel Radar & Collision Detection API Client
 */

import { apiClient } from './client';
import { VesselRadarResponse, VesselLiveItem } from '../../domain/models/vessel';

export const vesselsApi = {
  async getVesselRadar(
    lat: number = 17.68,
    lng: number = 83.21,
    rangeNm: number = 45,
    speedKnots: number = 8.5,
    courseDeg: number = 120
  ): Promise<VesselRadarResponse> {
    return apiClient.get<VesselRadarResponse>('/vessels/radar', {
      params: {
        lat,
        lng,
        range_nm: rangeNm,
        user_speed_knots: speedKnots,
        user_course_deg: courseDeg,
      },
    });
  },

  async getVesselDetails(mmsi: number): Promise<VesselLiveItem> {
    return apiClient.get<VesselLiveItem>(`/vessels/${mmsi}`);
  },
};
