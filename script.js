// ======================================================
// SDCC OFF-SITES PLANNER
// Version 2.0
// By Elly Glitch
// ======================================================



// ======================================================
// CONFIGURATION
// ======================================================

const DAY_FILES = {

    Wednesday: "events/wednesday.json",

    Thursday: "events/thursday.json",

    Friday: "events/friday.json",

    Saturday: "events/saturday.json",

    Sunday: "events/sunday.json"

};



const CATEGORY_COLORS = {

    Activation: "#2B8FFF",

    Food: "#2EAF5D",

    Meetup: "#8B5CF6",

    Signing: "#C056D8",

    Party: "#F68B2C",

    Show: "#E24848"

};



const STORAGE_KEY = "sdccPlanner";



// ======================================================
// APPLICATION STATE
// ======================================================

let events = [];

let currentDay = "Wednesday";

let activeFilters = [];

let searchText = "";



let planner = {

    schedule: [],

    favorites: [],

    completed: []

};



// ======================================================
// LOCAL STORAGE
// ======================================================

function loadPlanner() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        planner = {

            schedule: [],

            favorites: [],

            completed: []

        };

        return;

    }

    try {

        planner = JSON.parse(saved);

    }

    catch (error) {

        console.error(error);

        planner = {

            schedule: [],

            favorites: [],

            completed: []

        };

    }

}



function savePlanner() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(planner)

    );

}



// ======================================================
// PLANNER HELPERS
// ======================================================

function isScheduled(id) {

    return planner.schedule.some(

        event => event.id === id

    );

}



function isFavorite(id) {

    return planner.favorites.includes(id);

}



function isCompleted(id) {

    return planner.completed.includes(id);

}



function toggleSchedule(event) {

    const exists = planner.schedule.find(

        item => item.id === event.id

    );

    if (exists) {

        planner.schedule =

            planner.schedule.filter(

                item => item.id !== event.id

            );

    }

    else {

      planner.schedule.push({

    id: event.id,

    day: event.day,

    title: event.title,

    time: event.time,

    endTime: event.endTime,

    location: event.location,

    address: event.address,

    category: event.category,

    subcategory: event.subcategory,

    price: event.price,

    description: event.description,

    notes: event.notes,

    website: event.website,

    ticketLink: event.ticketLink,

    googleMaps: event.googleMaps,

    featured: event.featured

        });

    }

    savePlanner();

}



function toggleFavorite(id) {

    if (planner.favorites.includes(id)) {

        planner.favorites =

            planner.favorites.filter(

                favorite => favorite !== id

            );

    }

    else {

        planner.favorites.push(id);

    }

    savePlanner();

}



function toggleCompleted(id) {

    if (planner.completed.includes(id)) {

        planner.completed =

            planner.completed.filter(

                completed => completed !== id

            );

    }

    else {

        planner.completed.push(id);

    }

    savePlanner();

}



// ======================================================
// LOAD EVENTS
// ======================================================

async function loadEvents(day) {

    const file = DAY_FILES[day];

    try {

        const response = await fetch(file);

        if (!response.ok) {

            throw new Error(

                `Unable to load ${file}`

            );

        }

        events = await response.json();

    }

    catch (error) {

        console.error(error);

        events = [];

    }

}



// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        loadPlanner();

        await loadEvents(currentDay);

        initializeDayButtons();

        initializeCategoryButtons();

        initializeSearch();

        initializePlanner();

        displayEvents();

    }

);// ======================================================
// DAY BUTTONS
// ======================================================

function initializeDayButtons() {

    const buttons = document.querySelectorAll(".day");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const selectedDay = button.dataset.day;

            if (selectedDay === currentDay) return;

            currentDay = selectedDay;

            buttons.forEach(btn =>

                btn.classList.remove("active")

            );

            button.classList.add("active");

            await loadEvents(currentDay);

            displayEvents();

        });

    });

}



// ======================================================
// CATEGORY FILTERS
// ======================================================

