# Use Case: Send Message to Single Receiver

### Actor: Registered User

### Description: 
This use case describes the process of a user sending a message directly to a single recipient in the messenger application.

### Preconditions:

-   The user is logged in.

-   The user's dashboard contains accessible direct message recipients

-   The user has network connectivity

-   The messaging feature is available

### Main Flow:

1.  The user selects a user to direct message from their main dashboard.

2.  The system displays a stream view of message history in the selected
    text channel, along with an input field at the bottom of the screen.

3.  The user clicks on the message input field.

4.  The user composes a message and clicks on the "Send" button.

5.  The system validates the message.

6.  The system clears the input field.

7.  The system sends the user's message to the selected recipient.

### Alternative Flows:

1a. The user does not have any previously saved direct messages.

1. The user clicks on the "Plus" button in the top right corner of the screen.

2. The system directs the user to a "New Message" screen with an input field for a recipient at the top, and an input field for the message at the bottom.

3. The user enters their desired recipient's username in the recipient input field.

4. The use case continues from step 3.


4a. The user sends too many messages in a short span of time.

1.  The user composes a message and clicks on the "Send" button.

2.  The system detects possible spam messaging.

3.  The system displays a message to the user reading "Slow down! You're
    sending messages too quickly."

4.  The system does not send the message to the text channel.

5.  The system clears the input field.

6.  If the user waits 10 seconds, go back to step 4 and continue as
    normal.

### Postconditions:

-   The user's inputted message is successfully sent to the specified recipient.

-   The message is displayed in the message stream.
