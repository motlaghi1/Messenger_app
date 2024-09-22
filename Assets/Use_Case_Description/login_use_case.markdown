# Use Case: User Login
---
### Actor: User

### Description: 
This use case describes the process of a user logging into the messenger application.

### Preconditions:

-   The user is not currently logged in.

-   The login page is accessible.

-   The user has network connectivity

### Main Flow:

1.  The user navigates to the login page.

2.  The system displays a username field for the login form.

3.  The user enters a username in the username field.

4.  The user clicks the "Login" button.

5.  The system validates the username.

6.  The system logs the user in.

7.  The system retrieves the user's message information.

7.  The system redirects the user to their message dashboard.

### Alternative Flows:

4a. The inputted username is not registered in the system.

1.  The system creates a new database entry for the inputted username.

2.  The use case resumes at step 6.


### Postconditions:

-   The user is successfully logged into the system.

-   The user's session is created and maintained by the system.

-   The user's inputted username, if newly created, is logged by the
    system along with any following messages.
