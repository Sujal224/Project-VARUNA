/**
 * VARUNA AI Assistant Service
 */

import { aiApi } from '../api/ai';
import { ChatMessage, VarunaInsight } from '../../domain/models/types';
import { MOCK_PRIMARY_INSIGHT } from '../mock/marineData';
import { ENV } from '../config/environment';
import { Coordinates } from '../../domain/models/mapIntelligence';

class AiService {
  public async processQuery(
    query: string,
    conversationId?: string,
    location?: Coordinates
  ): Promise<ChatMessage> {
    try {
      if (!ENV.USE_MOCK_DATA_FALLBACK) {
        const response = await aiApi.sendMessage({
          message: query,
          conversationId,
          currentLocation: location,
        });
        return response.message;
      }
    } catch (err) {
      console.info('[AiService] Backend query fallback triggered');
    }

    return this.generateSimulatedResponse(query);
  }

  public async getMarineInsight(location?: Coordinates): Promise<VarunaInsight> {
    try {
      return await aiApi.getMarineInsight(location);
    } catch {
      return MOCK_PRIMARY_INSIGHT;
    }
  }

  public async getRecommendationExplanation(zoneId: string): Promise<string> {
    try {
      const res = await aiApi.getRecommendationExplanation(zoneId);
      return res.explanation;
    } catch {
      return MOCK_PRIMARY_INSIGHT.explanation;
    }
  }

  private generateSimulatedResponse(query: string): ChatMessage {
    const lower = query.toLowerCase();

    let text = 'VARUNA intelligence processing complete.';
    let insight: VarunaInsight | undefined;
    let suggestedActions = ['View PFZ Map', 'Why this recommendation?', 'Safe Route'];

    if (lower.includes('safe') || lower.includes('fishing') || lower.includes('today')) {
      text =
        'Conditions are highly favorable for operations today in the northern and eastern quadrants. Swell remains under 1.2m and sea surface temperature is optimal at 28.4°C.';
      insight = MOCK_PRIMARY_INSIGHT;
    } else if (lower.includes('cyclone') || lower.includes('storm') || lower.includes('weather')) {
      text =
        'Cyclone Watch is currently at Low Chance. A tropical low pressure system is tracking southeast 320nm away. Nearshore waters remain calm and stable.';
      suggestedActions = ['View Weather Forecast', 'Check Swell Trend', 'Tidal Cycles'];
    } else if (lower.includes('route') || lower.includes('navigate')) {
      text =
        'Safe route calculated to Sector Alpha via Outer Channel. Avoid the 2.1 kt current shear at south breakwater by holding a 124° heading.';
      suggestedActions = ['Open Map Navigation', 'Vessel Telemetry', 'Fuel Optimization'];
    } else if (lower.includes('zone') || lower.includes('pfz') || lower.includes('catch')) {
      text =
        'Sector Alpha (Swatch Deep) is recommended with 87% confidence. Dense chlorophyll concentration (2.4 mg/m³) and stable thermal front indicate high pelagic concentration.';
      insight = MOCK_PRIMARY_INSIGHT;
    } else {
      text = `Analyzing query "${query}". Oceanographic conditions in Bay of Bengal show stable barometric pressure, mild wave action, and high biological productivity in Sector Alpha.`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'varuna',
      text,
      timestamp: 'Just now',
      insight,
      suggestedActions,
    };
  }
}

export const aiService = new AiService();
