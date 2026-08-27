"""
AI Service (VARUNA Marine Intelligence LLM Integration)
"""

import time
from app.schemas.ai import AiChatRequest, AiChatResponse, ChatMessageSchema


class AiService:
    def chat(self, req: AiChatRequest) -> AiChatResponse:
        query = req.message.lower()
        conv_id = req.conversationId or f"conv_{int(time.time())}"

        text = "VARUNA intelligence processing complete."
        suggested = ["View PFZ Map", "Why this recommendation?", "Safe Route"]

        if "safe" in query or "fishing" in query or "today" in query:
            text = (
                "Conditions are highly favorable for operations today in the northern and eastern quadrants. "
                "Swell remains under 1.2m and sea surface temperature is optimal at 28.4°C."
            )
        elif "cyclone" in query or "storm" in query or "weather" in query:
            text = (
                "Cyclone Watch is currently at Low Chance. A tropical low pressure system is tracking "
                "southeast 320nm away. Nearshore waters remain calm and stable."
            )
            suggested = ["View Weather Forecast", "Check Swell Trend", "Tidal Cycles"]
        elif "route" in query or "navigate" in query:
            text = (
                "Safe route calculated to Sector Alpha via Outer Channel. Avoid the 2.1 kt current "
                "shear at south breakwater by holding a 124° heading."
            )
            suggested = ["Open Map Navigation", "Vessel Telemetry", "Fuel Optimization"]
        elif "zone" in query or "pfz" in query or "catch" in query:
            text = (
                "Sector Alpha (Swatch Deep) is recommended with 87% confidence. Dense chlorophyll "
                "concentration (2.4 mg/m³) and stable thermal front indicate high pelagic concentration."
            )
        else:
            text = (
                f"Analyzing query '{req.message}'. Oceanographic conditions in Bay of Bengal show "
                "stable barometric pressure, mild wave action, and high biological productivity in Sector Alpha."
            )

        msg = ChatMessageSchema(
            id=f"msg-{int(time.time() * 1000)}",
            sender="varuna",
            text=text,
            timestamp="Just now",
            suggestedActions=suggested,
        )

        return AiChatResponse(
            conversationId=conv_id,
            message=msg,
            suggestedActions=suggested,
        )


ai_service = AiService()
