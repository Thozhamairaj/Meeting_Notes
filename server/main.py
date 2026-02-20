import os
import json
import requests
from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MeetMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "MeetMind AI API is running", "endpoint": "/api/v1/summarize"}

API_KEY = os.getenv("OPENAI_API_KEY", "")
IS_HF = API_KEY.startswith("hf_")

# Setup OpenAI client if not HF
client = None
if not IS_HF:
    client = OpenAI(api_key=API_KEY if API_KEY else "your-key-here")

class ActionItem(BaseModel):
    task: str
    owner: str = Field(default="Unassigned")
    deadline: str = Field(default="Not Mentioned")
    priority: Literal["High", "Medium", "Low"] = Field(default="Medium")

class SummaryResponse(BaseModel):
    summary: str = Field(description="2-4 line summary of the meeting")
    key_points: List[str]
    action_items: List[ActionItem]

class TranscriptRequest(BaseModel):
    transcript: str

SYSTEM_PROMPT = """You are a professional meeting assistant. Analyze the provided meeting transcript and return ONLY a valid JSON object — no markdown, no code fences, no comments, no explanations.

The JSON must follow this exact structure:
{
  "summary": "<2-4 sentence paragraph summarizing the meeting>",
  "key_points": [
    "<plain string point 1>",
    "<plain string point 2>"
  ],
  "action_items": [
    {
      "task": "<what needs to be done>",
      "owner": "<person responsible, or 'Unassigned'>",
      "deadline": "<natural language deadline like 'Tonight 9 PM' or 'Not Mentioned'>",
      "priority": "<exactly one of: High, Medium, Low>"
    }
  ]
}

STRICT RULES:
- Output ONLY the raw JSON. No ```json``` fences, no // comments, no extra text.
- summary must be a plain string on one line, no newlines inside the string.
- key_points must be a flat array of plain strings, NOT objects.
- deadline must be natural language (e.g. 'Tomorrow 6 PM', 'Friday', 'Not Mentioned'). Never use ISO dates or placeholders like 'YYYY-MM-XX'.
- priority must be exactly 'High', 'Medium', or 'Low'.
- owner must be a name or 'Unassigned'.
"""

