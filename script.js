let events = [];
let currentDay = "Wednesday";

// Wait for the page to load
document.addEventListener("DOMContentLoaded", async () => {

    // Load the event database
    const response = await fetch("events.json");
    events = await response.json();

    // Display Wednesday first
    displayEvents();

    // Day Buttons
    document.querySelectorAll(".day").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".day")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            currentDay = button.dataset.day;

            displayEvents();

        });

    });

    // Search
    document
        .getElementById("search")
        .addEventListener("input", displayEvents);

});

function displayEvents(){

    const container = document.getElementById("events");

    container.innerHTML = "";

    const searchText =
        document
            .getElementById("search")
            .value
            .toLowerCase();

    const todaysEvents =
        events.filter(event => {

            const matchesDay =
                event.day === currentDay;

            const matchesSearch =
                event.title.toLowerCase().includes(searchText) ||
                event.location.toLowerCase().includes(searchText);

            return matchesDay && matchesSearch;

        });

    if(todaysEvents.length===0){

        container.innerHTML=`
            <div class="event-card">
                <h2>No events found.</h2>
            </div>
        `;

        return;

    }

    todaysEvents.forEach(event=>{

        const card=document.createElement("div");

        card.className="event-card";

        card.innerHTML=`

            <div class="event-time">

                ${event.time}

            </div>

            <h3>

                ${event.title}

            </h3>

            <div class="event-location">

                📍 ${event.location}

            </div>

            <p>

                ${event.address}

            </p>

            <br>

            <strong>

                ${event.category}

            </strong>

            <br>

            ${event.price}

        `;

        // Category Color

        switch(event.category){

            case "Activation":
                card.style.borderColor="#8B5CF6";
                break;

            case "Food":
                card.style.borderColor="#2EAF5D";
                break;

            case "Meetup":
                card.style.borderColor="#2B8FFF";
                break;

            case "Signing":
                card.style.borderColor="#2B8FFF";
                break;

            case "Party":
                card.style.borderColor="#F68B2C";
                break;

            case "Show":
                card.style.borderColor="#E24848";
                break;

            default:
                card.style.borderColor="#6C4CE6";

        }

        container.appendChild(card);

    });

}
