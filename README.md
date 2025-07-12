# Skill Swap Platform

## Problem Statement
The Skill Swap Platform is designed to facilitate the exchange of skills among users. It allows individuals to register, log in, offer or seek skills, create swap requests, provide feedback, and manage their profiles. The platform aims to connect people for skill-sharing in a secure and user-friendly manner.

## Team Members
- Kudupudi Sriharshini
- Akshaya Putti
- Barenkala Yojitha

- 🚀 How to Run the Project
To explore the Skill Swap Platform frontend:

Clone or download this repository.

Open the file named index.html in your browser.
## ✨ Features

- 🔐 JWT-based User Authentication (Login/Signup)
- 🧑‍💼 User Profile Management
- 🧠 Skill Offering and Learning Preferences
- 📬 Skill Exchange Requests
- 💬 Chat with Matched Users
- ⭐ Rate After Successful Exchanges
- 📄 Paginated Skill Profiles
- 🎨 Responsive Frontend (HTML, CSS, JS)
- ⚙️ REST API Backend (Flask)

---

## 🧱 Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS + LocalStorage for fallback)
- **Backend**: Python (Flask), SQLAlchemy, JWT, CORS
- **Database**: SQLite

---

## 🔗 Key Routes (Backend)

| Endpoint         | Method | Description                          |
|------------------|--------|--------------------------------------|
| `/signup`        | POST   | Create new user                      |
| `/login`         | POST   | Authenticate user and issue token   |
| `/profile`       | GET    | Fetch current user profile          |
| `/skills`        | POST   | Add skill (offered/wanted)          |
| `/requests`      | GET/POST| View or send skill swap requests    |

---

## 📦 Frontend Flow

- On page load: frontend checks for JWT token in `localStorage`
- On login: sends credentials to backend and stores token
- After login: loads user profile and shows user dashboard
- All skill actions are secured via token (Authorization header)
- UI is dynamic and responds to login/logout/auth state

---

## 📝 Notes

- JWT tokens expire after 1 hour (set in backend)
- All profile and request data is updated in real-time
- Basic error messages and feedback are displayed in the UI
- Login form is linked to backend API (`/login`)

- 

---
