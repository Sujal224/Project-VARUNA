import { ChatMessage, VarunaInsight } from '../../domain/models/types';
import { MOCK_PRIMARY_INSIGHT } from '../mock/marineData';

class AiService {
  async processQuery(query: string): Promise<ChatMessage> {
    const lower = query.toLowerCase();
    
    let text = 'VARUNA intelligence processing complete.';
    let insight: VarunaInsight | undefined;
    let suggestedActions = ['View PFZ Map', 'Why this recommendation?', 'Safe Route'];

    if (lower.includes('safe') || lower.includes('fishing') || lower.includes('today')) {
      text = 'Conditions are highly favorable for operations today in the northern and eastern quadrants. Swell remains under 1.2m and sea surface temperature is optimal at 28.4°C.';
      insight = MOCK_PRIMARY_INSIGHT;
    } else if (lower.includes('cyclone') || lower.includes('storm') || lower.includes('weather')) {
      text = 'Cyclone Watch is currently at Low Chance. A tropical low pressure system is tracking southeast 320nm away. Nearshore waters remain calm and stable.';
      suggestedActions = ['View Weather Forecast', 'Check Swell Trend', 'Tidal Cycles'];
    } else if (lower.includes('route') || lower.includes('navigate')) {
      text = 'Safe route calculated to Sector Alpha via Outer Channel. Avoid the 2.1 kt current shear at south breakwater by holding a 124° heading.';
      suggestedActions = ['Open Map Navigation', 'Vessel Telemetry', 'Fuel Optimization'];
    } else if (lower.includes('zone') || lower.includes('pfz') || lower.includes('catch')) {
      text = 'Sector Alpha (Swatch Deep) is recommended with 87% confidence. Dense chlorophyll concentration (2.4 mg/m³) and stable thermal front indicate high pelagic concentration.';
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
