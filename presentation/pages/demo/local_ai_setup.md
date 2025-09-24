# Local AI Setup Guide 🚀

---

## 📥 Downloading Models

- Copy exact model name with parameter count
  - Example: `qwen2.5-coder:latest` or `qwen2.5-coder:3b`
- First-time downloads are automatic if exact name is pasted into model search box
- CLI command available: `ollama pull qwen2.5-coder:3b`


---

## 🌐 Open Web UI

- Recommended over default Ollama UI
- Documentation: [Open Web UI Docs](https://docs.openwebui.com/)
- Features:
  - Open Source LLM UI
  - Compatible with local/remote Ollama
  - OpenAI API compatibility ("OpenAPI" standard)
    - OpenAI
    - Google


---

## 🐍 Python Environment Setup

```bash
# Create new Python environment
"%PROGRAMFILES%\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" -m venv %USERPROFILE%\Desktop\openwebui

# Activate environment
%USERPROFILE%\Desktop\openwebui\Scripts\activate.bat

# Install and run
pip install open-webui
open-webui serve
```

- Access UI at: http://localhost:8080/
- Follow steps to create password

---

## 🎯 Model Selection

1. Click top-left to select model
2. Paste exact model name in search box
3. Select "Pull from ollama.com"

---

## 💻 VS Code Integration

- Use "Continue" extension
  - Supports: chat, autocomplete, edit, agent workflows
  - Available for VS Code and JetBrains
  - [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=Continue.continue)

---

## 🤖 Recommended Models

| Purpose | Model |
|---------|-------|
| Chat | qwen2.5-coder:latest |
| Embeddings | nomic-embed-text |
| Autocomplete | starcoder2:3b |

---
layout: image-right
image: ../../images/continue-configure-local.png
backgroundSize: 70%
---

## ⚙️ Configuration

1. Select "Or, configure your own models"
2. Choose Local -> Skip and configure manually\
-- or --
3. Access settings via Local Agent dropdown (cog wheel)

---
layout: two-cols
---

## 🎛️ Role Configuration

### Available Roles
- Chat
- Edit
- Apply
- Autocomplete
- Embed
- Rerank

::right::

<<< @/../Samples/Continue/config.yaml  {monaco}{height:'60vh'}

---
layout: image-right
image: ../../images/continue-chat-selection.png
backgroundSize: 90%
---

### Usage Tips
- Multiple models per role possible
- Chat/Agent: Select from dropdown in chat box

---
layout: image-left
image: ../../images/continue-autocomplete-selection.png
backgroundSize: 90%
---

### Usage Tips
- Multiple models per role possible
- Autocomplete: Click "Continue" in VS Code status bar

---
layout: center
class: text-center
---

# 🛠️ Creating a Python Toolbox Tool

<div class="text-xl text-blue-500 font-mono mb-4">
  📁 `Samples\sample_tool.pyt`
</div>

<v-clicks>

### Task 1: Documentation 📝
Add a Google style Python docstring to the `add_area_field` function. Follow existing docstring patterns. Match verbiage and style from rest of file.

### Task 2: Implementation ⚙️
Create a new ArcGIS Python Toolbox tool class wrapping the `buffer_features` function. Add it to the existing `Toolbox` class's tools list. Use `CalculateArea` tool as template

</v-clicks>

