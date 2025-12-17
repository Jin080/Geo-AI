import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Mine(Base):
    __tablename__ = "mines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False, index=True)
    type = Column(String(60), nullable=False)
    location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False
    )
    elevation = Column(Float, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    drill_holes = relationship(
        "DrillHole", back_populates="mine", cascade="all, delete-orphan"
    )


class DrillHole(Base):
    __tablename__ = "drill_holes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mine_id = Column(
        UUID(as_uuid=True), ForeignKey("mines.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(120), nullable=False)
    depth = Column(Float, nullable=True)
    collar_location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=False
    )
    path = Column(
        Geometry(geometry_type="LINESTRING", srid=4326, spatial_index=True),
        nullable=True,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    mine = relationship("Mine", back_populates="drill_holes")
