Use Case: Send Message

Actor: Registered User

Description: This use case describes the process of a user sending a
message to a text channel in the messenger application.

Preconditions:

-   The user is logged in.

-   The user's dashboard contains accessible text channels

-   The user has network connectivity

-   The messaging feature is available

Main Flow:

1.  The user selects a text channel from their main dashboard.

2.  The system displays a stream view of all messages in the selected
    text channel, along with an input field at the bottom of the screen.

3.  The user clicks on the input area.

4.  The user composes a message and clicks on the "Send" button.

5.  The system validates the message.

6.  The system clears the input area.

7.  The system sends the user's message to the text channel.

Alternative Flows:

4a. The user sends too many messages in a short span of time.

1.  The user composes a message and clicks on the "Send" button.

2.  The system detects possible spam messaging.

3.  The system displays a message to the user reading "Slow down! You're
    sending messages too quickly."

4.  The system does not send the message to the text channel.

5.  The system clears the input area.

6.  If the user waits 10 seconds, go back to step 4 and continue as
    normal.

Postconditions:

-   The user's inputted message is successfully sent to the specified
    text channel.

-   The message is displayed in the channel's message stream.
