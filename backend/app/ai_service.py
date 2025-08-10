import os
import openai
from typing import List, Dict
import json

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_habit_plan(goal_description: str) -> List[Dict]:
    """
    Analyzes a user's goal and returns a structured list of suggested habits.
    """
    prompt = f"""
You are an expert in behavior design and habit formation.
Your task is to take the provided goal and break it down into a series of small, actionable habits.

Requirements:
1. Each habit must be clear, specific, and easy to act upon.
2. Assign a frequency to each habit: only 'daily' or 'weekly' (no other values).
3. Return ONLY a raw JSON array (no explanations, no extra text).
4. The JSON output must strictly follow this structure:

[
  {{
    "description": "string - short, clear habit description",
    "frequency": "daily | weekly"
  }},
  ...
]

Goal: "{goal_description}"

JSON output:
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that helps users break down their goals into actionable habits."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()

        # Remove Markdown code block formatting if present
        if content.startswith("```"):
            content = content.strip("`")
            # Remove leading json tag if present
            if content.lower().startswith("json"):
                content = content[4:].strip()

        return json.loads(content)

    except Exception as e:
        print(f"An error occurred: {e}")
        return []