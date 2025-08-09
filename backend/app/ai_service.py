import os
import openai
from typing import List, Dict

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_habit_plan(goal_description: str) -> List[Dict]:
    """
    Analyzes a user's goal and returns a structured list of suggested habits.
    """
    prompt = f"""
    Analyze the following goal and break it down into a series of smaller, actionable habits.
    For each habit, provide a description and a suggested frequency ('daily' or 'weekly').
    Return the habits as a JSON array of objects, where each object has a 'description' and 'frequency' key.

    Goal: "{goal_description}"

    JSON output:
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that helps users break down their goals into actionable habits."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        habits = response.choices.message.content.strip()
        import json
        return json.loads(habits)
    except Exception as e:
        print(f"An error occurred: {e}")
        return []