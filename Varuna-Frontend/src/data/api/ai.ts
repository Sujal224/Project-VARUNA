/**
 * VARUNA AI Assistant API
 */

import { apiClient } from './client';
import { ChatMessage, VarunaInsight } from '../../domain/models/types';
import { Coordinates } from '../../domain/models/mapIntelligence';

export interface AiChatRequest {
  message: string;
  conversationId?: string;
  currentLocation?: Coordinates;
  vesselId?: string;
}

export interface AiChatResponse {
  conversationId: string;
  message: ChatMessage;
  groundedInsight?: VarunaInsight;
  suggestedActions?: string[];
}

export const aiApi = {
  async sendMessage(request: AiChatRequest): Promise<AiChatResponse> {
    return apiClient.post<AiChatResponse>('/ai/chat', request);
  },

  async getMarineInsight(location?: Coordinates): Promise<VarunaInsight> {
    return apiClient.post<VarunaInsight>('/ai/insight', {
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
  },

  async getRecommendationExplanation(zoneId: string): Promise<{ explanation: string }> {
    return apiClient.get<{ explanation: string }>(`/ai/recommendation-explanation/${zoneId}`);
  },
};
