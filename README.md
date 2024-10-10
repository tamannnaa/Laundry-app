# Laundry Management System 🌐🚀


A web application designed to manage laundry services for students in hostels, with user and admin roles for form submissions, status updates, and user management. The project uses **Node.js**, **Express**, **MongoDB**, and **EJS** for rendering views.

## Table of Contents 📃
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used 👨‍💻
- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: Database for storing user and laundry information.
- **Mongoose**: MongoDB ODM for modeling and interacting with database objects.
- **EJS**: Template engine for rendering views.
- **express-session**: Session management for login sessions.
- **body-parser**: Middleware to parse incoming request bodies.

## Features 🌟
- **User Authentication**: Sign up and log in for both students and laundry administrators.
- **Form Submission**: Students can submit laundry requests, specifying hostel and clothes data.
- **Admin Dashboard**: Admins can update the status of laundry requests and manage students.
- **Account Deletion**: Students can delete their accounts and associated laundry forms.
- **Session Management**: Uses sessions to maintain user logins and authorization.

## Setup Instructions 🔨

Follow these steps to set up the project on your local machine:

### Prerequisites ⚙️
Ensure you have the following installed:
- **Node.js**: [Download and install](https://nodejs.org/)
- **MongoDB**: You can use MongoDB Atlas for a cloud-based database.

### Installation 🔧
1. Clone the repository:

   ```bash
   git clone https://github.com/tamannnaa/Blog.git

   
2. Navigate to the project directory:


   ```bash
   cd laundryfinal

3. Install dependencies:

   ```bash
   npm install
   
4. Set up MongoDB connection:
      Update the MongoDB connection string in the code with your credentials.
    ```bash
    mongoose.connect("mongodb+srv://<username>:<password>@cluster0.lklbc3z.mongodb.net/laundry?retryWrites=true&w=majority&appName=Cluster0");
    
5. Start the server:

   ```bash
   node index.js

  ## Folder Structure 📂
  
| Directory/File        | Description                                   |  
|-----------------------|-----------------------------------------------|
| /views                | # EJS template files for rendering            |
| /models               | # Mongoose schema and models                  |
| index.js              | # Main server file                            |
| package.json          | # Project dependencies and scripts            |


## Usage 💻
  ### Student Actions 🔑
  1. Sign Up: Access the /signup page to create a new account.
  2. Log In: Navigate to /studentlogin to log in as a student.
  3. Submit Laundry Form: Go to /create-form to fill out and submit your laundry details.
  4. Delete Account: Use the /delete route to delete your account and all associated data.
  5. Logout: Click the logout button or go to /logout to end the session.
     
  ### Admin Actions 🔑
  1. Admin Login: Visit /laundrylogin to log in as an admin.
  2. Dashboard: Once logged in, access the admin dashboard at /admin.
  3. Update Form Status: Change the status of submitted laundry forms from "pending" to "picked" or "washed."

## API Endpoints 🔗
   ### User Routes 📡
   1. GET */studentlogin*: Display student login form.
   2. POST */signup*: Create a new user account.
   3. POST */studentlogin*: Authenticate student login.
      
   ### Admin Routes 📡
   1. GET */laundrylogin*: Display admin login form.
   2. POST */update-form-status*: Update laundry form status (Admin only).
      
   ### Common Routes 📡
   1. POST */create-form*: Submit a new laundry form.
   2. GET */logout*: Destroy session and log out.
      
   ### Known Issues ⛓️‍💥
   1. Session Expiry: Currently, sessions do not have a set expiry time.
   2. Form Validation: There is minimal client-side validation; consider enhancing it for better UX.

## Contributing 🤝
  Contributions are welcome! If you have suggestions or find any bugs, feel free to open an issue or create a pull request.
  
  ### Steps to Contribute:
  1. Fork the repository.
  2. Create a new branch:
     ```bash
     git checkout -b feature-branch
  3. Commit your changes:
     ```bash
     git commit -m "Description of changes"
  4. Push to your forked repository:
     ```bash
     git push origin feature-branch
  5. Create a pull request on the main repository.


## License 📄
This project is licensed under the MIT License - see the LICENSE file for details.






