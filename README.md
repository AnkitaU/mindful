# AI Habit Builder

This is a web application for goal setting and habit tracking.

## Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
*   **Backend:** FastAPI, Python, MongoDB

## Setup

### Backend

1.  Navigate to the `backend` directory.
2.  Create a Python virtual environment: `python3 -m venv venv`
3.  Activate the virtual environment: `source venv/bin/activate`
4.  Install the dependencies: `pip install -r requirements.txt`
5.  Create a `.env` file and populate it with the required environment variables (see `.env.example`).
6.  Run the development server: `uvicorn app.main:app --reload`

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install the dependencies: `npm install`
3.  Run the development server: `npm run dev`