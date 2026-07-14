# Visitor Management System

A full-stack Visitor Management System built with **React**, **React Native**, **Node.js/Express**, and **PostgreSQL** to streamline visitor registration, host approvals, and secure check-in/check-out workflows.

The platform consists of:

- 🌐 React Web Dashboard (Admin & Host Portal)
- 📱 React Native Mobile Application
- ⚙️ Express.js REST API
- 🗄 PostgreSQL Database

---

## ✨ Features

### Authentication

- JWT Authentication
- Role-Based Access Control (Owner / Host)
- Email OTP Verification
- Secure session persistence using Expo SecureStore

### Visitor Management

- Register Visitors
- Capture Visitor Photograph
- Host Approval Workflow
- Visitor History
- QR Pass Generation
- QR Check-In
- QR Check-Out

### Admin Dashboard

- Create / Manage Hosts
- Reset Passwords
- Activate / Deactivate Hosts
- Dashboard Analytics
- Search & Filter Visitors

### Mobile Application

- Login
- Digital Visitor Pass
- Secure Authentication
- Persistent Login
- Camera Integration

---

# 🏗 Architecture

```
                React Web Dashboard
                       │
                       │ REST API
                       ▼
              Express.js Backend
                       │
      ┌────────────────┴──────────────┐
      │                               │
 PostgreSQL                     Resend Email
      │                           OTP Service
      │
      ▼
React Native Mobile App
```

---

# 🛠 Tech Stack

## Frontend

- React
- React Router
- Tailwind CSS

## Mobile

- React Native
- Expo
- Expo SecureStore
- Expo Camera

## Backend

- Node.js
- Express.js
- JWT Authentication
- Resend Email API
- QRCode

## Database

- PostgreSQL


# 🔄 Workflow

1. Visitor registers through the web portal.
2. Host receives the visitor request.
3. Host approves or rejects the request.
4. Visitor receives an OTP verification email.
5. QR Pass is generated.
6. Security scans the QR code.
7. Check-In is recorded.
8. Visitor checks out using the same QR pass.


# 💡 Future Improvements

- Push Notifications
- Visitor Pre-Registration
- Face Recognition
- Multi-Company Support
- Visitor Analytics Dashboard
- Offline QR Validation
- Docker Deployment
- CI/CD Pipeline

---

# 👨‍💻 About the Project

This project was developed as a freelance solution to digitize visitor management workflows. The goal was to replace manual entry systems with a secure, role-based platform supporting visitor registration, host approvals, QR-based verification, and cross-platform mobile access.

---

# 📄 License

This project is shared for portfolio purposes. Feel free to explore the codebase and provide feedback.
