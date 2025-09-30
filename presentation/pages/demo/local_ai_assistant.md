

## 🦙 Ollama - run models locally
- Run local LLMs on your machine
- No cloud dependency
- Privacy and control over your AI models

---

## 📏 Model Size Considerations

### Parameter Count Matters

- Directly impacts performance and requirements
- Larger models = better performance but higher resource needs

🔍 Checking Your GPU Memory

1. Open Task Manager
2. Go to Performance tab
3. Select GPU
4. Check **Dedicated** and **Shared** GPU Memory

💫 Performance Note
- **Dedicated memory** >> **Shared memory**
- ⚡ Use dedicated memory for best performance

---

## 💻 GPU Memory Requirements

| Model Size | Parameters | VRAM Needed |
|------------|------------|-------------|
| **Tiny** | 100M - 2B | 2-4GB |
| **Small** | 2B - 10B | 6-16GB |
| **Medium** | 10B - 20B | 16-24GB |
| **Large** | 20B - 70B | 24-48GB |
| **Very Large** | 70B - 110B | 80GB+ |
| **Super Large** | 110B+ | Multiple 80GB+ GPUs |

*Source: [DatabaseMart GPU Guide](https://www.databasemart.com/blog/choosing-the-right-gpu-for-popluar-llms-on-ollama)*


---
layout: image-right
image: /images/tools-model-download.png
backgroundSize: 70%
---

## 🔎 Finding Suitable Models

- 🌐 Browse models at: https://ollama.com/search

<br></br>
#### 🛠 Agent Tasks
- Model needs Tools capability

---
layout: image-left
image: /images/coding-model-download.png
backgroundSize: 70%
---

#### 👨‍💻 Coding Tasks
- Some models are specifically designed for coding
- Look for code-focused model descriptions
- Often more parameters == more languages

---
layout: image-right
image: /images/model-download-parameters.png
backgroundSize: 70%
---

#### 📦 Model versions
- 📊 Most models come in different sizes (parameter count)
- 🔧 Sometimes other specialized versions

---

## Local Model Checklist

1. ✅ Check your GPU memory
2. ✅ Choose appropriate model size
3. ✅ Consider your use case (coding vs general)
4. ✅ Filter by "Tools" for agent tasks
5. ✅ Install and test with Ollama