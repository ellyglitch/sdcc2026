let events = [];

let currentDay = "Wednesday";

let activeFilters = [];

// Load page
document.addEventListener("DOMContentLoaded", async () => {

    // Load events
    const response = await fetch("events.json");
    events = await response.json();

    displayEvents();

    // ------------------
    // DAY BUTTONS
    // ------------------

    document.querySelectorAll(".day").forEach(button => {

        button.addEventListener("click", () => {

            currentDay = button.dataset.day;

            document.querySelectorAll(".day")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            displayEvents();

        });

    });

    // ------------------
    // FILTER BUTTONS
    // ------------------

    document.querySelectorAll(".filter").forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;

            if (filter === "All") {

                activeFilters = [];

                document.querySelectorAll(".filter")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

                displayEvents();

                return;

            }

            document
                .querySelector('[data-filter="All"]')
                .classList.remove("active");

            button.classList.toggle("active");

            if (activeFilters.includes(filter)) {

                activeFilters = activeFilters.filter(f => f !== filter);

            } else {

                activeFilters.push(filter);

            }

            if (activeFilters.length === 0) {

                document
                    .querySelector('[data-filter="All"]')
                    .classList.add("active");

            }

            displayEvents();

        });

    });

    // ------------------
    // SEARCH
    // ------------------

    document
        .getElementById("search")
        .addEventListener("input", displayEvents);

});

// =======================================
// DISPLAY EVENTS
// =======================================

function displayEvents() {

    const container = document.getElementById("events");

    container.innerHTML = "";

    const searchText =
        document
            .getElementById("search")
            .value
            .toLowerCase();

    const todaysEvents = events.filter(event => {

        const matchesDay =
            event.day === currentDay;

        const matchesSearch =
            event.title.toLowerCase().includes(searchText) ||
            event.location.toLowerCase().includes(searchText);

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

        container.innerHTML = `
            <div class="event-card">
                <h2>No events found.</h2>
            </div>
        `;

        return;

    }

    const colors = {

        "Activation": "#2B8FFF",

        "Food": "#2EAF5D",

        "Meetup": "#8B5CF6",

        "Party": "#F68B2C",

        "Show": "#E24848"

    };

    todaysEvents.forEach(event => {

        const card = document.createElement("div");

        card.className = "event-card";

        card.style.borderLeft = `8px solid ${colors[event.category] || "#666"}`;

        card.innerHTML = `

            <div class="event-time">
                ${event.time}
            </div>

            <h3>${event.title}</h3>

            <div class="event-location">
                📍 ${event.location}
            </div>

            <p>${event.address}</p>

            <strong>${event.category}</strong>

            <br>

            ${event.price}

        `;

        container.appendChild(card);

    });

}
