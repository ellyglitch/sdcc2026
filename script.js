let events = [];

let currentDay = "Wednesday";

let currentCategory = "All";

// Wait for the page to load
document.addEventListener("DOMContentLoaded", async () => {

    // Load the event database
    const response = await fetch("events.json");
    events = await response.json();

    // Display Wednesday first
    displayEvents();

    // Day Buttons
  document.querySelectorAll(".filter").forEach(button=>{

    button.addEventListener("click",()=>{

        document.querySelectorAll(".filter")
            .forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

        currentCategory=button.dataset.filter;

        displayEvents();

    });

});  

    // Search
    document
        .getElementById("search")
        .addEventListener("input", displayEvents);

});

const todaysEvents =

events.filter(event=>{

    const matchesDay =
        event.day===currentDay;

    const matchesSearch =

        event.title.toLowerCase().includes(searchText)

        ||

        event.location.toLowerCase().includes(searchText);

    const matchesCategory =

        currentCategory==="All"

        ||

        event.category===currentCategory;

    return(

        matchesDay

        &&

        matchesSearch

        &&

        matchesCategory


});
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

    const colors={

    "Activation":"#2B8FFF",

    "Food":"#2EAF5D",

    "Meetup":"#8B5CF6",

    "Party":"#F68B2C",

    "Show":"#E24848"

};

card.style.borderLeftColor=

colors[event.category] || "#666";

}
