import json
import urllib.request
import urllib.error
import google.generativeai as genai
from backend.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
elif settings.OPENROUTER_API_KEY:
    print(f"OpenRouter active using model: {settings.OPENROUTER_MODEL}")

def call_openrouter(messages: list) -> str:
    if not settings.OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not set.")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "InsightAI"
    }
    
    data = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages
    }
    
    req_body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=30) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        return res_json["choices"][0]["message"]["content"]

def call_gemini(contents: list) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(contents)
    return response.text.strip()
