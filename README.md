# 🍽️ MEAL-MATE

<div align="center">

![MEAL-MATE Logo](https://img.shields.io/badge/MEAL--MATE-🍽️-orange?style=for-the-badge&logoColor=white)

**A Modern Full-Stack Food Delivery Platform**

*Connecting hungry customers with delicious restaurants through seamless technology*

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-success?style=for-the-badge)](https://your-live-demo-url.com)
[![GitHub Stars](https://img.shields.io/github/stars/DarshanKumarGP/MEAL-MATE?style=for-the-badge&logo=github)](https://github.com/DarshanKumarGP/MEAL-MATE)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

</div>

---

## 🌟 Project Overview

MEAL-MATE is a production-ready, full-stack food delivery platform that revolutionizes the way people discover, order, and enjoy food. Built with modern technologies and industry best practices, it provides a seamless experience for customers, restaurant owners, and administrators.

### 🎯 Key Highlights
- 🔐 **Secure Authentication** - JWT-based multi-role authentication system
- 💳 **Payment Integration** - Razorpay payment gateway with webhook support
- 📱 **Responsive Design** - Mobile-first approach with beautiful UI/UX
- ⚡ **Real-time Updates** - Live order tracking and status updates
- 📊 **Analytics Dashboard** - Comprehensive business intelligence for restaurants
- 🏪 **Multi-tenant Architecture** - Support for multiple restaurants and users

---

## 🛠️ Tech Stack

<div align="center">

**Frontend**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

**Backend**

![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&color=ff1709&labelColor=gray)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

**Database**

![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

**Payment & Tools**

![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

</div>

---

## ✨ Features

### 👥 For Customers
- 🔍 **Smart Restaurant Discovery** – Location-based search/filter
- 📋 **Menu Browsing** – Rich display, images, categories
- 🛒 **Cart Management** – Add, modify, checkout
- 💳 **Secure Payment** – Razorpay integration
- 📱 **Order Tracking** – Real-time updates
- ⭐ **Review & Rating** – Leave feedback, view others'
- 📜 **Order History** – Access/reorder previous orders

### 🏪 For Restaurant Owners
- 📊 **Dashboard** – Real-time analytics & metrics
- 🍽️ **Menu Management** – CRUD with images, categories, status
- 📋 **Order Processing** – Accept, update, view live
- 💰 **Revenue Analytics** – Track performance
- 🔔 **Notifications** – Get instant order alerts

### 👨‍💼 For Admins
- 🎛️ **User/Restaurant Management**
- 📊 **Platform Analytics**
- 🏪 **Restaurant Approval**
- 🛡️ **Security Controls**

---

## 🏗️ Project Structure

MEAL-MATE/
├── backend/ # Django REST API
│ ├── apps/
│ │ ├── authentication/
│ │ ├── core/
│ │ ├── restaurants/
│ │ ├── orders/
│ │ ├── payments/
│ │ └── notifications/
│ ├── config/ # Django settings
│ ├── media/ # User-uploaded files
│ └── requirements.txt
├── frontend/ # React TypeScript
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── services/
│ │ ├── styles/
│ │ └── utils/
│ └── package.json
├── README.md
└── LICENSE


---

## 🚀 Quick Start

**Requirements:**  
- Python 3.8+  
- Node.js 16+  
- Git

**Clone & Run:**

git clone https://github.com/DarshanKumarGP/MEAL-MATE.git
cd MEAL-MATE
**Backend:**
cd backend
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser # Optional
python manage.py runserver


**Frontend:**
cd ../frontend
npm install
npm start


**Environment Variables**
- Backend: `.env` file for secrets, DB, Razorpay keys
- Frontend: `.env` for API URL & payment key


## 🎯 Key Features in Detail

### 🔐 Auth System
- Multi-role with JWT
- Role-based authorization

### 💳 Payment
- Razorpay integration
- Webhook handling

### 📊 Analytics
- Real-time dashboard
- Order/revenue trends

### 🏗️ Architecture
- RESTful API, modular frontend/backend
- Type-safe codebase

---

## 🤝 Contributing

Fork the repo and clone

Create feature branch: git checkout -b feature/YourFeature

Commit your changes: git commit -m "Add awesome feature"

Push: git push origin feature/YourFeature

Open Pull Request


_See `CONTRIBUTING.md` for style and test guidelines!_

---

## 📜 API Endpoints

**Auth**
- `POST /api/auth/register/`  
- `POST /api/auth/login/`

**Restaurants**
- `GET /api/restaurants/`
- `GET /api/restaurants/{id}/menu-items/`

**Orders**
- `POST /api/orders/`
- `GET /api/orders/`

**Cart**
- `GET /api/cart-items/`
- `POST /api/cart-items/`
---

## 🚀 Deployment

- **Backend:** Cloud (AWS, DigitalOcean), set up `.env`, database, HTTPS  
- **Frontend:** Build (`npm run build`), deploy to Vercel/Netlify  
- **Docker:** Use `docker-compose up --build` for local full-stack

---

## 🧪 Testing

- **Backend:** `python manage.py test`
- **Frontend:** `npm test`

---

## 🛡️ Security

- HTTPS, CSRF, secure headers
- JWT authorization everywhere
- Parameterized queries and sanitization

---

## 📈 Future Enhancements

- 🤖 AI-powered recommendations
- 📱 Mobile (React Native/PWA)
- 🌐 Multi-language
- 🔔 Push notifications
- 📍 Geo-tracking/delivery tracking
- 💬 In-app chat/support

---

## 🙏 Acknowledgments

- Django/React communities, OSS contributors, UI inspiration from top food delivery platforms

---

## 📄 License

MIT License — see the LICENSE file.

---

## 👨‍💻 Developer

**Darshan Kumar GP**

[GitHub](https://github.com/DarshanKumarGP) | [LinkedIn](http://www.linkedin.com/in/darshankumargp) | darshankumargp18@gmail.com

---

## ⭐ Star This Repo!

If you learned or gained from this project, please star and share!

---

*Building the future of food delivery, one commit at a time 🚀*
