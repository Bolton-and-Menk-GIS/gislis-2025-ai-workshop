## Natural Language Query Demo



---

### 🔄 Request Lifecycle

```text {*}{maxHeight:'450px'}
user input
   │
   ▼
[1] detect intent ───────────────▶ "query_data"?
   │                                   │
   ▼                                   ▼
[2] guess target layer        [3] not query_data → fallback response
   │
   ▼
[3] if layerInfo exists:
   ├─ does guessed layer ≠ layerInfo.name?
   │     ├─ YES → clear layerInfo and go to [4]
   │     └─ NO  → proceed to [6]
   │
   ▼
[4] requires enrichment:
   → respond with "please hold while I prepare that..."
   → frontend fetches fields + sample records
   → sends back context.layerInfo
   │
   ▼
[5] enrichment complete:
   └─ re-enters flow with enriched context
   │
   ▼
[6] generate query:
   └─ model = detect_target_model(user_prompt, layerInfo)
   └─ where clause + field selection built
   └─ selection sent to map layer
```


---

#### 🧠 Context Fields Used

| Field                  | Purpose                                                                 |
|------------------------|-------------------------------------------------------------------------|
| `layerInfo`            | Current enriched schema for one layer (`name`, `fields`, `samples`)     |
| `guess.layer`          | The layer the LLM believes matches the user prompt                      |
| `guess.confidence`     | Confidence score (0–100) of layer match                                 |
| `last_used_layer`      | The most recent layer used to detect when the user switches context     |
| `requires_layer_enrichment` | Set to `true` when schema info must be fetched on the frontend     |

---

#### 💬 Example Interaction

```text
user: show me the parcels on the 8000 block of 91st st s

→ backend detects intent: "query_data"
→ guesses layer: "Parcels" (confidence: 100)
→ current layerInfo = "MS4 Structure Inspections"
→ mismatch detected → triggers re-enrichment

client fetches schema + samples for "Parcels" layer
→ sends new context.layerInfo

→ backend generates:
   WHERE clause:
   "CAST(BLDG_NUM AS INT) BETWEEN 8000 AND 8999 AND SITUS_ADDRESS LIKE '%91ST ST S%'"

user: ok, now show only ones owned by smith

→ layerInfo is already "Parcels"
→ backend reuses it
→ WHERE clause: "OWNER_NAME LIKE '%SMITH%'"
```



---

# Key Takeaways

- AI = augmentation, not replacement  
- LLMs boost productivity *and* data workflows  
- RAG connects AI to your own data  
- GIS + AI = powerful, practical combo  