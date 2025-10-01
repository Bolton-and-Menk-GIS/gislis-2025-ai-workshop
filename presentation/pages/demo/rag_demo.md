---
layout: section
---

# 🗺️ Geospatial RAG: Step by Step

---

# The Process

1. Start with **comments data** (GeoJSON FeatureLayer)  
2. Convert text → **embeddings** (vectors)  
3. Store embeddings + metadata in a **vector store**  
4. At query time:  
   - Embed the question  
   - Filter by **map extent** (optional)  
   - Run **similarity search**  
5. Feed results into an LLM → **summarized answer**

---


# Example: Comments Data

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [-93.23, 45.05] },
  "properties": {
    "OBJECTID": 110,
    "Comment": "It might confuse people that this has not been the name of the park for quite some time.",
    "MAP_ID": 36
  }
}
```

---

## Embedding Step

```py
def embed_text(text):
    resp = client.embeddings.create(model="text-embedding-3-small", input=text)
    return np.array(resp.data[0].embedding)

vector = embed_text("It might confuse people...")
print(vector[:5])  # [-0.012, 0.034, ...]
```
➡️ Each comment becomes a vector of ~1500 numbers

---

## Vector Store with Extent Search

```py
results = store.search(
    top_k=5,
    query_embedding=qvec,
    extent={"xmin": -93.4, "ymin": 44.9, "xmax": -93.1, "ymax": 45.1}
)
```

* Filters to comments inside the bounding box

* Returns most similar comments in meaning-space using a *tcosine similarity* search

---

### Cosine Similarity Search

The RAG *Cosine Similarity* search is a technique for finding the most relevant documents to answer a user's query by converting the query and document chunks into numerical embeddings, calculating the cosine similarity between them, and retrieving the chunks with the highest similarity scores. 

This process forms the retrieval step of a RAG pipeline, which then feeds these retrieved documents, along with the original query, to an LLM to generate a context-aware answer. 

---
layout: image
image: /images/cosine-similarity.png
backgroundSize: 80%
---


---

## From Search -> Summarization

```py
context = "\n".join([c["comment"] for c in results])
completion = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {"role": "system", "content": "Summarize public comments."},
    {"role": "user", "content": f"Question: {query}\n\nComments:\n{context}"}
  ]
)
print(completion.choices[0].message.content)
```

---

# Key Takeaways

* You saw the full pipeline, not a black box

* Comments → Embeddings → Search → Summarize

* Extent filtering = geospatial awareness

* Easy to extend to other layers (311, surveys, zoning codes)