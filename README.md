# DevelopersHub Corporation - Agency Platform

Full-stack agency CMS platform with dynamic content management, service handling, and client interaction features. Built for internship submission.

## 🚀 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** express-session + bcrypt (session-based per guidelines)
- **Security:** helmet, express-rate-limit, express-mongo-sanitize, express-validator
- **Templating:** EJS
- **Deployment:** Render.com

## ✅ Current Status: Core Engine Complete
- [x] Express server + MongoDB Atlas connection
- [x] Session-based authentication with password hashing
- [x] Secure CRUD foundation with input validation
- [x] Security middleware: helmet, rate-limit, mongo-sanitize
- [x] Responsive CSS + custom error pages
- [x] Protected routes + ownership checks

## 🔧 In Development: Agency Modules
- [ ] Public Pages: Home, About, Services, Portfolio, Contact, Blog
- [ ] Admin CMS: Manage Services, Projects, Blog posts
- [ ] Client Inquiry System - store leads in database
- [ ] Meeting Scheduler with backend logic
- [ ] RESTful API endpoints for all resources

## 📁 Project Structure
developershub-agency-platform/
├── models/ # User, Service, Project, Blog, Inquiry, Meeting
├── views/ # EJS templates
│ ├── public/ # Public site pages
│ └── admin/ # Admin panel
├── public/ # CSS, images
├── server.js # Express app
└──.env.example # Environment variables template

## ⚙️ Setup Instructions
1. Clone repo: `git clone <your-repo-url>`
2. Install: `npm install`
3. Create `.env` file using `.env.example`
4. Run: `npm start`
5. Visit: `http://localhost:3000`

## 🔐 Environment Variables
See `.env.example` for required variables:
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_random_secret_key
PORT=3000

**Submission Deadline:** April 28, 2026
**Note:** Architecture supports JWT migration if required. Session-based auth chosen for CMS panel state management.