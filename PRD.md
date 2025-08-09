### Project Blueprint: AI Habit Builder

This document provides a comprehensive, actionable guide for developing the "AI Habit Builder" web application. It is designed for a solo developer or an AI coding agent to build the application from the ground up, following an agile, sprint-based methodology.

# 1. High-Level Architectural Decisions

1.1. Architecture Pattern Selection

Decision: Modular Monolith
Rationale: The Product Requirements Document (PRD) classifies the project's complexity as "Simple". A monolithic architecture is the most efficient choice for a solo developer, as it minimizes operational overhead and simplifies the development and deployment process. By structuring the monolith into domain-driven modules, we maintain a clean and scalable codebase, making it easy to manage and extend in the future. This approach avoids the premature complexity of a microservices architecture, which is not warranted by the current requirements.

1.2. Technology Stack Selection

The technology stack is chosen based on modern best practices, developer productivity, and performance. All versions are the latest stable releases as of August 2025.
Frontend Framework & UI:
Framework: Next.js
Version: ~15.4.6
Rationale: Next.js provides a powerful and flexible framework for building modern React applications. Its features like the App Router, server-side rendering, and a rich ecosystem make it an excellent choice for this project. The App Router will be used for its improved data fetching and layout capabilities.
UI Components: shadcn/ui
Version: ~2.10.0 (via npx shadcn@latest)
Rationale: shadcn/ui offers a set of accessible and unstyled components that can be easily customized. This approach avoids being locked into a specific design system and allows for rapid UI development that aligns perfectly with the project's visual identity.
Backend Runtime & Framework:
Runtime: Python
Version: ~3.12
Rationale: Python's readability, extensive libraries, and strong community support make it a solid foundation for the backend. Version 3.12 provides modern features while ensuring broad library compatibility.
Framework: FastAPI
Version: ~0.116.1
Rationale: FastAPI is a high-performance web framework for Python that is easy to learn and use. Its automatic interactive documentation (Swagger UI) and Pydantic-based data validation will significantly speed up API development and testing.
Primary Database:
Database: MongoDB Atlas (Free Tier)
Rationale: A NoSQL document database like MongoDB provides the flexibility needed for an agile project where data models can evolve. It maps naturally to Python and JavaScript objects, simplifying data access. The free tier of MongoDB Atlas is sufficient for development and early-stage production.

1.3. Core Infrastructure & Services (Local Development Focus)

Local Development: The project will be run using simple command-line instructions (npm run dev for frontend, uvicorn main:app --reload for backend). No containerization (e.g., Docker) is needed for the MVP to ensure a fast and simple setup.
File Storage: The current PRD does not require file uploads. If this changes, a git-ignored ./uploads directory in the backend will be used for local storage.
Job Queues: The PRD defers features requiring background jobs (like smart reminders). Therefore, no job queue system (like Celery) is required for the MVP.
Authentication: A library-based approach with JWTs (JSON Web Tokens) will be used. This is a lightweight and standard method for securing APIs within a monolithic application. The passlib library will be used for password hashing and python-jose for JWT creation and validation.
External Services:
OpenAI API: Required for the conversational goal breakdown feature (FR-001). The developer will need to provide an API key.

1.4. Integration and API Strategy

API Style: A versioned REST API will be implemented (e.g., /api/v1/...).
Standard Formats: All API responses will use a standard JSON structure.
Success: { "status": "success", "data": { ... } }
Error: { "status": "error", "message": "Error description" }

# 2. Detailed Module Architecture
The application will be organized into the following modules within the monolith.

2.1. Module Identification

Backend Modules (backend/app/):
auth: Handles user registration and login.
users: Manages user profiles and data.
goals: Manages goal creation and deletion.
habits: Manages habit creation, tracking (logs), and streak calculation.
ai: A dedicated module to interact with the external OpenAI API.
core: Contains shared configuration, database connection, and core settings.
Frontend Modules (frontend/src/):
app/(auth): Contains pages for login and registration.
app/(main): Contains the main application views (Dashboard, Tracker).
components/modules: Contains components specific to a feature (e.g., GoalCreationChat, HabitTrackerList).
components/shared: Contains reusable UI components (e.g., Button, Card).
lib: For utility functions, API client, and type definitions.
context: For React context providers (e.g., AuthContext).

