from typing import Literal, Optional, Tuple
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class GeoPoint(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: Tuple[float, float] = Field(..., description="[lon, lat]")

    @field_serializer("coordinates")
    def _serialize_coordinates(self, coords):
        # JSON-friendly list representation
        return list(coords)


class MineSchema(BaseModel):
    id: UUID
    name: str
    type: str
    elevation: Optional[float] = None
    location: GeoPoint

    model_config = ConfigDict(from_attributes=True)


class DrillHoleSchema(BaseModel):
    id: UUID
    mine_id: UUID
    name: str
    depth: Optional[float] = None
    collar_location: GeoPoint

    model_config = ConfigDict(from_attributes=True)
