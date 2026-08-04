import os
import numpy as np
from typing import List, Optional
from transformers import AutoTokenizer


def get_embeddings_litellm(
    texts: List[str],
    model: Optional[str] = None,
    provider: Optional[str] = None,
    api_base: Optional[str] = None,
    api_key: Optional[str] = None,
) -> List[List[float]]:
    # Allow override via env vars or function args
    model = model or os.environ.get("EMBED_MODEL", "ollama/nomic-embed-text")
    provider = provider or os.environ.get("LITELLM_PROVIDER", "ollama")
    api_base = api_base or os.environ.get("LITELLM_API_BASE", "http://localhost:11434")
    api_key = api_key or os.environ.get("LITELLM_API_KEY", "sk-local")
    import litellm

    response = litellm.embedding(  # pyright: ignore[reportUnknownMemberType]
        model=model, input=texts, api_base=api_base, api_key=api_key, provider=provider
    )
    # OpenAI-compatible: response['data'] is a list of {embedding, index, ...}
    return [item["embedding"] for item in response["data"]]


def weighted_pool_embeddings(
    chunk_texts: List[str],
    model: Optional[str] = None,
    provider: Optional[str] = None,
    api_base: Optional[str] = None,
    api_key: Optional[str] = None,
) -> List[List[float]]:
    """
    Compute a weighted average of chunk embeddings, using chunk size (in characters) as weights.
    Returns a list of pooled embedding vectors (one per input string).
    Optimized: batch and cache fragment embeddings to minimize redundant calls.
    """
    if not chunk_texts:
        raise ValueError("No input provided for embedding.")
    from transformers import AutoTokenizer
    from functools import lru_cache
    import logging

    logger = logging.getLogger(__name__)

    # LRU cache for fragment-level embeddings (in-memory, process-local)
    @lru_cache(maxsize=256)
    def cached_embedding(
        text: str,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        api_base: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        # Use get_embeddings_litellm for a single fragment
        emb = get_embeddings_litellm(
            [text], model=model, provider=provider, api_base=api_base, api_key=api_key
        )
        return emb[0] if emb else None

    all_chunks: List[str] = []
    chunk_map: List[int] = []  # Maps chunk index to original string index
    chunk_texts_flat: List[str] = []  # Flat list of all chunk strings
    chunk_indices: List[tuple[int, int]] = []  # (orig_idx, chunk_idx_within_orig)

    # Use chunk_text_by_tokens for chunking
    for idx, text in enumerate(chunk_texts):
        decoded_chunks = chunk_text_by_tokens(text)
        chunk_token_counts = [len(chunk) for chunk in decoded_chunks]
        logger.info(
            f"weighted_pool_embeddings: input idx {idx} split into {len(decoded_chunks)} chunks, token counts: {chunk_token_counts}, max_tokens_per_chunk: 8064"
        )
        for j, chunk in enumerate(decoded_chunks):
            all_chunks.append(chunk)
            chunk_map.append(idx)
            chunk_texts_flat.append(chunk)
            chunk_indices.append((idx, j))

    # Batch: find which chunks are already cached
    embeddings: List[Optional[List[float]]] = [
        None for _ in range(len(chunk_texts_flat))
    ]
    uncached_indices: List[int] = []
    uncached_chunks: List[str] = []
    for i, chunk in enumerate(chunk_texts_flat):
        try:
            emb = cached_embedding(chunk, model, provider, api_base, api_key)
            if emb is not None:
                embeddings[i] = emb  # emb is a list of floats (embedding vector)
            else:
                uncached_indices.append(i)
                uncached_chunks.append(chunk)
        except Exception:
            uncached_indices.append(i)
            uncached_chunks.append(chunk)

    # Batch embed only uncached chunks
    if uncached_chunks:
        new_embs = get_embeddings_litellm(
            uncached_chunks,
            model=model,
            provider=provider,
            api_base=api_base,
            api_key=api_key,
        )
        for idx, emb in zip(uncached_indices, new_embs):
            embeddings[idx] = emb  # emb is a list of floats (embedding vector)
            # Update cache
            try:
                cached_embedding(
                    chunk_texts_flat[idx], model, provider, api_base, api_key
                )
            except Exception:
                pass

    # Pool embeddings for each original input string
    pooled_embeddings: List[List[float]] = []
    for idx in range(len(chunk_texts)):
        idxs = [i for i, m in enumerate(chunk_map) if m == idx]
        if not idxs:
            raise ValueError(f"No chunks found for input index {idx}")
        these_embs = np.array([embeddings[i] for i in idxs])
        these_sizes = np.array([len(all_chunks[i]) for i in idxs], dtype=np.float32)
        these_sizes = these_sizes / these_sizes.sum()
        pooled = np.asarray(
            (these_embs * these_sizes[:, None]).sum(axis=0), dtype=np.float32
        )
        pooled_embeddings.append(pooled.tolist())
    # Always return a list of pooled embeddings (one per input string)
    return pooled_embeddings


def chunk_text_by_tokens(
    text: str,
    max_tokens: int = 500,
) -> list[str]:
    """
    Split text into chunks, each with at most max_tokens tokens, using the model's tokenizer.
    Returns a list of decoded text chunks.
    """
    embed_model = os.environ.get("EMBED_MODEL", "ollama/nomic-embed-text")
    tokenizer_model = os.environ.get("TOKENIZER_EMBED_MODEL", embed_model)
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_model)  # type: ignore
    tokens: list[int] = tokenizer.encode(text, add_special_tokens=False)  # pyright: ignore[reportUnknownVariableType, reportUnknownMemberType]
    chunks: list[list[int]] = [
        tokens[i : i + max_tokens]
        for i in range(0, len(tokens), max_tokens)  # pyright: ignore[reportUnknownArgumentType]
    ]
    decoded_chunks: list[str] = [tokenizer.decode(chunk) for chunk in chunks]  # pyright: ignore[reportUnknownMemberType]
    import logging

    logger = logging.getLogger(__name__)
    logger.info(
        f"chunk_text_by_tokens: {len(decoded_chunks)} chunks, sizes (chars): {[len(chunk) for chunk in decoded_chunks]}, total tokens: {len(tokens)}"  # pyright: ignore[reportUnknownArgumentType]
    )
    return decoded_chunks