2.2. Module Responsibilities and Contracts

Module
Responsibilities
Key Endpoints / Components
Auth (BE)
User registration, login, JWT generation.
POST /api/v1/auth/register, POST /api/v1/auth/login
Users (BE)
Fetching authenticated user data.
GET /api/v1/users/me
Goals (BE)
Creating and deleting goals.
POST /api/v1/goals, DELETE /api/v1/goals/{goal_id}
Habits (BE)
Listing habits, logging completions.
GET /api/v1/habits, POST /api/v1/habits/{habit_id}/log
AI (BE)
Communicating with OpenAI to get habit plans.
Internal service called by GoalModule.
Dashboard (BE)
Aggregating user progress data.
GET /api/v1/dashboard/summary
Auth (FE)
Login/Register pages and forms.
/login, /register
Main (FE)
Dashboard, Habit Tracker, Goal Creation pages.
/, /tracker, /new-goal

2.3. Key Module Design

Folder Structure (Backend - backend/):
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app instantiation and root routers
│   ├── core/               # Config, DB connection
│   ├── models/             # Pydantic models for requests/responses
│   ├── schemas/            # Database schemas (e.g., for MongoDB)
│   ├── services/           # Business logic (e.g., ai_service.py)
│   └── api/
│       └── v1/
│           ├── endpoints/  # Route handlers (auth.py, goals.py, etc.)
│           └── deps.py     # FastAPI dependencies (e.g., get_current_user)
├── .env
├── .env.example
└── requirements.txt


Folder Structure (Frontend - frontend/):
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Route group for auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/         # Route group for main app
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx    # Dashboard
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   └── modules/        # Feature-specific components
│   ├── lib/                # Utilities, api client
│   └── context/            # React context
├── .env.local
├── .env.local.example
├── tailwind.config.ts
└── next.config.mjs

Key Patterns:
Repository Pattern: While not strictly necessary for the MVP with a simple data model, abstracting database calls into a services layer will keep the API endpoints clean and focused on handling HTTP requests and responses.
Dependency Injection: FastAPI's built-in dependency injection will be used heavily, especially for handling authentication (get_current_user).

# 3. Tactical Sprint-by-Sprint Plan
The project is broken down into tactical sprints. Each sprint delivers a complete, end-to-end, testable feature.

Sprint S0: Project Foundation & Setup
Project Context: This project is to build a web application called 'AI Habit Builder', a platform where users can define goals, have them broken down into habits by AI, and track their progress.
Goal: To establish a fully configured, runnable project skeleton on the local machine, with all necessary credentials and basic styling configured, enabling rapid feature development in subsequent sprints.
Tasks:
Developer Onboarding & Repository Setup:
Ask the developer for the URL of their new, empty GitHub repository for this project.
Collect Secrets & Configuration:
Ask the user to provide the connection string for their MongoDB Atlas free-tier cluster.
Ask the user for their OpenAI API key.
Ask the user for the primary and secondary color hex codes for the UI theme.
Project Scaffolding:
Create a root directory with frontend and backend subdirectories.
Initialize a Git repository and create a comprehensive .gitignore file at the root.
Backend Setup (Python/FastAPI):
Set up a Python ~3.12 virtual environment inside the backend directory.
Create a requirements.txt file with fastapi~=0.116.1, uvicorn[standard], pydantic, python-dotenv, pymongo~=4.14.0, passlib[bcrypt]~=1.7.4, python-jose~=3.5.0, and openai~=1.99.2.
Create the basic file structure outlined in the architecture section.
Create backend/.env.example and backend/.env. Populate .env with the DATABASE_URL and OPENAI_API_KEY.
Frontend Setup (Next.js & shadcn/ui):
Scaffold the frontend application using npx create-next-app@latest in the frontend directory.
Use the npx shadcn@latest init command to initialize shadcn/ui.
Configure the tailwind.config.ts file with the primary and secondary colors provided by the user.
Create frontend/.env.local for NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000.
Documentation:
Create a README.md file at the project root. Populate it with the project context, technology stack, and setup instructions.
"Hello World" Verification:
Backend: Create a /api/v1/health endpoint that returns {"status": "ok"}. Implement the initial database connection logic to MongoDB Atlas, ensuring it connects on startup.
Frontend: Create a basic page that fetches data from the backend's /api/v1/health endpoint and displays the status.
User Test: Ask the user to run both frontend and backend and verify that the "Status: ok" message appears on the web page and the backend console shows a successful database connection.
Final Commit:
After user confirmation, stage all files, commit with "chore: initial project setup", and push to the main branch on GitHub.
Verification Criteria: The developer can clone the repository, run pip install -r requirements.txt and uvicorn app.main:app --reload in the backend, run npm install and npm run dev in the frontend, and see a "Status: ok" message on the browser. The backend connects to MongoDB on startup. All code is on the main branch of the provided GitHub repository.

