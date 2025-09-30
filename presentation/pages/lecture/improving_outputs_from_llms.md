---
layout: section
text: center
---

# Creating AI-Driven Solutions

---

## Why use AI in your applications?

<div v-click>

**To Help to Make sense of Data**
- Summarization of long text  
- Q&A from documents  
- Extracting structured fields (e.g., JSON, tables)  
- convert unstructured data into structured data
- Natural language → SQL  
</div>

<div v-click>

**Challenges**

- How to provide the most accurate information to your users?
  - Prevent LLM Hallucination by making your AI features *smarter*
  - Provide your own ground truth data to the LLM
</div>

---

# How to Improve Outputs from LLMs?

LLMs will often hallucinate and can only give information based on what they were trained on. But what can we do to extract better outputs?

* Use better **prompts**

* *Fine Tuning*

* *Retrieval-Augmented Generation (RAG)*



---

# ✍️ Prompt Engineering

---

# What is Prompt Engineering?

- Crafting inputs to LLMs to get better outputs  
- Affects **accuracy**, **reliability**, and **usefulness**  
- More than wording — it’s about **clarity & constraints**  

💡 Think of prompts as your "API contract" with the model

---

# Common Techniques

- Be **specific** → avoid vague questions  
- Give **context** → domain info, examples, constraints  
- Ask for **format** → JSON, bullets, tables  
- Iterate → refine your prompt based on results  

---

# Calling LLMs in your Applications

```py
#!usr/bin/env python3
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",  # Or another suitable model
    messages=[
        {"role": "system", "content": "You are a helpful assistant."}, # <- your prompt
        {"role": "user", "content": "Explain the concept of prompt engineering."}
    ]
)

print(response.choices[0].message.content)
```

In the example above, the prompt `"You are a helpful assistant"` is what tells the LLM to do when it receives any user messages.
---

# Example: Vague vs Improved Prompt

````md magic-move
```
// ❌ Vague prompt (too vague)
Write something about Minneapolis
```

```
// ⚠️ Better, but still too broad
Tell me about Minneapolis geography
```

```
// ✅ Improved prompt
You are a helpful GIS assistant.  
Summarize 3 key facts about Minneapolis related to geography and population.  
Return in bullet points, 1–2 sentences each.
```
````
---

# Advanced Prompt Techniques

- **Role prompting**  
  *"You are a GIS analyst helping city planners…"*
- **Chain-of-thought style** (show reasoning steps)  
  *"Explain step by step how you arrived at the result…"*
- **Create Rules for the LLM to Follow**
  * Provide rules on how certain data should be interpreted
- **Few-shot examples**  
  Provide examples of input → output to guide style
- **Output constraints**  
  Ask for JSON, tables, or specific schema

---

# Example: Structured Output

````md magic-move
```
// ⚠️ Basic prompt
List some neighborhoods in Minneapolis
```
```
// ✅ Structured prompt
You are a GIS assistant.  
List 5 neighborhoods in Minneapolis.  
Return as JSON with fields: { "name": string, "population": int }
```
````

---

# Adding *Context Enrichment*

* LLMs don’t know your private data

* You can inject external context into the prompt

  * Docs, PDFs, or database records

  * Summaries, examples, reference tables
  
  * Can be done on behalf of the user from the *client* or *server* side

* This gives the model the “grounding” it needs

💡 This is the bridge to RAG

---

# Example: With Enriched Context

````md magic-move
```
// ⚠️ Without context
What zoning districts allow multi-family housing in Minneapolis?
```

```
// ✅ With context enrichment
You are a planning assistant.  
Use the following zoning code table:  

R1 = Single Family  
R2 = Duplex  
R3 = Multi-Family  
C1 = Commercial  

Question: What zoning districts allow multi-family housing in Minneapolis?  
Answer in 2–3 bullet points.
```
````

---
layout: cover
---

# Natural Language Query Demo

---
layout: cover
---

# ⚙️ Fine-tuning

---

# What is Fine-tuning?

- Training a base LLM further on **your domain data**  
- Adjusts model weights → custom vocabulary, style, tone  
- Useful when:  
  - You need **consistent style/formatting**  
  - You have **lots of similar examples** (support chats, product docs)  
  - Prompts alone aren’t enough  

❗ Not covered hands-on in this workshop — but good to understand

---

# Example: Prompt vs Fine-tuned

````md magic-move
```
// ⚠️ Prompt only
Summarize this incident report in 2 sentences.
Result: inconsistent tone, varying detail.
```

```
// ✅ Fine-tuned model
[trained on 10k incident reports]  
Result: concise, consistent summaries tailored to your org.
```
````

---

# Data Needed

* Input → Output pairs (instructions + target response)

* Cleaned, representative of real use (avoid boilerplate noise)

* Evaluation set held out for measuring quality

* Typical scale: hundreds → tens of thousands of examples
  
---

# Cost, Risk, & Operations

* Training cost & time vs. team productivity gains
  
* Drift: models can overfit stale patterns → schedule re-trains
  
* Governance: store dataset lineage, consent, PII handling
  
* Monitoring: track style/accuracy regressions with evaluations

---

# Key Takeaways

* Fine-tuning = reliable style + domain alignment

* Needs good data more than huge data

* Still pair with prompts for task setup & RAG for facts

* Start small: prototype with prompts → graduate to fine-tune when consistency is the blocker