def call_huggingface(transcript: str):
    # Using OpenAI-compatible endpoint on HuggingFace router
    api_url = "https://router.huggingface.co/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    response = requests.post(
        api_url,
        headers=headers,
        json={
            "model": "mistralai/Mistral-7B-Instruct-v0.2",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT + "\n\nIMPORTANT: Your entire response must be valid JSON only. No explanations, no markdown."},
                {"role": "user", "content": f"Transcript:\n{transcript}"}
            ],
            "max_tokens": 1000,
        },
        timeout=60
    )

    print(f"[HF] Status: {response.status_code}")

    if response.status_code != 200:
        raise Exception(f"HF API Error {response.status_code}: {response.text}")

    raw_content = response.json()["choices"][0]["message"]["content"].strip()
    print(f"[HF] Generated text: {raw_content[:300]}")

    try:
        import re
        # Strip markdown code fences if present
        json_str = raw_content
        if "```json" in json_str:
            json_str = json_str.split("```json")[-1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].strip()

        # Strip JS-style // comments (model sometimes adds these)
        json_str = re.sub(r'//[^\n]*', '', json_str)

        # Strip trailing commas before ] or } (illegal in JSON)
        json_str = re.sub(r',\s*([}\]])', r'\1', json_str)

        # Replace triple-quoted strings """...""" → collapse to single line string
        json_str = re.sub(r'"""(.*?)"""', lambda m: '"' + m.group(1).replace('\n', ' ').replace('"', '\\"').strip() + '"', json_str, flags=re.DOTALL)

        # Fix missing commas between top-level fields (common local model error)
        # Look for "Field": ... (no comma) "NextField":
        # This is a bit risky but helps with the specific error observed
        json_str = re.sub(r'\"\s*\n\s*\"', '",\n  "', json_str)

        # If model output multiple JSON blocks (e.g. separated by """json), keep only first
        if re.search(r'\}\s*"""', json_str) or re.search(r'\}\s*\{', json_str):
            # Extract first complete JSON object
            depth = 0
            end = 0
            for i, ch in enumerate(json_str):
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            json_str = json_str[:end].strip()

        # Try direct parse first
        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError:
            # First retry: Try adding missing commas between major fields if they are missing
            # Pattern: "Value" "Key" -> "Value", "Key"
            # We already tried a simple regex above, let's try a more aggressive one for specific structure
            # often it misses comma after summary string or key_points list
            try:
                # Add comma after "summary": "..." if followed by "key_points"
                json_str_fix = re.sub(r'("summary":\s*".*?")\s*"key_points"', r'\1, "key_points"', json_str, flags=re.DOTALL)
                # Add comma after "key_points": [...] if followed by "action_items"
                json_str_fix = re.sub(r'("key_points":\s*\[.*?\])\s*"action_items"', r'\1, "action_items"', json_str_fix, flags=re.DOTALL)
                parsed = json.loads(json_str_fix)
            except json.JSONDecodeError:
                 # Sanitize control characters inside JSON string values as last resort
                sanitized = []
                in_string = False
                escaped = False
                for ch in json_str:
                    if escaped:
                        sanitized.append(ch)
                        escaped = False
                    elif ch == '\\':
                        sanitized.append(ch)
                        escaped = True
                    elif ch == '"':
                        in_string = not in_string
                        sanitized.append(ch)
                    elif in_string and ch in ('\n', '\r', '\t'):
                        sanitized.append(' ')
                    else:
                        sanitized.append(ch)
                parsed = json.loads(''.join(sanitized))

        # ── Normalize summary ────────────────────────────────────────────────
        # Handle: summary / concise_summary / meeting_summary / nested dict
        summary_val = (
            parsed.get("summary") or
            parsed.get("concise_summary") or
            parsed.get("meeting_summary") or ""
        )
        if isinstance(summary_val, dict):
            # e.g. {"concise_summary": [...]} or {"text": "..."}
            summary_val = (
                summary_val.get("text") or
                summary_val.get("summary") or
                " ".join(summary_val.values()) if summary_val else ""
            )
        if isinstance(summary_val, list):
            summary_val = " ".join(str(s) for s in summary_val)
        parsed["summary"] = str(summary_val).strip()

        # ── Normalize key_points ─────────────────────────────────────────────
        # Handle: key_points / key_points_discussed / key_points_list / points
        kp = (
            parsed.get("key_points") or
            parsed.get("key_points_discussed") or
            parsed.get("key_points_list") or
            parsed.get("points") or []
        )
        if kp and isinstance(kp[0], dict):
            kp = [
                item.get("description") or item.get("point") or
                item.get("text") or str(item)
                for item in kp
            ]
        parsed["key_points"] = [str(p).strip() for p in kp]
        for k in ("key_points_discussed", "key_points_list", "points"):
            parsed.pop(k, None)

        # ── Normalize action_items ───────────────────────────────────────────
        # Handle: action_items / action_items_list / tasks / action_points
        ai = (
            parsed.get("action_items") or
            parsed.get("action_items_list") or
            parsed.get("tasks") or
            parsed.get("action_points") or []
        )
        for k in ("action_items_list", "tasks", "action_points"):
            parsed.pop(k, None)

        # Remove items with no real owner or no real deadline
        bad_owners = {"unassigned", "", "n/a", "none", "all", "all team members"}
        bad_deadlines = {"not mentioned", "", "n/a", "none", "tbd", "to be determined"}
        ai = [
            item for item in ai
            if item.get("owner", "").strip().lower() not in bad_owners
            and item.get("deadline", "").strip().lower() not in bad_deadlines
        ]

        # Deduplicate exact task text (case-insensitive)
        seen_tasks = set()
        unique_ai = []
        for item in ai:
            key = item.get("task", "").strip().lower()
            if key not in seen_tasks:
                seen_tasks.add(key)
                unique_ai.append(item)
        ai = unique_ai

        # Merge items with same owner + deadline into one row
        merged: dict = {}
        for item in ai:
            owner = item.get("owner", "").strip()
            deadline = item.get("deadline", "").strip()
            key = (owner.lower(), deadline.lower())
            if key in merged:
                existing = merged[key]
                existing["task"] = existing["task"] + "; " + item["task"]
                # Keep highest priority
                pri_order = {"High": 0, "Medium": 1, "Low": 2}
                if pri_order.get(item.get("priority", "Low"), 2) < pri_order.get(existing.get("priority", "Low"), 2):
                    existing["priority"] = item["priority"]
            else:
                merged[key] = dict(item)
        ai = list(merged.values())

        # Sort: earliest deadline first
        def deadline_score(item):
            dl = item.get("deadline", "").lower()
            hour = 12
            h = re.search(r'(\d{1,2})\s*(am|pm)', dl)
            if h:
                hour = int(h.group(1)) % 12 + (12 if h.group(2) == 'pm' else 0)
            if "tonight" in dl or "today" in dl:
                return (0, hour)
            if "tomorrow" in dl:
                return (1, hour)
            if any(d in dl for d in ("monday","tuesday","wednesday","thursday","friday","saturday","sunday")):
                return (2, hour)
            return (3, hour)
        ai.sort(key=deadline_score)

        parsed["action_items"] = ai

        return parsed

    except Exception as e:
        raise Exception(f"Failed to parse HF JSON: {str(e)}. Raw content: {raw_content}")

