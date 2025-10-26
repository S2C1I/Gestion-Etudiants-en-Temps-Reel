# Front Express - Deployment Guide

Angular frontend for the Express Etudiants API, deployed to GitHub Pages.

## 🚀 Quick Deploy

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build for production:**

   ```bash
   npm run build:prod
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

## 🔧 Configuration

### Environment Files

**Development** (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  socketUrl: "http://localhost:3000",
};
```

**Production** (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: "https://express-etudiants-api.onrender.com",
  socketUrl: "https://express-etudiants-api.onrender.com",
};
```

### Backend CORS Configuration

The backend needs to whitelist the frontend origin:

```bash
# Add to backend .env file:
FRONTEND_ORIGIN=https://s2c1i.github.io
```

## 📡 API Endpoints

All endpoints require `Authorization: Bearer <TOKEN>` header (except /health and auth routes).

### Authentication

- `POST /users/register` - Register new user
- `POST /users/login` - Login (returns token)

### Students (Etudiants)

- `GET /etudiants?search=&page=&limit=` - Get paginated students
- `GET /etudiants/total` - Get total count
- `GET /etudiants/:id` - Get student by ID
- `POST /etudiants` - Create student
- `PUT /etudiants/:id` - Update student
- `DELETE /etudiants/:id` - Delete student

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Messages (Chat)

- `GET /messages/conversations` - Get all conversations
- `GET /messages/:userId` - Get messages with specific user
- `POST /messages` - Send message `{ recipientId, content }`
- `PATCH /messages/:messageId/read` - Mark message as read

### Health Check

- `GET /health` - Check API status (no auth required)

## 🔌 Socket.IO Events

### Listen for:

- `notification` - Student add/update/delete notifications
- `newMessage` - New chat message received
- `userOnline` - User came online
- `userOffline` - User went offline
- `onlineUsers` - Array of currently online user IDs

### Emit:

- `userOnline` - Emit after login with user's `_id`
- `getOnlineUsers` - Request current online users list

## 📦 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── auth.interceptor.ts      # JWT token interceptor
│   ├── components/
│   │   ├── chat/                    # Chat container
│   │   ├── chat-list/               # Online users list
│   │   ├── chat-window/             # Message window
│   │   ├── dashboard/               # Dashboard
│   │   ├── details-etudiant/        # Student details
│   │   ├── etudiant-form/           # Student form
│   │   ├── liste-etudiants/         # Students list
│   │   ├── login/                   # Login page
│   │   ├── navbar/                  # Navigation
│   │   └── users/                   # Users management
│   └── services/
│       ├── authentification.service.ts
│       ├── chat.service.ts          # Chat API calls
│       ├── etudiants.service.ts     # Students API calls
│       ├── notification.service.ts  # Notification management
│       ├── socket.service.ts        # Socket.IO connection
│       ├── unread-messages.service.ts
│       └── user.service.ts          # User API calls
├── environments/
│   ├── environment.ts               # Dev config
│   └── environment.prod.ts          # Prod config
├── 404.html                         # SPA 404 redirect
└── index.html                       # Main HTML with redirect script
```

## 🛠️ Development

```bash
# Start dev server
npm start

# Start dev server on LAN
npm run start:lan

# Build for production
npm run build:prod

# Run tests
npm test
```

## 🌐 Deployment URLs

- **Frontend**: https://s2c1i.github.io/express-front/
- **Backend API**: https://express-etudiants-api.onrender.com
- **Backend Health**: https://express-etudiants-api.onrender.com/health

## ✅ Testing After Deployment

1. **Test health endpoint:**

   ```bash
   curl https://express-etudiants-api.onrender.com/health
   # Should return: {"status":"ok"}
   ```

2. **Test login and get token:**

   ```bash
   curl -X POST https://express-etudiants-api.onrender.com/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password"}'
   ```

3. **Test protected endpoint:**

   ```bash
   curl https://express-etudiants-api.onrender.com/etudiants \
     -H "Authorization: Bearer <YOUR_TOKEN>"
   ```

4. **Test real-time features:**
   - Open app in two browser tabs
   - Login with different users
   - Check online status indicator
   - Send chat messages
   - Verify notifications appear

## 📝 Notes

### SPA 404 Handling

- Custom `404.html` redirects to index with path preserved
- `index.html` has script to restore the original path
- Works with Angular routing and GitHub Pages

### Base Href

- Production base href: `/express-front/`
- Configured in `angular.json` production configuration
- Matches GitHub Pages repository name

### Socket.IO

- Automatically connects on app initialization
- Emits `userOnline` after successful login
- Persistent listeners in SocketService using BehaviorSubjects
- Survives component navigation/destruction

### Authentication

- JWT token stored in `localStorage` as `token`
- Auth interceptor adds `Authorization` header automatically
- Token validated on app initialization
- Expired tokens cleared automatically

## 🐛 Troubleshooting

### CORS Errors

- Verify backend `FRONTEND_ORIGIN` env variable is set correctly
- Should be: `https://s2c1i.github.io` (no trailing slash)

### 404 on Refresh

- Verify `404.html` is copied to dist folder
- Check `angular.json` assets configuration
- Ensure redirect script is in `index.html`

### Socket Not Connecting

- Check browser console for connection errors
- Verify `socketUrl` in environment files
- Ensure backend Socket.IO is running

### API Calls Failing

- Check `apiUrl` in environment files
- Verify token is present in localStorage
- Check Network tab for actual request URLs

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [GitHub Pages](https://pages.github.com/)
