let events = [];

let currentDay = "Wednesday";

let activeFilters = [];

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("events.json");

        events = await response.json();

    } catch (err) {

        console.error("Could not load events.json", err);

        return;

    }

    // Day buttons

    document.querySelectorAll(".day").forEach(button => {

        button.addEventListener("click", () => {

            currentDay = button.dataset.day;

            document.querySelectorAll(".day")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            displayEvents();

        });

    });

    // Filter buttons

    document.querySelectorAll(".filter").forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;

            if (filter === "All") {

                activeFilters = [];

                document.querySelectorAll(".filter")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

            } else {

                document
                    .querySelector('[data-filter="All"]')
                    .classList.remove("active");

                button.classList.toggle("active");

                if (activeFilters.includes(filter)) {

                    activeFilters =
                        activeFilters.filter(f => f !== filter);

                } else {

                    activeFilters.push(filter);

                }

                if (activeFilters.length === 0) {

                    document
                        .querySelector('[data-filter="All"]')
                        .classList.add("active");

                }

            }

            displayEvents();

        });

    });

    // Search

    document
        .getElementById("search")
        .addEventListener("input", displayEvents);

    displayEvents();

});

function displayEvents() {

    const container =
        document.getElementById("events");

    container.innerHTML = "";

    const searchText =
        document
            .getElementById("search")
            .value
            .toLowerCase();

    const colors = {

        Activation: "#2B8FFF",

        Food: "#2EAF5D",

        Meetup: "#8B5CF6",

        Party: "#F68B2C",

        Show: "#E24848",

        Signing: "#C056D8"

    };

    const todaysEvents = events.filter(event => {

        const matchesDay =
            event.day === currentDay;

        const matchesSearch =

            event.title.toLowerCase().includes(searchText)

            ||

            event.location.toLowerCase().includes(searchText)

            ||

            event.description.toLowerCase().includes(searchText);

        const matchesCategory =

            activeFilters.length === 0 ||

            activeFilters.includes(event.category);

        return (

            matchesDay &&

            matchesSearch &&

            matchesCategory

        );

    });

    if (todaysEvents.length === 0) {

        container.innerHTML =

        `<div class="event-card">

            <h3>No events found.</h3>

        </div>`;

        return;

    }

    todaysEvents.forEach(event => {

        const card = document.createElement("div");

        card.className = "event-card";

        card.style.borderLeft =
            `8px solid ${colors[event.category] || "#666"}`;

        card.innerHTML = `

            <div class="event-time">

                ${event.time}

            </div>

            <h3>${event.title}</h3>

            <p><strong>📍 ${event.location}</strong></p>

            <p>${event.address}</p>

            <p>${event.price}</p>

            <p>${event.description}</p>

        `;

        container.appendChild(card);

    });

}
