"""
VARUNA Weather Intelligence Analyzer

Converts raw weather and marine conditions into:
- Marine risk
- Risk factors
- Operating window
- Weather trend
- Human-readable recommendation
"""

from typing import List, Tuple

from app.schemas.map import (
    WeatherIntelligence,
    WeatherForecastItem,
    WeatherRiskFactor,
)


class WeatherAnalyzer:

    def _risk_level(self, score: int) -> str:
        if score <= 25:
            return "LOW"
        if score <= 50:
            return "MODERATE"
        if score <= 75:
            return "HIGH"
        return "CRITICAL"

    def _wind_factor(self, wind_kmh: float, gust_kmh: float) -> WeatherRiskFactor:
        if wind_kmh < 15 and gust_kmh < 25:
            return WeatherRiskFactor(
                name="Wind",
                score=5,
                severity="LOW",
                description="Wind conditions are favourable for marine operations.",
            )

        if wind_kmh < 25 and gust_kmh < 40:
            return WeatherRiskFactor(
                name="Wind",
                score=25,
                severity="MODERATE",
                description="Moderate winds may affect small vessels.",
            )

        if wind_kmh < 40 and gust_kmh < 55:
            return WeatherRiskFactor(
                name="Wind",
                score=55,
                severity="HIGH",
                description="Strong winds may create difficult marine conditions.",
            )

        return WeatherRiskFactor(
            name="Wind",
            score=85,
            severity="CRITICAL",
            description="Very strong winds and gusts create unsafe marine conditions.",
        )

    def _wave_factor(self, wave_height: float) -> WeatherRiskFactor:
        if wave_height < 1.5:
            return WeatherRiskFactor(
                name="Wave Height",
                score=5,
                severity="LOW",
                description="Wave height is suitable for normal marine operations.",
            )

        if wave_height < 2.5:
            return WeatherRiskFactor(
                name="Wave Height",
                score=25,
                severity="MODERATE",
                description="Moderate waves may reduce vessel comfort and stability.",
            )

        if wave_height < 4.0:
            return WeatherRiskFactor(
                name="Wave Height",
                score=60,
                severity="HIGH",
                description="High waves can make marine operations hazardous.",
            )

        return WeatherRiskFactor(
            name="Wave Height",
            score=90,
            severity="CRITICAL",
            description="Very high waves present a serious marine safety risk.",
        )

    def _visibility_factor(self, visibility_km: float) -> WeatherRiskFactor:
        if visibility_km >= 10:
            return WeatherRiskFactor(
                name="Visibility",
                score=5,
                severity="LOW",
                description="Visibility is good.",
            )

        if visibility_km >= 5:
            return WeatherRiskFactor(
                name="Visibility",
                score=25,
                severity="MODERATE",
                description="Reduced visibility may affect navigation.",
            )

        if visibility_km >= 2:
            return WeatherRiskFactor(
                name="Visibility",
                score=60,
                severity="HIGH",
                description="Poor visibility may significantly affect navigation.",
            )

        return WeatherRiskFactor(
            name="Visibility",
            score=85,
            severity="CRITICAL",
            description="Very poor visibility creates a major navigation risk.",
        )

    def _rain_factor(self, precipitation_probability: int) -> WeatherRiskFactor:
        if precipitation_probability < 30:
            return WeatherRiskFactor(
                name="Rain",
                score=5,
                severity="LOW",
                description="Low probability of precipitation.",
            )

        if precipitation_probability < 60:
            return WeatherRiskFactor(
                name="Rain",
                score=25,
                severity="MODERATE",
                description="Moderate chance of precipitation.",
            )

        if precipitation_probability < 80:
            return WeatherRiskFactor(
                name="Rain",
                score=50,
                severity="HIGH",
                description="High probability of precipitation.",
            )

        return WeatherRiskFactor(
            name="Rain",
            score=75,
            severity="HIGH",
            description="Very high probability of precipitation.",
        )

    def _weather_condition_factor(self, condition: str) -> WeatherRiskFactor:
        condition_lower = condition.lower()

        severe_terms = [
            "thunderstorm",
            "violent",
            "severe",
            "squall",
            "hail",
        ]

        if any(term in condition_lower for term in severe_terms):
            return WeatherRiskFactor(
                name="Weather Condition",
                score=85,
                severity="CRITICAL",
                description="Severe weather activity has been detected.",
            )

        if "rain" in condition_lower or "shower" in condition_lower:
            return WeatherRiskFactor(
                name="Weather Condition",
                score=30,
                severity="MODERATE",
                description="Rain or showers may affect marine operations.",
            )

        return WeatherRiskFactor(
            name="Weather Condition",
            score=5,
            severity="LOW",
            description="No significant severe weather condition detected.",
        )

    def _calculate_trend(
        self,
        forecast: List[WeatherForecastItem],
    ) -> str:
        if len(forecast) < 3:
            return "STABLE"

        first = forecast[0]
        last = forecast[-1]

        wind_change = last.wind_speed_kmh - first.wind_speed_kmh
        wave_change = last.wave_height_m - first.wave_height_m
        rain_change = (
            last.precipitation_probability
            - first.precipitation_probability
        )

        deterioration_points = 0

        if wind_change > 8:
            deterioration_points += 1

        if wave_change > 0.7:
            deterioration_points += 1

        if rain_change > 30:
            deterioration_points += 1

        if deterioration_points >= 2:
            return "DETERIORATING"

        if (
            wind_change < -8
            or wave_change < -0.7
            or rain_change < -30
        ):
            return "IMPROVING"

        return "STABLE"

    def _find_best_window(
        self,
        forecast: List[WeatherForecastItem],
    ) -> str:
        suitable = []

        for item in forecast:
            if (
                item.wind_speed_kmh < 25
                and item.wave_height_m < 2.5
                and item.precipitation_probability < 60
            ):
                suitable.append(item.time_label)

        if not suitable:
            return "No favourable window detected"

        return f"{suitable[0]} – {suitable[-1]}"

    def analyze(
        self,
        weather: WeatherIntelligence,
        wave_height: float,
    ) -> WeatherIntelligence:

        current = weather.current

        factors = [
            self._wind_factor(
                current.wind_speed_kmh,
                current.wind_gust_kmh,
            ),
            self._wave_factor(wave_height),
            self._visibility_factor(current.visibility_km),
        ]

        rain_probability = 0

        if weather.forecast:
            rain_probability = max(
                item.precipitation_probability
                for item in weather.forecast[:3]
            )

        factors.append(
            self._rain_factor(rain_probability)
        )

        factors.append(
            self._weather_condition_factor(
                current.condition_text
            )
        )

        score = round(
            sum(f.score for f in factors) / len(factors)
        )

        level = self._risk_level(score)

        trend = self._calculate_trend(weather.forecast)

        best_window = self._find_best_window(
            weather.forecast
        )

        if level == "LOW":
            summary = (
                "Favourable conditions detected for "
                "marine operations."
            )
            recommendation = (
                f"Conditions are currently favourable. "
                f"Best operating window: {best_window}."
            )

        elif level == "MODERATE":
            summary = (
                "Moderate marine conditions detected. "
                "Caution is advised."
            )
            recommendation = (
                f"Marine operations are possible with caution. "
                f"Preferred window: {best_window}."
            )

        elif level == "HIGH":
            summary = (
                "Difficult marine conditions detected. "
                "Operations should be carefully evaluated."
            )
            recommendation = (
                "Strong weather or sea conditions may affect "
                "vessel safety. Consider delaying operations."
            )

        else:
            summary = (
                "Severe marine conditions detected."
            )
            recommendation = (
                "Marine operations should be avoided until "
                "conditions improve."
            )

        weather.risk_score = score
        weather.risk_level = level
        weather.risk_summary = summary
        weather.risk_factors = factors
        weather.best_operating_window = best_window
        weather.recommendation = recommendation
        weather.trend = trend

        return weather


weather_analyzer = WeatherAnalyzer()