function initializeCategoryButtons() {

    const buttons = document.querySelectorAll(".filter");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const category = button.dataset.filter;

            if (category === "All") {

                activeFilters = [];

                buttons.forEach(btn =>

                    btn.classList.remove("active")

                );

                button.classList.add("active");

            }

            else {

                document

                    .querySelector('[data-filter="All"]')

                    .classList.remove("active");

                button.classList.toggle("active");

                if (activeFilters.includes(category)) {

                    activeFilters =

                        activeFilters.filter(

                            item => item !== category

                        );

                }

                else {

                    activeFilters.push(category);

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

}



// ======================================================
// SEARCH
// ======================================================

function initializeSearch() {

    const search =

        document.getElementById("search");

    search.addEventListener("input", () => {

        searchText =

            search.value.toLowerCase();

        displayEvents();

    });

}



// ======================================================
// DISPLAY EVENTS
// ======================================================

function displayEvents() {

    const container =

        document.getElementById("events");

    container.innerHTML = "";

    const filteredEvents =

        events.filter(event => {

            const matchesSearch =

                (event.title || "")

                    .toLowerCase()

                    .includes(searchText)

                ||

                (event.location || "")

                    .toLowerCase()

                    .includes(searchText)

                ||

                (event.description || "")

                    .toLowerCase()

                    .includes(searchText);

            const matchesCategory =

                activeFilters.length === 0

                ||

                activeFilters.includes(

                    event.category

                );

            return (

                matchesSearch &&

                matchesCategory

            );

        });

    if (filteredEvents.length === 0) {

        container.innerHTML =

        `

        <div class="event-card">

            <h2>

                No events found.

            </h2>

        </div>

        `;

        return;

    }

    filteredEvents.forEach(event => {

        const card =

            createEventCard(event);

        container.appendChild(card);

    });

}// ======================================================
// CREATE EVENT CARD
// ======================================================

function createEventCard(event) {

    const card = document.createElement("div");

    card.className = "event-card";

    card.style.borderLeft =
        `8px solid ${CATEGORY_COLORS[event.category] || "#777"}`;

    const featured = event.featured

        ? `<span class="featured-badge">⭐ Featured</span>`

        : "";

    const badge = event.badgeRequired

        ? `<span class="badge-required">🎟 Badge Required</span>`

        : "";

    const family = event.familyFriendly

        ? `<span class="family-friendly">👨‍👩‍👧 Family Friendly</span>`

        : "";

    const details = `

        <div class="event-details" style="display:none;">

            <p>

                ${event.description || ""}

            </p>

            <p>

                <strong>Address</strong><br>

                ${event.address || ""}

            </p>

            <p>

                <strong>Notes</strong><br>

                ${event.notes || ""}

            </p>

            <div class="event-links">

                ${event.website
                    ? `<a href="${event.website}" target="_blank">Website</a>`
                    : ""}

                ${event.ticketLink
                    ? `<a href="${event.ticketLink}" target="_blank">Tickets</a>`
                    : ""}


            </div>

            <div class="event-tags">

                ${(event.tags || [])

                    .map(tag =>

                        `<span class="tag">${tag}</span>`

                    )

                    .join("")}

            </div>

        </div>

    `;

    card.innerHTML = `

        <div class="event-header">

            <div class="event-time">

                ${event.time}

            </div>

            <h2>

                ${event.title}

            </h2>

            <div class="event-meta">

                ${featured}

                ${badge}

                ${family}

            </div>

            <div class="event-category">

                ${event.category}

                •

                ${event.subcategory || ""}

            </div>

            <div class="event-location">

                📍 ${event.location}

            </div>

            <div class="event-price">

                💲 ${event.price}

            </div>

        </div>

        <div class="event-buttons">

            <button class="details-btn">

                ▼ Details

            </button>

            <button class="schedule-btn">

                ${isScheduled(event.id)

                    ? "✓ Scheduled"

                    : "+ Add to Schedule"}

            </button>

            <button class="favorite-btn">

                ${isFavorite(event.id)

                    ? "★ Favorite"

                    : "☆ Favorite"}

            </button>

        </div>

        ${details}

    `;

    const detailsButton =

        card.querySelector(".details-btn");

    const detailsPanel =

        card.querySelector(".event-details");

    detailsButton.addEventListener(

        "click",

        () => {

            if (

                detailsPanel.style.display === "none"

            ) {

                detailsPanel.style.display = "block";

                detailsButton.textContent =

                    "▲ Hide Details";

            }

            else {

                detailsPanel.style.display = "none";

                detailsButton.textContent =

                    "▼ Details";

            }

        }

    );

    card

        .querySelector(".schedule-btn")

        .addEventListener(

            "click",

            () => {

                toggleSchedule(event);

                renderPlanner();

                displayEvents();

            }

        );

    card

        .querySelector(".favorite-btn")

        .addEventListener(

            "click",

            () => {

                toggleFavorite(event.id);

                displayEvents();

            }

        );

    return card;

}// ======================================================
// PLANNER
// ======================================================

function initializePlanner() {

    updatePlannerCounter();

    renderPlanner();

    const clearButton =

        document.getElementById(

            "clear-planner"

        );

    if (clearButton) {

        clearButton.addEventListener(

            "click",

            () => {

                const confirmed = confirm(

                    "Clear your entire schedule?"

                );

                if (!confirmed) return;

                planner.schedule = [];

                savePlanner();

                updatePlannerCounter();

                renderPlanner();

                displayEvents();

            }

        );

    }

}



// ======================================================
// PLANNER COUNTER
// ======================================================

function updatePlannerCounter() {

    const counter =

        document.getElementById(

            "planner-count"

        );

    if (!counter) return;

    const total =

        planner.schedule.length;

    counter.textContent =

        `${total} Event${total === 1 ? "" : "s"}`;

}



// ======================================================
// RENDER PLANNER
// ======================================================

function renderPlanner() {

    const container =

        document.getElementById(

            "planner-events"

        );

    if (!container) return;

    container.innerHTML = "";

    if (planner.schedule.length === 0) {

        container.innerHTML =

        `

        <p>

            Your schedule is empty.

        </p>

        `;

        updatePlannerCounter();

        return;

    }

    const days = [

        "Wednesday",

        "Thursday",

        "Friday",

        "Saturday",

        "Sunday"

    ];

    days.forEach(day => {

        const todaysEvents =

            planner.schedule.filter(

                event =>

                    event.day === day

            );

        if (todaysEvents.length === 0)

            return;

        const heading =

            document.createElement(

                "h3"

            );

        heading.textContent = day;

        container.appendChild(

            heading

        );

        todaysEvents.forEach(event => {

            const item =

                document.createElement(

                    "div"

                );

            item.className =

                "planner-item";

            item.innerHTML =

            `

           item.innerHTML = `

<div class="planner-event">

    <div class="planner-time">

        ${event.time}

    </div>

    <div class="planner-title">

        ${event.title}

    </div>

    <div class="planner-location">

        📍 ${event.location}

    </div>

    <div class="planner-description">

        ${event.description || ""}

    </div>

    <div class="planner-links">

        ${event.website
            ? `<a href="${event.website}" target="_blank">Website</a>`
            : ""}

        ${event.ticketLink
            ? `<a href="${event.ticketLink}" target="_blank">Tickets</a>`
            : ""}

        ${event.googleMaps
            ? `<a href="${event.googleMaps}" target="_blank">Map</a>`
            : ""}

    </div>

    <button

        class="planner-remove"

        data-id="${event.id}"

    >

        Remove

    </button>

</div>

`;

                <button

                    class="planner-remove"

                    data-id="${event.id}"

                >

                    Remove

                </button>

            </div>

            `;

            container.appendChild(

                item

            );

        });

    });

    const removeButtons =

        container.querySelectorAll(

            ".planner-remove"

        );

    removeButtons.forEach(button => {

        button.addEventListener(

            "click",

            () => {

                planner.schedule =

                    planner.schedule.filter(

                        event =>

                            event.id !==

                            button.dataset.id

                    );

                savePlanner();

                updatePlannerCounter();

                renderPlanner();

                displayEvents();

            }

        );

    });

}// ======================================================
// UTILITY FUNCTIONS
// ======================================================

function getScheduledEvents() {

    return planner.schedule;

}



function getFavoriteEvents() {

    return planner.favorites;

}



function getCompletedEvents() {

    return planner.completed;

}



function clearFavorites() {

    planner.favorites = [];

    savePlanner();

    displayEvents();

}



function clearCompleted() {

    planner.completed = [];

    savePlanner();

    displayEvents();

}



// ======================================================
// OPTIONAL SORT HELPERS
// ======================================================

function sortEventsByTime(eventsToSort) {

    return eventsToSort.sort((a, b) => {

        return (a.time || "").localeCompare(

            b.time || ""

        );

    });

}



// ======================================================
// REFRESH APPLICATION
// ======================================================

function refreshApplication() {

    updatePlannerCounter();

    renderPlanner();

    displayEvents();

}



// ======================================================
// WINDOW FOCUS
// ======================================================

window.addEventListener(

    "focus",

    () => {

        loadPlanner();

        refreshApplication();

    }

);



// ======================================================
// STORAGE SYNC
// ======================================================

window.addEventListener(

    "storage",

    event => {

        if (

            event.key !== STORAGE_KEY

        ) return;

        loadPlanner();

        refreshApplication();

    }

);



// ======================================================
// PUBLIC HELPERS
// ======================================================

window.sdccPlanner = {

    refresh: refreshApplication,

    schedule() {

        return planner.schedule;

    },

    favorites() {

        return planner.favorites;

    },

    completed() {

        return planner.completed;

    },

    reload: async function () {

        await loadEvents(currentDay);

        refreshApplication();

    }

};



// ======================================================
// END OF FILE
// ======================================================
