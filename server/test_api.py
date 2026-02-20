import requests
import json

URL = "http://localhost:8000/api/v1/summarize"
TRANSCRIPT = """
Team sync started at 10 AM. Anna mentioned the launch date is confirmed for March 14. 
Engineering flagged a risk on analytics stability. Victor needs to fix the tracking bug by Friday. 
Priya will update the onboarding deck for the sales meeting next week. 
Decision: We will move the mobile release to April to prioritize web stability.
Important: The marketing budget for Q1 is finalized.
"""

def test_summarize():
    payload = {"transcript": TRANSCRIPT}
    try:
        response = requests.post(URL, json=payload)
        if response.status_code == 200:
            print("Successfully received structured output:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Failed to connect to server: {e}")

if __name__ == "__main__":
    test_summarize()
