# Core AgentManager and EmbeddingManager for LLM/embedding provider selection
from .strategies.wrapper import JSONWrapper, MDWrapper
from .providers.base import Provider, EmbeddingProvider


class AgentManager:
    def __init__(
        self,
        strategy: str | None = None,
        model: str = "gemma3:4b",
        model_provider: str = "ollama",
    ):
        if strategy == "md":
            self.strategy = MDWrapper()
        else:
            self.strategy = JSONWrapper()
        self.model = model
        self.model_provider = model_provider

    async def _get_provider(self, **kwargs):
        # Provider selection logic here
        pass

    async def run(self, prompt: str, **kwargs):
        provider = await self._get_provider(**kwargs)
        return await self.strategy(prompt, provider, **kwargs)

    def extract_json_resume(self, text_content: str):
        # Dummy implementation for now
        # In production, this should call an LLM or extraction pipeline
        return {}


class EmbeddingManager:
    def __init__(
        self, model: str = "default-embedding-model", model_provider: str = "ollama"
    ):
        self._model = model
        self._model_provider = model_provider

    async def _get_embedding_provider(self, **kwargs):
        # Embedding provider selection logic here
        pass
