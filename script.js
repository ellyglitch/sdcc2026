let events = [];

let currentDay = "Wednesday";

let activeFilters = [];

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

        const filter = button.dataset.filter;

        // ALL button

        if(filter==="All"){

            activeFilters=[];

            document
                .querySelectorAll(".filter")
                .forEach(btn=>btn.classList.remove("active"));

            button.classList.add("active");

            displayEvents();

            return;

        }

        // deactivate ALL

        document
            .querySelector('[data-filter="All"]')
            .classList.remove("active");

        button.classList.toggle("active");

        if(activeFilters.includes(filter)){

            activeFilters=
                activeFilters.filter(f=>f!==filter);

        }else{

            activeFilters.push(filter);

        }

        // if nothing selected

        if(activeFilters.length===0){

            document
                .querySelector('[data-filter="All"]')
                .classList.add("active");

        }

        displayEvents();

    });

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

activeFilters.length===0

||

activeFilters.includes(event.category);

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
