from typing import List, Optional, Literal
import re

def normalize_newlines(text: str) -> str:
    # Replace multiple newlines with a single newline
    return re.sub(r'\n+', '\n', text).strip()

ModelType = Literal["openai", "llama", "huggingface"]

defaultModels = dict(
    openai="cl100k_base",
    llama="meta-llama/Llama-2-7b-hf",
    huggingface="distilbert-base-uncased",
)

def get_tokenizer(model_type: ModelType = 'openai', model_name: Optional[str] = None):
    """
    Returns the appropriate tokenizer for the given model type.
    model_type: "openai", "llama", or "huggingface"
    model_name: For HuggingFace/Llama, the model repo name (e.g., "meta-llama/Llama-2-7b-hf")
    """
    if model_type == "openai":
        import tiktoken
        # You can adjust encoding name as needed for your OpenAI model
        return tiktoken.get_encoding(model_name or defaultModels.get('openai') or 'cl100k_base')
    else:
        from transformers import AutoTokenizer
        if not model_name:
            model_name = defaultModels.get(model_type or 'llama')
        return AutoTokenizer.from_pretrained(model_name)
   

def chunk_by_tokens(
    text: str,
    tokenizer,
    chunk_size: int = 512,
    overlap: int = 50,
) -> List[str]:
    """
    Chunks text by tokens using the provided tokenizer.
    """
    # HuggingFace tokenizers use return_tensors and return_attention_mask, tiktoken does not
    chunks = []
    tokens = tokenizer.encode(normalize_newlines(text)) if hasattr(tokenizer, "decode") else tokenizer.encode(text)
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk = tokens[i:i + chunk_size]
        # tiktoken and HF both have decode, but tiktoken's decode expects a list, HF expects ids
        chunk_text = tokenizer.decode(chunk)
        chunks.append(chunk_text)
        if i + chunk_size >= len(tokens):
            break
    return chunks