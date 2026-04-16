# SynStorm: Platform Context & Architecture

## 1. High-Level Concept
**SynStorm** is a comprehensive, real-time monitoring and educational platform designed to track the focus, progress, and behavioral health of students (specifically targeting neurofocus and potentially ADHD management). 

It creates a dedicated "Digital Sanctuary" triad connecting the **Student**, their **Parents**, and their **Teachers** into a singular ecosystem. By integrating IoT wearable data and daily classroom feedback, the platform strives to gamify and improve a child's educational experience while providing actionable clinical data to caregivers.

## 2. Core User Roles
The platform operates on a strict Role-Based Access Control (RBAC) architecture,  supporting 3 primary user personas:

- **Enfant (Student)**: The core focus of the system. Their dashboard provides gamified quests, focus progression, and a virtual pet/chatbot assistant designed to keep them engaged.
- **Parent**: Caregivers who receive actionable insights, clinical history, and direct updates on their child's focus score and behavioral trends.
- **Enseignant (Teacher)**: Educators who monitor the children inside their specific classroom, report clinical/behavioral updates, and adjust the educational approach based on backend data.

*(Note: The 'Psychiatre' role was recently formally deprecated from the system infrastructure).*

## 3. Key Technical Features
- **IoT Bracelet Integration**: The platform tracks a `bracelet_id` for students to pull real-time bio-feedback/focus metrics.
- **Just-In-Time (JIT) Provisioning**: When users are registered as simple accounts, the backend lazily instantiates highly structured clinical profiles in MongoDB the exact second they first log into their dedicated dashboard.
- **AI Chatbot Sessions**: Support for AI-assisted chat sessions tailored to children navigating focus or emotional challenges (`chatbot_session_id`).
- **Dynamic Role Synchronization**: The frontend React architecture silently intercepts JWT drift and auto-syncs with the database to prevent dashboard mapping errors if a role changes mid-session.

## 4. Tech Stack Breakdown
The project is split into a robust Full-Stack monolith:

### Backend:
- **Framework**: Python / FastAPI
- **Database**: MongoDB (accessed asynchronously using Motor)
- **Security**: JWT Bearer Tokens tightly coupled to FastAPI's Dependency Injection (`Depends(RoleChecker)`).
- **Validation**: Pydantic schemas validating distinct base models for Users, Children, Parents, and Teachers.

### Frontend:
- **Framework**: Next.js (App Router)
- **UI/UX System**: React, Tailwind CSS, Lucide Icons (Stylized as a "Digital Sanctuary" UI).
- **State Management**: React Context (`AuthContext`) and React Query (`useDashboardData`) for sophisticated caching and auto-revalidation.
- **API Client**: Axios (with custom interceptors capturing 401s to redirect cleanly).
