function sendMessage() {

    console.log("SEND BUTTON CLICKED");

    const input =
        document.getElementById("questionInput");

    const chat =
        document.getElementById("chatMessages");


    const question =
        input.value.trim();


    if (question === "") {

        alert("Please enter a question.");

        return;
    }


    // Show user's message
    chat.innerHTML += `

        <div class="message user-message">

            <div class="message-icon">
                👤
            </div>

            <div class="message-content">
                <p>${question}</p>
            </div>

        </div>

    `;


    // Clear input
    input.value = "";


    // Show thinking
    chat.innerHTML += `

        <div
            id="thinking"
            class="message bot-message"
        >

            <div class="message-icon">
                🤖
            </div>

            <div class="message-content">
                <p>Thinking...</p>
            </div>

        </div>

    `;


    chat.scrollTop =
        chat.scrollHeight;


    // Send question to Flask
    fetch("/chat", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            question: question

        })

    })


    .then(function(response) {

        console.log(
            "Server status:",
            response.status
        );

        return response.json();

    })


    .then(function(data) {

        console.log(
            "Server response:",
            data
        );


        // Remove Thinking
        const thinking =
            document.getElementById(
                "thinking"
            );


        if (thinking) {
            thinking.remove();
        }


        // Show answer
        if (data.success) {

            chat.innerHTML += `

                <div class="message bot-message">

                    <div class="message-icon">
                        🤖
                    </div>

                    <div class="message-content">

                        <p>
                            ${data.answer}
                        </p>

                    </div>

                </div>

            `;

        } else {

            chat.innerHTML += `

                <div class="message bot-message">

                    <div class="message-icon">
                        🤖
                    </div>

                    <div class="message-content">

                        <p>
                            ${data.answer ||
                            "Something went wrong."}
                        </p>

                    </div>

                </div>

            `;
        }


        chat.scrollTop =
            chat.scrollHeight;

    })


    .catch(function(error) {

        console.error(
            "FETCH ERROR:",
            error
        );


        const thinking =
            document.getElementById(
                "thinking"
            );


        if (thinking) {
            thinking.remove();
        }


        chat.innerHTML += `

            <div class="message bot-message">

                <div class="message-icon">
                    🤖
                </div>

                <div class="message-content">

                    <p>
                        Unable to connect to the server.
                    </p>

                </div>

            </div>

        `;

    });

}


/* -----------------------------------------
   Suggestion buttons
----------------------------------------- */

function askQuestion(question) {

    document.getElementById(
        "questionInput"
    ).value = question;

    sendMessage();

}


/* -----------------------------------------
   Enter key
----------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const input =
            document.getElementById(
                "questionInput"
            );


        input.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }
);