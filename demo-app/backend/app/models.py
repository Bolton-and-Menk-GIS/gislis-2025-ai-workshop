from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import VECTOR
from geoalchemy2 import Geometry
from app.db import Base

class POI(Base):
    __tablename__ = "pois"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    amenity = Column(String)
    geom = Column(Geometry("POINT", srid=4326))
    embedding = Column(VECTOR(1536))
