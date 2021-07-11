# users-management-app

This repo contains guidenss for an exercise of creating a users management platform including email validation, registration and login pages, and a users database.

# Goal
Build a user management platform including the following features:
1. Users database
2. Login of existing user
3. Registration of new user
4. Email validation system
4. Two-factor authentication [Optional]
5. Pages: Login page, registration page and profile page.
6. Admin page 

# Rules
1. Create node.js service and deploy to ec2 Heroku.
2. Use postgresSQL as database framework.

# Products
1. A gitlab repository of your code.
2. A service deployed in Heroku.
3. Link to 'Login page'.

# Details
## Tables
The database should contain 2 tables, **users_table** and **users_credentials** <br/>
### users_table
Contains all the relevant data per user.
- user_id : unique user id
- email : validate
- full_name : validate
- created_at : Date and time. Date format should be the same as 'day_of_birth' format.


### users_credentials
Conatins the mapping between user_id to the user's password.
As for encryption, it's up to you to decide.

## Front end
The page UI design files are in 'sketch' folder.
### Login page
Login using the email and password.<br/>
On sucess directs you to the 'Profile page' (just create a simple page with some welcoming message).
On failure let you know and stays on the same page.

### Registration page
Regsiter button : On press adds the users data and credntials to the database.<br/>
Of course all fields must be validate - its' up to you to decide how.<br/>
If the users data is valid, goto 'Login page'.<br/>

### Admin page
This page is for the system admin. It should support 'view all users' and 'remove user' features.

## Security
### Email validation
You should manage an email validation process - meaning that until email validation the user won't be able to login.





