# Volunteer Opportunities Hub - API Reference

A detailed guide to the RESTful API endpoints for the Volunteer Opportunities Hub.

---

## 🔑 Authentication
All protected endpoints require a **JSON Web Token (JWT)**. 
- **Header**: `Authorization: Bearer <your_token>`
- **Login**: Use `/api/auth/login` to obtain your token.

---

## 📁 Endpoints Summary

### 1. 🔐 Authentication & Identity (Public)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account. |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT. |

### 2. 👤 User Profiles (Authenticated)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Retrieve the current user's profile data. |
| `PUT` | `/api/users/profile` | Update bio, location, skills, and interests. |

### 3. 🌍 Opportunities (Public Read)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/opportunities` | Search opportunities with pagination and filters. |
| `GET` | `/api/opportunities/:id` | Get full details for a single opportunity. |
| `POST` | `/api/opportunities` | **[Org/Admin]** Post a new volunteer event. |

### 4. 🤝 Volunteer Activity (Authenticated)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/volunteer/join` | Sign up for an event (handles waitlisting). |
| `GET` | `/api/volunteer/hours` | View serving history and total verified hours. |

### 5. 💬 Communication & Community (Authenticated)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/messages/send` | Send a private message to another user. |
| `GET` | `/api/messages/:id` | Retrieve conversation history with a user. |
| `POST` | `/api/groups` | Create a new volunteer coordination group. |
| `POST` | `/api/groups/join` | Join an existing group. |
| `GET` | `/api/groups/:id` | View specific group details and members. |

### 6. ⭐ Feedback & Reviews (Authenticated)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/reviews` | Submit a rating and comment for a completed event. |
| `GET` | `/api/reviews/:oppId` | View all reviews and average rating for an event. |

### 7. 🛡️ Administrative Tools (Admin Only)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | View all registered profiles. |
| `PUT` | `/api/admin/users/role` | Promote users to Admin or Organization roles. |
| `PUT` | `/api/admin/verify-hours` | Approve hours and mark events as 'completed'. |
| `DELETE`| `/api/admin/reviews/:id` | Remove inappropriate reviews. |
| `GET` | `/api/admin/stats` | System-wide analytics (Total users, hours, etc.). |
| `GET` | `/api/admin/export/csv` | Download system data as a CSV file. |

### 8. 📢 Notifications & Resources
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications` | Personalized alerts based on user interests. |
| `GET` | `/api/resources` | Access educational articles and guides. |
| `GET` | `/api/resources/:id` | View full content of a specific resource. |
| `POST` | `/api/resources` | **[Admin]** Create a new educational guide. |
| `GET` | `/api/events/calendar` | Fetch upcoming events in a calendar-friendly format. |
| `GET` | `/api/share/:id` | Generate social media share metadata. |

---

## ⚠️ Error Responses

Our API uses standard HTTP response codes:

*   **`200 OK`**: Success.
*   **`201 Created`**: Resource created successfully (e.g., Register, New Event).
*   **`400 Bad Request`**: Invalid input data or business logic error.
*   **`401 Unauthorized`**: Missing or invalid Bearer Token.
*   **`403 Forbidden`**: User does not have the required role (e.g., needs Admin).
*   **`404 Not Found`**: Resource does not exist.

---

## 📦 Request Examples

### Update Profile (PUT)
```json
{
  "bio": "Passionate about youth education.",
  "skills": ["Teaching", "Public Speaking"],
  "location": "New York"
}
```

### Join Opportunity (POST)
```json
{
  "opportunityId": "ea7b... (UUID)"
}
```

### Verify Hours (Admin PUT)
```json
{
  "logId": "log-uuid",
  "status": "completed",
  "hoursLogged": 4.5
}
```