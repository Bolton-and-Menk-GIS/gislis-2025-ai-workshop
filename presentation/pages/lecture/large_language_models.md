---
# You can also start simply with 'default'
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: https://cover.sli.dev
# some information about your slides (markdown enabled)
# apply unocss classes to the current slide
# class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
# open graph
# seoMeta:
#  ogImage: https://cover.sli.dev
---
## 🧠 What Is a *Large Language Model (LLM)*?

At the most basic level, an LLM is:



<div v-click>

A program that has learned to **predict the next word (or part of a word)** in a sentence based on everything that came before it.

</div>

<div v-click>

It doesn’t “think” or “understand” like a human — it just got *really, really good* at filling in the blank.

</div>


<div mt-10 v-click>

**Example:**

</div>

<div v-click depth="2"> 

> Input: `the cat sat on the ___` 

</div>

<div v-click mt-4 depth="2"> 

> The model might predict: `mat`, `couch`, `floor` — based on probabilities learned during training.

</div>
  

<!--
Content before the first click

[click] This will be highlighted after the first click

Also highlighted after the first click

- [click] This list element will be highlighted after the second click

[click] Last click (skip two clicks)
-->

---

## LLM

They use deep learning, specifically the transformer architecture, to analyze massive datasets and and predict text one word at a time.



## 🔣 What Are Tokens?

A **token** is a small chunk of text — usually:
- a word (`dog`, `apple`)
- part of a word (`ing`, `pre`, `tion`)
- punctuation or whitespace

**Example tokenization:**


GPT models use a tokenizer to split all text into tokens so that it can convert them into numbers (which are easier for the model to work with).

---

## 🧪 How Was an LLM Trained?

1. **Collect** large amounts of text: books, articles, code, websites, etc.
2. **Tokenize** the text into numeric sequences.
3. **Train a neural network** to guess the next token, given a long sequence of previous tokens.
4. **Adjust weights (parameters)** each time it guesses wrong — this is how it learns.

This is repeated **billions of times** until the model gets very good at predicting what comes next.

---

## 🧮 What Are Parameters?

**Parameters** are the millions or billions of tiny numbers (weights) inside the neural network.

They determine how the model transforms input tokens into predictions.

> Think of parameters as the knobs that were tuned during training to help the model make better decisions.

- GPT-3: ~175 billion parameters  
- GPT-4: unknown (likely more)

Each parameter helps the model form better associations and learn patterns in language.

---

## 📏 Do More Parameters Make It More Intelligent?

**Generally yes**, up to a point.

More parameters → the model can:
- store more patterns
- form more abstract connections
- understand more nuance and long context

But:
- Adding size increases complexity and cost
- Model quality also depends on training **data**, **architecture**, and **alignment**

---

## 🤔 So What’s Happening When You Chat With It?

Every time you send a message:

1. Your input is **tokenized** into numbers.
2. The model uses its parameters to **predict the most likely next token**, one-by-one.
3. Tokens are **decoded back into text**.
4. It stops when it decides it's finished or reaches a token limit.

---

## 📦 TL;DR — Quick Glossary

| Term         | Meaning                                                                 |
|--------------|-------------------------------------------------------------------------|
| **LLM**      | A next-token predictor trained on massive text corpora                  |
| **Token**    | A chunk of text (word, part of a word, or punctuation)                  |
| **Parameter**| A weight in the neural net adjusted during training                     |
| **Training** | The process of minimizing prediction errors on huge text data           |
| **Inference**| When the model is used to generate output (like during a chat)          |

---

# LLMs for Developers

## Superpowers for Productivity
- Writing cleaner code faster  
- Auto-generating tests & docs  
- Acting as a *pair programmer*  
- Refactoring & exploring new APIs  

👨‍💻 Example: GitHub Copilot inline code suggestion screenshot  

---

# LLMs for Data

## Making Sense of Information
- Summarization of long text  
- Q&A from documents  
- Extracting structured fields (e.g., JSON, tables)  
- Natural language → SQL  

📊 *Visual:* before/after example (long text → short summary)  


