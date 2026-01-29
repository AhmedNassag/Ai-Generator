"""
Integration services module - Abstract LLM and ClickUp integrations.
Senior-grade: Service-based architecture with clean interfaces.
"""

import json
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod


class LLMService(ABC):
    """Abstract base for LLM integration."""

    @abstractmethod
    async def generate_schema(self, task_description: str) -> str:
        """Generate JSON schema from task description."""
        pass


class ClickUpService(ABC):
    """Abstract base for ClickUp integration."""

    @abstractmethod
    async def get_task(self, task_id: str) -> str:
        """Fetch task details from ClickUp."""
        pass


class OpenAILLMService(LLMService):
    """OpenAI LLM implementation."""

    def __init__(self, api_key: Optional[str] = None):
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.api_key)
            self.available = True
        except ImportError:
            self.available = False

    async def generate_schema(self, task_description: str) -> str:
        """Generate JSON schema using OpenAI."""
        if not self.available:
            raise ImportError("OpenAI client not available")

        prompt = self._build_prompt(task_description)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-5-nano",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI error: {e}")

    @staticmethod
    def _build_prompt(task_description: str) -> str:
        """Build system prompt for schema generation."""
        return f"""# You are a senior software architect and JSON schema generator.
Your ONLY task is to convert the user's task or feature description into a JSON object that STRICTLY follows the schema below.
# OUTPUT RULES (MANDATORY)

Output ONLY valid JSON.
Do NOT add explanations, comments, markdown, or text outside JSON.
Do NOT rename keys.
Do NOT set any special Characters or numbers in the keys.
DO NOT set any special Characters or numbers in the values.
DO NOT USE ANY SECIAL CHARACTERS FOR ANY KEY AND VALUE FOR ANY MODULE.
Do NOT invent fields or relationships not explicitly mentioned.
If something is unclear, make the most reasonable assumption based on common simple CRUD systems.

Field types must be one of:
   - string, textarea, integer, decimal, boolean, date, datetime, enum

Relationship types must be one of:
   - belongsTo, hasMany, belongsToMany, hasOne

BASE JSON STRUCTURE (DO NOT CHANGE):
{{
  "modules": [
    {{
      "name": "",
      "fields": [],
      "relationships": []
    }}
  ]
}}

TASK DESCRIPTION (SOURCE OF TRUTH):
{task_description}
"""


class ClickUpAPIService(ClickUpService):
    """ClickUp API implementation."""

    def __init__(self, api_token: Optional[str] = None):
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        self.api_token = api_token or os.getenv("CLICKUP_API_TOKEN")
        self.base_url = "https://api.clickup.com/api/v2/"
        self.available = bool(self.api_token)

    async def get_task(self, task_id: str) -> str:
        """Fetch task from ClickUp."""
        if not self.available:
            raise ImportError("ClickUp API token not configured")

        try:
            import requests
        except ImportError:
            raise ImportError("requests library not available")

        headers = {"Authorization": self.api_token}
        url = f"{self.base_url}task/{task_id}"

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return f"Title: {data.get('name', 'N/A')}\nDescription: {data.get('description', 'N/A')}"
        except Exception as e:
            raise RuntimeError(f"ClickUp error: {e}")


class IntegrationFactory:
    """Factory for creating integration services."""

    _llm_service: Optional[LLMService] = None
    _clickup_service: Optional[ClickUpService] = None

    @classmethod
    def get_llm_service(cls) -> LLMService:
        """Get or create LLM service."""
        if cls._llm_service is None:
            cls._llm_service = OpenAILLMService()
        return cls._llm_service

    @classmethod
    def get_clickup_service(cls) -> ClickUpService:
        """Get or create ClickUp service."""
        if cls._clickup_service is None:
            cls._clickup_service = ClickUpAPIService()
        return cls._clickup_service

    @classmethod
    def set_llm_service(cls, service: LLMService) -> None:
        """Set custom LLM service."""
        cls._llm_service = service

    @classmethod
    def set_clickup_service(cls, service: ClickUpService) -> None:
        """Set custom ClickUp service."""
        cls._clickup_service = service
