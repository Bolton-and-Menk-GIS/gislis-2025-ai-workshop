from fastapi import APIRouter, Depends

from app.schemas.rag import RagRequest, RagResponse
from app.utils.embeddings import embeddingStore, embed_text
from app.utils.openai import get_llm_client
from pathlib import Path

def check_for_embeddings():
    if not embeddingStore.embeddings:

        cache_file = Path(__file__).resolve().parent.parent / "data" / "comments_embeddings.json"

        if cache_file.exists():
            embeddingStore.load(cache_file.as_posix())
            print(f"✅ Loaded {len(embeddingStore.embeddings)} cached embeddings")
        else:
            print("⚠️ No embeddings cache found. Run preprocessing first.")


rag_api = APIRouter(prefix="/rag", tags=["rag"])

@rag_api.post("/query", response_model=RagResponse)
async def query(req: RagRequest):
    check_for_embeddings()
    query_vec = await embed_text(req.question)
    results = embeddingStore.search(
        query_embedding=query_vec.tolist(),
        top_k=5,
        extent=req.extent.dict() if req.extent else None
    )

    if not results:
        return {"answer": "No matching comments in this area.", "features": []}

    context = "\n".join([f"- {r['comment']}" for r in results])
    client = get_llm_client()
    completion = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant summarizing public comments."},
            {"role": "user", "content": f"Question: {req.question}\n\nRelevant comments:\n{context}"}
        ]
    )
    summary = completion.choices[0].message.content or "No answer generated."

    return RagResponse(answer=summary, features=results)
