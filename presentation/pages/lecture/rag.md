# What is RAG?

**Retrieval-Augmented Generation**  
- LLM + database = smarter answers  
- Keeps responses accurate & grounded in your data  
  - reduces hallucinations 

![rag-flow](../../images/rag_workflow.svg)

---

# Why RAG Matters

- LLMs alone “forget” or hallucinate  
- With RAG:  
  - Context-aware answers  
  - Up-to-date info  
  - Control over data sources  

🌍 Example: Querying parcel data by natural language, build a valid query by supplying true data schema with examples.  

---

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