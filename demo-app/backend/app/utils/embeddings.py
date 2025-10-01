import json
from typing import List, Optional, Literal
from app.utils.openai import get_llm_client
from shapely.geometry import Point, Polygon
import numpy as np

async def embed_text(text: str, model: str = "text-embedding-3-small") -> np.ndarray:
    client = get_llm_client()
    if client is None:
        raise ValueError("No AI client configured")
    resp = await client.embeddings.create(
        model=model,
        input=text
    )
    return np.array(resp.data[0].embedding) 
class InMemoryVectorStore:
    def __init__(self):
        self.embeddings = []
        self.metadatas = []

    def add_vector(self, embedding: list[float], metadata: dict):
        self.embeddings.append(embedding)
        self.metadatas.append(metadata)

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        extent: dict | None = None
    ) -> list[dict]:
        """
        Search for top_k items similar to query_embedding, optionally filtered by spatial extent.

        extent: {"xmin": float, "ymin": float, "xmax": float, "ymax": float}
        """
        if not self.embeddings:
            print('No embeddings in store')
            return []

        # filter candidates by extent
        candidate_idxs = list(range(len(self.metadatas)))
        if extent:
            bbox = Polygon([
                (extent["xmin"], extent["ymin"]),
                (extent["xmin"], extent["ymax"]),
                (extent["xmax"], extent["ymax"]),
                (extent["xmax"], extent["ymin"])
            ])
            candidate_idxs = [
                i for i, meta in enumerate(self.metadatas)
                if meta.get("geometry") and
                   Point(meta["geometry"]["coordinates"]).within(bbox)
            ]

        if not candidate_idxs:
            return []

        # restrict embeddings + metadata to candidates
        matrix = np.array([self.embeddings[i] for i in candidate_idxs])
        q = np.array(query_embedding)

        # cosine similarity
        sims = matrix.dot(q) / (np.linalg.norm(matrix, axis=1) * np.linalg.norm(q))
        top_idx = np.argsort(sims)[::-1][:top_k]

        return [self.metadatas[candidate_idxs[i]] for i in top_idx]
    
    def save(self, path: str):
        data = [
            {"embedding": emb, "metadata": meta}
            for emb, meta in zip(self.embeddings, self.metadatas)
        ]
        with open(path, "w") as f:
            json.dump(data, f)

    def load(self, path: str):
        with open(path, "r") as f:
            data = json.load(f)
        self.embeddings = [d["embedding"] for d in data]
        self.metadatas = [d["metadata"] for d in data]

embeddingStore = InMemoryVectorStore()


