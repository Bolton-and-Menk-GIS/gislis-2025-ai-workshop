from sqlalchemy import Column, Integer, String, Float, BigInteger
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from geoalchemy2 import Geometry

class Base(DeclarativeBase):
    pass

class PublicComment(Base):
    __tablename__ = "public_comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    objectid: Mapped[int] = mapped_column(Integer, nullable=False)
    identification_type: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)
    comment: Mapped[str] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    public_view: Mapped[str] = mapped_column(String, nullable=True)
    scenario: Mapped[str] = mapped_column(String, nullable=True)
    question: Mapped[str] = mapped_column(String, nullable=True)
    creator: Mapped[str] = mapped_column(String, nullable=True)
    date_created: Mapped[int] = mapped_column(BigInteger, nullable=True)
    editor: Mapped[str] = mapped_column(String, nullable=True)
    date_edited: Mapped[int] = mapped_column(BigInteger, nullable=True)
    like: Mapped[int] = mapped_column(Integer, nullable=True)
    dislike: Mapped[int] = mapped_column(Integer, nullable=True)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    admin: Mapped[str] = mapped_column(String, nullable=True)
    hear_about: Mapped[str] = mapped_column(String, nullable=True)
    global_id: Mapped[str] = mapped_column(String, nullable=True)
    map_id: Mapped[int] = mapped_column(Integer, nullable=True)
    # Point geometry in WGS84 (SRID 4326)
    geometry: Mapped[str] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)