import asyncio
import json
from pathlib import Path
import numpy as np

from app.utils.embeddings import embed_text, InMemoryVectorStore  # your async embed_text function

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT_FILE = DATA_DIR / "columbia_heights.geojson"
OUTPUT_FILE = DATA_DIR / "comments_embeddings.json"


async def main():
    # Load raw GeoJSON features
    with open(INPUT_FILE, "r") as f:
        geojson = json.load(f)

    store = InMemoryVectorStore()
    features = geojson.get("features", [])

    for feature in features:
        props = feature.get("properties", {})
        text = props.get("Comment")
        if not text or not text.strip():
            continue  # skip blank comments

        # Create embedding
        emb = await embed_text(text)

        metadata = {
            "objectid": props.get("OBJECTID"),
            "map_id": props.get("MAP_ID"),
            "geometry": feature.get("geometry"),
            "comment": text,
        }

        store.add_vector(emb.tolist(), metadata)

    # Save to cache
    store.save(OUTPUT_FILE.as_posix())
    print(f"✅ Saved {len(store.embeddings)} embeddings to {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
