---
description: how to run the backend server
---

1. Open a new terminal.
2. Navigate to the root of the project: `cd /home/user1/Documents/meetmind-ai`
// turbo
3. Navigate to the server directory: `cd server`
// turbo
4. Activate the virtual environment: `source venv/bin/activate`
// turbo
5. Run the backend server: `python main.py` or `uvicorn main:app --reload`

> [!NOTE]
> Ensure you have your `OPENAI_API_KEY` set in the `server/.env` file before running the server.
