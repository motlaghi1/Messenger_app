<h1>Sprint 1</h1>
This sprint has completed functionality for signing up, logging in, editing existing user information, and deleting accounts.

---

## Trello Link: 

https://trello.com/invite/b/66d87bb6eca854b979ac1984/ATTI8fa67f1cf36553598cbdd034b9514c0fE350B696/cps-490-messenger-application

## Use Case Descriptions

### Use Case: Signup Information

#### Actor: Unregistered User

#### Main Flow:

1. The user is shown the login page, which displays a signup button at the bottom

2. The user selects the signup page and is redirected to the signup page

3. The user is shown a form asking for a ID, password, Name, Email, and UDid

4. The user enters the required information.

5. The system adds the information to a new entry in the database.

6. The user is redirected to the protected page

#### Post Conditions:

- User is logged in and session is started

- The user's session is maintained by the system.

#### Alternate Flow:

1. User tries to signup using existing ID
   
    a. System refreshes page displaying an error saying the username is already in use

---

### Use Case: User Login

#### Actor: User

#### Description: 
This use case describes the process of a user logging into the messenger application.

#### Preconditions:

-   The user is not currently logged in.

-   The login page is accessible.

-   The user has network connectivity

#### Main Flow:

1.  The user navigates to the login page.

2.  The system displays a username and password field for the login form.

3.  The user enters a username in the username field, a password in the password field.

4.  The user clicks the "Login" button.

5.  The system validates the username.

6.  The system logs the user in.

7.  The system redirects the user to the protected page.

7.  The protected page shows options to Logout, Edit User Info, and Delete Account

#### Alternative Flows:

1. The inputted username is not registered in the system.

2. The system denies entry, shows a message saying the username is not valid, and shows a button to go back to the login page

#### Postconditions:

-   The user is successfully logged into the system.

-   The user's session is created and maintained by the system.



---

### Use Case: Edit Information

#### Actor: Registered User

#### Description:
This use case describes the process of a user editing their existing user information

#### Preconditions:

-   The user is currently logged in.


#### Main Flow:

1.  The user selects the Edit User Information button

2.  The system shows a form with each field for their ID, Name, Email, and UDid

3.  The user enters updated information

4.  The system updates the database and redirects the user to the login page.

#### Alternate Flow:

1.    The user is not logged in

      a. The system displays an error and redirects to login

2.  The user tries to update to an existing username

     a.  The system refreshes the edit page with an error saying the username is invalid

---


### Use Case: Delete Information:

#### Actor: Registered User

#### Main Flow:

1. User is on protected page after signing in

2. User selects button that says "Delete Account"

3. The system deletes the User from the database

4. The system destroys the session

5. The system redirects the user to the signup page

