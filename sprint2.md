<h1>Sprint 2</h1>
This sprint has completed functionality for signing up, logging in, editing existing user information, deleting accounts, messaging, and administrative login disabling.

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

6. The user is redirected to the chat page

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

7.  The system redirects the user to the chat page.

7.  The chat page automatically shows the global chat, with options to switch to direct messages and group messages, as well as buttons to reload, logout, or edit user information.

#### Alternative Flows:

1. The inputted username is not registered in the system.

2. The system denies entry, shows a message saying the username is not valid, and shows a button to go back to the login page

3. The user is registered, but disabled.

4. The system denies entry and shows a message saying the user is disabled.

#### Postconditions:

-   The user is successfully logged into the system.

-   The user's session is created and maintained by the system.



---
### Use Case: Global Messaging
#### Actor: User

#### Description: 
This use case describes the process of a user sending messages in the global chat.

#### Preconditions:

-   The user is not currently logged in.

-   The user is on the chat page. 

#### Main Flow:

1.  The user is sent to the chat page immediately after loggin in.

2.  The chat page shows all global chats, and options to switch to Direct Messages, Group Messages, or find users to create DM or Group Messages.

3.  The user types a message and selects enter.

4.  The page refreshes with the sent message displaying.  If another user sends a message in the global chat, the page refreshes with that message showing.


6.  The system logs the user in.

7.  The system redirects the user to the chat page.

7.  The chat page automatically shows the global chat, with options to switch to direct messages and group messages, as well as buttons to reload, logout, or edit user information.
---

### Use Case: Edit Information

#### Actor: Registered User

#### Description:
This use case describes the process of a user editing their existing user information

#### Preconditions:

-   The user is currently logged in.
-   The user is on the chat page

#### Main Flow:

1.  The user selects the profile button and is redirected to the protected page.

2.  The user selects the Edit User Information button

3.  The system shows a form with each field for their ID, Name, Email, and UDid

4.  The user enters updated information

5.  The system updates the database and redirects the user to the login page.

#### Alternate Flow:

1.    The user is not logged in

      a. The system displays an error and redirects to login

2.  The user tries to update to an existing username

     a.  The system refreshes the edit page with an error saying the username is invalid

---


### Use Case: Delete Information:

#### Actor: Registered User

#### Main Flow:

1. User is on protected page after signing in and clicking the user profile button

2. User selects button that says "Delete Account"

3. The system deletes the User from the database

4. The system destroys the session

5. The system redirects the user to the signup page

---

### Use Case: Admin Page:

#### Actor: Administrator

#### Main Flow:

1. Admin logs in using admin credentials

2. Admin selects user profile button

3. User is redirected to the admin page which shows a table of all registered users.

4. Table shows toggle buttons for login ability for each user, when toggled, affected user will either no longer be able to login or will be able to login if enabled.


#### Alternate Flow:

1. Unauthorized user tried to go to /admin page

2. Unauthorized user is redirected to the login page with a message saying they are forbidden from accessing the admin page.

---

### UI Rationale

The "Yapper" messenger app follows a common messenger application layout with three sections. The left most panel is the navigation bar, which contains buttons with different functionality such as profile, logout, and different chat types(Global, Group Chat, and Direct Messages). The section on the right of the navigation bar is the contact list, lets call it the side bar. and the main section contains the actual chat window, displaying messages with sender information, timestamps,, and content. Messages from current user appears on the right in the primary color, while received messages appears on the left in the secondary color. At the bottom of the chat window is the input area with a text field and send button. When user is in global chat, the side bar on the left displays all the user in this app. If you want to build a direct message channel with one of the users, just simply hover over it and a direct message button will populate. Clicking that will redirect you to the Direct message chats and load up your chat histories. In Direct messages, the sidebar will populate all the users and their status that you had a direct message with. You could always choose to delete this user from the list by simply hover over and click on the delete button. For group chats, users can create or join groups through a modal dialog, with options for public or private (password-protected) groups. The interface uses Bootstrap's utility classes for spacing, flexbox layouts, and responsive design.  


*All Bootstrap styling code sourced from https://getbootstrap.com/docs/5.3/getting-started/introduction/*
