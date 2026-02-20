### Sample Input (Transcript)
"""
Team sync started at 10 AM. Anna mentioned the launch date is confirmed for March 14. 
Engineering flagged a risk on analytics stability. Victor needs to fix the tracking bug by Friday. 
Priya will update the onboarding deck for the sales meeting next week. 
Decision: We will move the mobile release to April to prioritize web stability.
Important: The marketing budget for Q1 is finalized.
"""

### Expected Output (JSON)
{
  "summary": "The team confirmed the March 14 launch date and addressed engineering risks regarding analytics stability. A key decision was made to delay the mobile release to April to ensure web quality, and the Q1 marketing budget was finalized.",
  "key_points": [
    "March 14 confirmed as the official launch date.",
    "Engineering identified risks in analytics tracking stability.",
    "Mobile release postponed to April.",
    "Q1 marketing budget is now finalized."
  ],
  "action_items": [
    {
      "task": "Fix the tracking bug",
      "owner": "Victor",
      "deadline": "Friday",
      "priority": "High"
    },
    {
      "task": "Update the onboarding deck",
      "owner": "Priya",
      "deadline": "Next week",
      "priority": "Medium"
    }
  ]
}