# ── Export Endpoints ────────────────────────────────────────────────

class NotionExportRequest(BaseModel):
    token: str
    parent_page_id: str
    title: str
    summary: str
    action_items: List[ActionItem]

@app.post("/api/v1/export/notion")
async def export_to_notion(req: NotionExportRequest):
    try:
        url = "https://api.notion.com/v1/pages"
        headers = {
            "Authorization": f"Bearer {req.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        # Build blocks
        children = []
        
        # Summary heading + text
        children.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {"rich_text": [{"text": {"content": "Meeting Summary"}}]}
        })
        children.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": [{"text": {"content": req.summary}}]}
        })
        
        # Action Items heading
        children.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {"rich_text": [{"text": {"content": "Action Items"}}]}
        })
        
        # Action Items as To-do blocks
        for item in req.action_items:
            content = f"{item.task} (Owner: {item.owner}, Deadline: {item.deadline})"
            children.append({
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": content}}],
                    "checked": False
                }
            })

        payload = {
            "parent": {"page_id": req.parent_page_id},
            "properties": {
                "title": {"title": [{"text": {"content": req.title}}]}
            },
            "children": children
        }
        
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=f"Notion API Error: {res.text}")
            
        return {"status": "success", "url": res.json().get("url")}

    except Exception as e:
        print(f"Notion Export Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class TrelloExportRequest(BaseModel):
    api_key: str
    token: str
    list_id: str
    action_items: List[ActionItem]

@app.post("/api/v1/export/trello")
async def export_to_trello(req: TrelloExportRequest):
    try:
        base_url = "https://api.trello.com/1/cards"
        created_cards = []
        
        for item in req.action_items:
            query = {
                'key': req.api_key,
                'token': req.token,
                'idList': req.list_id,
                'name': item.task,
                'desc': f"Owner: {item.owner}\nDeadline: {item.deadline}\nPriority: {item.priority}",
                'pos': 'bottom'
            }
            
            # Map priority to labels (simplified: needs board label IDs, but skipping for MVP)
            # Could fetch labels from board, but that requires extra calls.
            
            res = requests.post(base_url, params=query)
            if res.status_code != 200:
                 raise HTTPException(status_code=res.status_code, detail=f"Trello API Error: {res.text}")
            created_cards.append(res.json().get("url"))
            
        return {"status": "success", "cards_created": len(created_cards)}

    except Exception as e:
        print(f"Trello Export Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/summarize", response_model=SummaryResponse)
async def summarize_meeting(request: TranscriptRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")

    try:
        if IS_HF:
            content_dict = call_huggingface(request.transcript)
            return SummaryResponse.model_validate(content_dict)
        else:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Transcript:\n{request.transcript}"}
                ],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return SummaryResponse.model_validate_json(content)
    
    except Exception as e:
        print(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class EnvTrelloExportRequest(BaseModel):
    action_items: List[ActionItem]

@app.post("/export-to-trello")
async def export_to_trello_env(req: EnvTrelloExportRequest):
    # Load from env
    api_key = os.getenv("TRELLO_KEY")
    token = os.getenv("TRELLO_TOKEN")
    list_id = os.getenv("TRELLO_LIST_ID")
    
    if not all([api_key, token, list_id]):
        raise HTTPException(status_code=500, detail="Missing server-side Trello configuration (TRELLO_KEY, TRELLO_TOKEN, TRELLO_LIST_ID).")

    try:
        base_url = "https://api.trello.com/1/cards"
        created_card_ids = []
        
        for item in req.action_items:
            query = {
                'key': api_key,
                'token': token,
                'idList': list_id,
                'name': item.task,
                'desc': f"Owner: {item.owner}\\nDeadline: {item.deadline}\\nPriority: {item.priority}",
                'pos': 'bottom'
            }
            
            res = requests.post(base_url, params=query)
            if res.status_code != 200:
                 raise HTTPException(status_code=res.status_code, detail=f"Trello API Error: {res.text}")
            created_card_ids.append(res.json().get("id"))
            
        return {"success": True, "created_card_ids": created_card_ids}

    except Exception as e:
        print(f"Env Trello Export Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
