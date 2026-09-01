/**
 * VARUNA AI Types & Contracts
 */

import { ChatMessage, VarunaInsight } from '../../domain/models/types';
import { Coordinates } from '../../domain/models/mapIntelligence';

export interface UserQueryContext {
  location?: Coordinates;
  vesselId?: string;
  selectedZoneId?: string;
  activeLayer?: string;
}

export interface ConversationTurn {
  id: string;
  query: string;
  response: ChatMessage;
  timestamp: string;
}
