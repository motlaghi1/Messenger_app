# Use Case: Receive Message

### Actor: Registered User

### Description:
This use case describes the process of a user receiving and viewing a message in the messenger application.

### Preconditions:

-	The user is currently logged in.

-	The messaging feature is available.

-	The user is currently in a text channel or direct message.

-	Another registered user sent a message to the actor user. 

### Main Flow:

1.	The system pulls the updated version of the current text channel or direct message.

2.	The system compares the user's current chat session and the pulled session for any new messages.

3.	The system displays any new messages in the user's message stream with a bold format.

4.	After 5 seconds, the bold format is cleared on the user's message stream.

### Postconditions:

-	The received message is saved in the current text channel or direct message stream.