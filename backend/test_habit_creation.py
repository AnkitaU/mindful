import httpx
import random
import string

BASE_URL = "http://localhost:8000"

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_create_habit():
    # 1. Register a new user
    email = f"testuser_{random_string()}@example.com"
    password = "testpassword"
    
    with httpx.Client() as client:
        # Register
        try:
            response = client.post(f"{BASE_URL}/api/v1/auth/register", json={"email": email, "password": password})
            response.raise_for_status()
            print("User registered successfully.")
        except httpx.HTTPStatusError as e:
            print(f"Error registering user: {e.response.text}")
            return
        except httpx.RequestError as e:
            print(f"An error occurred during registration: {e}")
            return

        # Login
        try:
            response = client.post(f"{BASE_URL}/api/v1/auth/login", data={"username": email, "password": password})
            response.raise_for_status()
            token = response.json()["access_token"]
            print("User logged in successfully.")
        except httpx.HTTPStatusError as e:
            print(f"Error logging in: {e.response.text}")
            return
        except httpx.RequestError as e:
            print(f"An error occurred during login: {e}")
            return

        # Create Goal
        headers = {"Authorization": f"Bearer {token}"}
        goal_description = "Read a book for 15 minutes every day"
        
        try:
            response = client.post(f"{BASE_URL}/api/v1/goals", headers=headers, json={"description": goal_description})
            response.raise_for_status()
            print("Goal created successfully:")
            print(response.json())
        except httpx.HTTPStatusError as e:
            print(f"Error creating goal: {e.response.text}")
        except httpx.RequestError as e:
            print(f"An error occurred during goal creation: {e}")

if __name__ == "__main__":
    test_create_habit()