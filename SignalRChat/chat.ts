import * as autobahn from "autobahn"
import * as $ from "jquery"

// Get the user name and store it to prepend to messages.
$('#displayname').val(<string>prompt('Enter your name:', ''));
// Set initial focus to message input box.
$('#message').focus();

var connection = new autobahn.Connection({ url:"ws://localhost:5000/chat/", realm:"realm1"});
// Create a function that the hub can call to broadcast messages.

connection.onopen = (session, details) => {
    session.subscribe("app.chat.messages",
        (args: any[]) => {
            var name: string = <string>args[0];
            var message: string = <string>args[1];

            var encodedName = $('<div />').text(name).html();
            var encodedMsg = $('<div />').text(message).html();
            // Add the message to the page.
            $('#discussion').append('<li><strong>' + encodedName + '</strong>:&nbsp;&nbsp;' + encodedMsg + '</li>');
        });

    $('#sendmessage').click(() => {
        // Call the Send method on the hub.
        session.publish('app.chat.messages', [$('#displayname').val(), $('#message').val()], {}, { exclude_me: false });

        // Clear text box and reset focus for next comment.
        $('#message').val('').focus();
    });    
};

connection.open();