Sprint S1: User Authentication & Profiles
Project Context: This project is to build the "AI Habit Builder" application.
Previous Sprint's Accomplishments: Sprint S0 established the local development environment. The Next.js frontend and FastAPI backend are running and can communicate. A connection to MongoDB Atlas is established. The codebase is on the main branch in a GitHub repository.
Goal: To implement a complete, secure user registration and login system using JWTs, fulfilling requirement FR-004.
Relevant Requirements: "As a new user, I want to be able to sign up for an account using my email and a secure password." "As a returning user, I want to be able to log in with my credentials."
Tasks:
Database Model: Define a User schema in the backend with email, hashed_password, and createdAt.
Backend: Registration Logic: Implement the POST /api/v1/auth/register endpoint. It should take an email and password, hash the password using passlib, and create a new user in the database.
Backend: Login Logic: Implement the POST /api/v1/auth/login endpoint. It should verify credentials and return a JWT access token created with python-jose.
Backend: Protected Route: Create a FastAPI dependency to validate JWTs. Create a protected endpoint GET /api/v1/users/me that requires a valid token and returns the current user's data.
Frontend: UI Pages: Using shadcn/ui components, build the UI for a /login page and a /register page. Build a placeholder / (dashboard) page that will be protected.
Frontend: State & API Integration:
Set up a React Context for authentication state.
Implement client-side forms for login and registration that call the backend endpoints.
Store the JWT in localStorage upon successful login and update the auth context.
Implement logic to protect the main app routes from unauthenticated access (redirect to /login).
The main dashboard page should fetch and display the user's email from the /api/v1/users/me endpoint.
User Test: Ask the user to perform a full end-to-end test: register, get redirected to login, log in, be taken to the protected dashboard page, see their email, and log out.
Final Commit: After user confirmation, commit all changes with "feat: implement user authentication and profiles" and push to GitHub.
Verification Criteria: A user can register, log in, view a protected dashboard page, and log out. Unauthenticated users are redirected from protected pages. User data is correctly stored and secured in MongoDB. All code is on the main branch.

Sprint S2: Conversational Goal Creation & AI Breakdown
Project Context: This project is to build the "AI Habit Builder" application.
Previous Sprint's Accomplishments: Sprint S1 delivered a complete user authentication system. Users can register, log in, and access protected routes.
Goal: To implement the core value proposition: allowing a user to input a goal in natural language and have an AI break it down into actionable habits, fulfilling FR-001.
Relevant Requirements: "Users can describe a large, long-term goal in a natural language chat interface." "An AI assistant will... generate a suggested plan of smaller, actionable daily and weekly habits."
Tasks:
Database Models: Define Goal and Habit schemas in the backend. A Goal should have a description and a userId. A Habit should have a description, frequency, and link back to a goalId.
Backend: AI Service: Create a service in the ai module that takes a user's goal description, formats a prompt for the OpenAI API, calls the API, and parses the response into a structured list of habits.
Backend: Goal Creation Endpoint: Implement POST /api/v1/goals. This endpoint will take a goal description, call the AI service to get the habit plan, and then save the Goal and its associated Habits to the database for the authenticated user.
Frontend: Goal Creation UI: Create a new page at /new-goal. Build a simple chat-like interface using shadcn/ui components (Input, Button, Card).
Frontend: API Integration:
When the user submits their goal, call the POST /api/v1/goals endpoint.
On a successful response, display the AI-generated habit plan to the user for confirmation.
For the MVP, we will follow the PRD's flow where accepting the plan is part of the creation. After creation, redirect the user to the main dashboard.
User Test: Ask the user to go to the /new-goal page, enter a goal like "run a marathon in 6 months", and verify that the system creates the goal and associated habits in the database.
Final Commit: After user confirmation, commit all changes with "feat: implement AI-powered goal creation" and push to GitHub.
Verification Criteria: A logged-in user can describe a goal, and the system will use the OpenAI API to generate and save a set of corresponding habits in the database.

