# library-management-system_advanced_roles
📚 Library Management System (Node.js + Express + MongoDB + EJS)

A full-stack Library Management System built using Node.js, Express, MongoDB, and EJS.
This project supports multiple user roles (Student, Teacher, Admin) and allows secure login, book management, and tracking of transactions (issue/return history).

🚀 Features

✅ User Authentication – Register & Login (Student / Teacher / Admin).
✅ Role-based Access –

Students → Can view, issue, and return books.

Teachers → Can issue/return and delete books.

Admins → Full access, including viewing all user transactions.
✅ Book Management – Add, view, delete, issue, and return books.
✅ Transactions History – Keep track of who issued/returned which book and when.
✅ Responsive UI – Built using EJS templates with modern CSS styling.

🛠️ Tech Stack

Backend: Node.js, Express.js

Frontend: EJS Templating Engine

Database: MongoDB (Mongoose ODM)

Authentication: Express-Session + Bcrypt

Other: Body-parser

📂 Project Structure
library-management-system/
├─ models/
│  ├─ Book.js
│  ├─ User.js
│  └─ Transaction.js
├─ views/
│  ├─ partials/
│  │  └─ header.ejs
│  ├─ home.ejs
│  ├─ login.ejs
│  ├─ register.ejs
│  └─ transactions.ejs
├─ app.js
├─ package.json
└─ README.md

⚡ Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/library-management-system.git
cd library-management-system

2️⃣ Install Dependencies
npm install

3️⃣ Setup MongoDB

Make sure MongoDB is running locally at:

mongodb://127.0.0.1:27017/libraryDB

4️⃣ Run the Application
node app.js


Now visit 👉 http://localhost:3000
 in your browser.

👥 User Roles

Student → Can view, issue, and return books.

Teacher → Can issue/return and delete books.

Admin → Can do everything + view all transactions of all users.

📸 Preview

📌 Books Dashboard


📌 Transactions Page
(screenshot add karna hoga)

🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

📬 Contact

👤 Mohammad Danish
📧 Email: khandanishindia04@gmail.com

🔗 LinkedIn Profile

⭐ If you like this project, don't forget to star the repo!
