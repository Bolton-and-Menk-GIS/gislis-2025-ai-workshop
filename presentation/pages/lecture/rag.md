---
layout: cover
---

## 📚 RAG (Retrieval-Augmented Generation)

---

# What is RAG?

**Retrieval-Augmented Generation**  
- LLM + database = smarter answers  
- Keeps responses accurate & grounded in your data  
  - reduces hallucinations 

![rag-flow](/images/rag_workflow.svg)

---

# Why RAG Matters

- LLMs alone “forget” or hallucinate  
- With RAG:  
  - Context-aware answers  
  - Up-to-date info  
  - Control over data sources  

---

# Why RAG Matters for GIS

* Spatial + tabular data often too big for prompt alone

* RAG lets you query:

  *POIs, parcels, census data, 311 reports

  * Enrich user queries with map extent filters

* Model sees just the relevant slice → makes better sense of it


---
layout: section
---

# 🗂️ Vectors in Databases

---

# 1. Can’t I just use Postgres?

- Embeddings = arrays of floats (e.g., `[0.12, -0.34, …]`)
- You **can** store them in `float[]` or `jsonb`
- But vanilla Postgres **can’t do efficient vector search**
  - No cosine similarity operators
  - No nearest-neighbor indexes
- Result: works for *tiny* datasets, but **too slow at scale**

---

# 2. Enter pgvector

- Postgres extension → adds a `vector` column type
- Similarity operators:  
  - `<->` cosine distance  
  - `<#>` inner product  
- Indexes for fast search (IVFFlat, HNSW)

```sql
CREATE TABLE pois (
  id text PRIMARY KEY,
  name text,
  embedding vector(1536)
);

CREATE INDEX ON pois
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

✅ Now Postgres can do semantic search

---

# Key Takeaways:

* Prompting = shape the output

* Fine-tuning = align style & consistency

* RAG = inject ground truth into the model

* In geospatial apps → combine PostGIS filters + vector search + LLM summaries