Sprint S3: Habit Tracker
Project Context: This project is to build the "AI Habit Builder" application.
Previous Sprint's Accomplishments: Sprint S2 delivered the AI goal creation feature. Goals and habits are now stored in the database.
Goal: To allow users to view their daily habits and mark them as complete, fulfilling FR-002.
Relevant Requirements: "A simple interface where users can see their habits for the day and week." "Users can mark habits as complete with a single click."
Tasks:
Database Model: Define a HabitLog schema in the backend to store a record of each completed habit, linking to the habitId and storing the completionDate.
Backend: List Habits Endpoint: Implement GET /api/v1/habits. This endpoint should return all active habits for the logged-in user.
Backend: Log Habit Endpoint: Implement POST /api/v1/habits/{habit_id}/log. This endpoint creates a HabitLog entry for the given habit for the current date. Implement logic to prevent duplicate logs for the same day. Add a corresponding DELETE endpoint to un-check a habit.
Frontend: Habit Tracker UI: On the main dashboard page (/), create a component that fetches data from /api/v1/habits. Display the habits in a list with checkboxes.
Frontend: API Integration:
When a user checks a box, call the POST /api/v1/habits/{habit_id}/log endpoint.
When a user un-checks a box, call the corresponding DELETE endpoint.
Update the UI optimistically for a smooth user experience.
User Test: Ask the user to view their created habits on the dashboard and check/un-check them. Verify that the corresponding HabitLog entries are created and deleted in the database.
Final Commit: After user confirmation, commit all changes with "feat: implement daily habit tracker" and push to GitHub.
Verification Criteria: A user can see their list of daily habits and mark them as complete. The completion status is persisted in the database.

Sprint S4: Progress Dashboard & Goal Deletion
Project Context: This project is to build the "AI Habit Builder" application.
Previous Sprint's Accomplishments: Sprint S3 delivered the habit tracking feature. Users can now log their daily habit completions.
Goal: To provide users with a motivating visual summary of their progress and allow them to manage their goals, fulfilling FR-003 and the delete operation from FR-001.
Relevant Requirements: "A single-view dashboard that provides a visual summary of the user's progress." "Users can delete an entire Goal."
Tasks:
Backend: Dashboard Endpoint: Implement GET /api/v1/dashboard/summary. This endpoint will calculate and return key metrics for the user: overall completion rate (last 30 days), longest streak, and current streak for each active habit.
Backend: Goal Deletion Endpoint: Implement DELETE /api/v1/goals/{goal_id}. This endpoint should delete the specified Goal and all of its associated Habits and HabitLogs.
Frontend: Dashboard UI: On the main dashboard page (/), create a new section to display the summary statistics fetched from the new dashboard endpoint. Use Card components from shadcn/ui to present the metrics clearly.
Frontend: Goal List & Deletion UI:
Create a component to list all of the user's active goals.
Add a delete button next to each goal.
On click, show a confirmation modal (AlertDialog from shadcn/ui).
On confirmation, call the DELETE /api/v1/goals/{goal_id} endpoint and update the UI.
User Test: Ask the user to view their dashboard and verify the progress metrics are displayed. Ask them to delete a goal and confirm it and its habits are removed from all views.
Final Commit: After user confirmation, commit all changes with "feat: implement progress dashboard and goal deletion" and push to GitHub.
Verification Criteria: The dashboard correctly displays user progress metrics. A user can successfully delete a goal, which removes all associated data. The application now fulfills all core MVP requirements.

