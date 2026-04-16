# SynStrom Backend Technical Report

This document provide a comprehensive overview of the SynStrom backend architecture, logic, and API routes.

## 🚀 Overview
The SynStrom backend is a high-performance API built with **FastAPI** and **MongoDB** (using the asynchronous **Motor** driver). It follows a modular architecture designed for scalability, security, and ease of integration with the Next.js frontend.

---

## 🏛️ Architecture & Structure
The project is organized into clear functional layers:

- **`app/main.py`**: The entry point. Initializes FastAPI, configures CORS, and includes routers.
- **`app/controllers/`**: API Route handlers. Manage HTTP requests, parameter validation, and response formatting.
- **`app/services/`**: Core Business Logic. Handles database interactions and complex data processing.
- **`app/schemas/`**: Pydantic models for Data Validation and Serialization (request/response bodies).
- **`app/database/`**: MongoDB connection management and utilities.
- **`app/utils/`**: Shared utilities for security (JWT), logging, and formatting.

---

## 🔐 Authentication & Security

### JWT Strategy
- Uses **OAuth2 with Password Bearer**.
- Access tokens contain `email` and `role` claims.
- Signed with a `SECRET_KEY` using the `HS256` algorithm.

### 🛠️ Development Mode Bypass (Surgical Bypass)
For rapid testing and frontend development, a **Bypass Mode** is implemented in `app/services/auth.py`:
- If `ENVIRONMENT != "production"`, the system automatically returns a **Mock Admin User** for any protected request.
- Permits full access to Swagger UI and frontend testing without requiring a valid Bearer token.
- **Mock User ID**: `60d5ecb8b392d70015352516` (Valid ObjectId).

---

## 📍 API Endpoints Reference

### 1. Authentication (`/auth`)
| Method | Endpoint | Description |
|:---:|:--- |:--- |
| `POST` | `/auth/register` | Create a new user account. |
| `POST` | `/auth/login` | Authenticate and retrieve a JWT access token. |

### 2. Users (`/users`)
| Method | Endpoint | Description |
|:---:|:--- |:--- |
| `GET` | `/users` | List all users (Paginated). |
| `GET` | `/users/{id}` | Get specific user by ID. |
| `POST` | `/users` | Manual user creation (Admin). |
| `PUT` | `/users/{id}` | Update user details. |
| `DELETE` | `/users/{id}` | Remove a user. |

### 3. Teachers (`/teachers`)
| Method | Endpoint | Description |
|:---:|:--- |:--- |
| `GET` | `/teachers` | List all teacher profiles. |
| `POST` | `/teachers` | Create a teacher profile linked to a User ID. |
| `GET` | `/teachers/{id}` | Get teacher profile details. |
| `PUT` | `/teachers/{id}` | Update teacher profile. |
| `DELETE` | `/teachers/{id}` | Remove teacher profile. |

### 4. Parents (`/parents`)
| Method | Endpoint | Description |
|:---:|:--- |:--- |
| `GET` | `/parents` | List all parent profiles. |
| `POST` | `/parents` | Create parent profile linked to User ID and Child User ID. |
| `GET` | `/parents/{id}` | Get parent profile details. |
| `PUT` | `/parents/{id}` | Update parent profile. |
| `DELETE` | `/parents/{id}` | Remove parent profile. |

### 5. Children (`/children`)
| Method | Endpoint | Description |
|:---:|:--- |:--- |
| `GET` | `/children` | List all children profiles. |
| `POST` | `/children` | Create child profile linked to User ID and Parent User ID. |
| `GET` | `/children/{id}` | Get child profile details. |
| `PUT` | `/children/{id}` | Update child profile. |
| `DELETE` | `/children/{id}` | Remove child profile. |

---

## 🧪 Database & Models
- **Database**: MongoDB (v4.0+ recommended).
- **Driver**: Motor (Asynchronous).
- **Core Models**:
  - `User`: Base identity with Password (hashed) and Role (admin, teacher, parent, child).
  - `Teacher`: Linked profile with professional details.
  - `Parent`: Linked profile with connection to a `child_id`.
  - `Child`: Linked profile with connection to a `parent_id`.

## ⚙️ Environment Configuration
Configured via `.env` file:
- `MONGO_URI`: Connection string.
- `MONGO_DB_NAME`: Target database name.
- `JWT_SECRET`: signing key.
- `ENVIRONMENT`: Set to `development` for auth bypass.

---

> [!NOTE]
> This backend is designed to be fully compatible with the SynStrom "Digital Sanctuary" frontend components.
