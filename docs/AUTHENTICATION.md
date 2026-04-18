# Recruiter Authentication Integration

Details on the authentication system implemented for recruiters.

## 🔐 Credentials
The following recruiter account has been seeded into the database for demonstration and testing:

- **Email**: `aline.uwimana@umurava.africa`
- **Password**: `Recruiter2026!`

## ⚙️ Integration Details

### 1. Backend API
- **Login**: `POST /api/auth/login` - Authenticates users and returns a JWT token.
- **Register**: `POST /api/auth/register` - Creates new recruiter accounts.
- **Controller**: Logic is handled in `backend/src/controllers/auth.controller.ts`.

### 2. Frontend Connection
- **API Client**: A centralized API utility is located at `src/lib/api.ts`.
- **Token Management**: JWT tokens are stored in `localStorage` (`umurava_token`).
- **Auth Flow**: The `AuthClient.tsx` component handles the forms and redirects users to either `/recruiter-dashboard` or `/applicant-portal` depending on their role.

## 🛠️ Seeding
To ensure the demo recruiter is available:
```bash
cd backend
npm run seed
```
