import httpx
import json
from typing import Optional, Dict, Any
from config.settings import settings

class OllamaService:
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
    
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate response using Ollama"""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Low temperature for more consistent SQL generation
                "top_k": 10,
                "top_p": 0.3
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
        except Exception as e:
            raise Exception(f"Ollama service error: {str(e)}")
    
    async def check_health(self) -> bool:
        """Check if Ollama service is available"""
        try:
            url = f"{self.base_url}/api/tags"
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                return response.status_code == 200
        except:
            return False

ollama_service = OllamaService()