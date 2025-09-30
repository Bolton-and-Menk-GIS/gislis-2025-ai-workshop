from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.schemas.llm import RagRequest, RagResponse

rag_api = APIRouter(prefix="/rag", tags=["rag"])

@rag_api.post("/", response_model=RagResponse)
def run_rag(request: RagRequest, db: Session = Depends(get_db)):
    # TODO: generate embedding for request.prompt
    # For now, use a dummy embedding vector
    dummy_vec = [0.0] * 1536

    sql = text("""
        SELECT id, name, amenity,
               ST_AsGeoJSON(geom) as geometry
        FROM pois
        WHERE ST_DWithin(
            geom::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radius
        )
        ORDER BY embedding <-> :vec
        LIMIT 5
    """)

    rows = db.execute(sql, {
        "lon": request.extent.lon,
        "lat": request.extent.lat,
        "radius": request.extent.radius,
        "vec": dummy_vec
    }).fetchall()

    features = [
        {
            "id": r.id,
            "name": r.name,
            "amenity": r.amenity,
            "geometry": r.geometry
        }
        for r in rows
    ]

    return {
        "summary": f"Top {len(features)} results near you.",
        "features": features
    }
