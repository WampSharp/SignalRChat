import * as readline from "readline"
import * as autobahn from "autobahn"
import * as When from "when"

let rl = readline.createInterface(process.stdin, process.stdout);

rl.question('Enter your name: ',
    async name => {
        console.log(name);

        let connection = new autobahn.Connection({ url: "ws://localhost:5000/chat/", realm: "realm1" });

        var onOpen = When.defer<autobahn.Session>();

        connection.onopen = (session, details) => {
            session.subscribe("app.chat.messages",
                (args: any[]) => {
                    var name: string = <string>args[0];
                    var message: string = <string>args[1];

                    console.log(`${name}: ${message}`);
                    rl.prompt(true);
                });

            onOpen.resolve(session);
        };

        try {
            connection.open();
            var session = await onOpen.promise;
            rl.prompt();

            rl.on("line",
                async input => {
                    if (input === "!q") {
                        console.log("Stopping connection...");
                        connection.close();
                        rl.close();
                        return;
                    }
                    await session.publish('app.chat.messages',
                        [name, input],
                        {},
                        { exclude_me: false, acknowledge: true });
                });
        } catch (error) {
            console.error(error);
            rl.close();
        }
    });