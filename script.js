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

let allEvents = [];

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

    ticketLink: event.ticketLink

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

    try {

        const files = Object.values(DAY_FILES);

const json = [];

for (const file of files) {

    console.log("Loading:", file);

    const response = await fetch(file);

    console.log(file, response.status);

   console.log("Parsing:", file);

console.log("About to parse:", file);

const text = await response.text();

console.log(text.substring(31850, 31980));

const data = JSON.parse(text);

console.log("Parsed:", file);

json.push(data);

}

allEvents = json.flat();
        
if (day === "Planner") {

    const dayOrder = {

        Wednesday: 0,

        Thursday: 1,

        Friday: 2,

        Saturday: 3,

        Sunday: 4

    };

    events = [...planner.schedule];

    events.sort((a, b) => {

        const dayDifference =
            dayOrder[a.day] - dayOrder[b.day];

        if (dayDifference !== 0) {

            return dayDifference;

        }

        return convertTime(a.time) - convertTime(b.time);

    });

}
else {

    events = allEvents.filter(
        event => event.day === day
    );

}
    }

    catch (error) {

    console.error("Failed loading events:", error);

    events = [];

    allEvents = [];

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

        displayEvents();

        initializeDayButtons();

        initializeCategoryButtons();

        initializeSearch();

        initializePlanner();

    }
);

// ======================================================
// CONVERT TIME FOR SORTING
// ======================================================

function convertTime(time) {

    if (!time) return 999999;

    if (
        time === "TBA" ||
        time === "Assigned" ||
        time === "Ticketed"
    ) {

        return 999999;

    }

    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!match) return 999999;

    let hour = parseInt(match[1]);

    const minute = parseInt(match[2]);

    const period = match[3].toUpperCase();

    if (period === "PM" && hour !== 12) {

        hour += 12;

    }

    if (period === "AM" && hour === 12) {

        hour = 0;

    }

    return hour * 60 + minute;

}
// ======================================================
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
await loadEvents(selectedDay);

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

    const sourceEvents =

    currentDay === "Planner"

        ? planner.schedule

        : (searchText.trim() === ""

            ? events

            : allEvents);

const filteredEvents =

    sourceEvents.filter(event => {

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

    filteredEvents.forEach((event, index) => {

    const card = createEventCard(event);

    container.appendChild(card);

    // Insert an ad after every 12 events
    if ((index + 1) % 12 === 0) {

        const ad = document.createElement("div");

        ad.className = "ad-container";

        ad.innerHTML = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-7148700198081170"
                 data-ad-slot="8952207573"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        `;

        container.appendChild(ad);

        (adsbygoogle = window.adsbygoogle || []).push({});

    }

});

}// ======================================================
// CREATE EVENT CARD
// ======================================================

function createEventCard(event) {

    const card = document.createElement("div");

    card.className = "event-card";

    card.style.borderLeft =
        `8px solid ${CATEGORY_COLORS[event.category] || "#777"}`;

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

    ${event.endTime ? ` - ${event.endTime}` : ""}

</div>

          <h2>

    ${event.title}

</h2>

<div class="event-day">

    📅 ${event.day}

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

          if (currentDay === "Planner") {

    const dayOrder = {

        Wednesday: 0,

        Thursday: 1,

        Friday: 2,

        Saturday: 3,

        Sunday: 4

    };

    events = [...planner.schedule];

    events.sort((a, b) => {

        const dayDifference =
            dayOrder[a.day] - dayOrder[b.day];

        if (dayDifference !== 0) {

            return dayDifference;

        }

        return convertTime(a.time) - convertTime(b.time);

    });

}

            displayEvents();
            updatePlannerCounter();

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

    const clearButton =
        document.getElementById("clear-planner");

    if (!clearButton) return;

    clearButton.addEventListener("click", () => {

        if (!confirm("Clear your entire schedule?"))
            return;

        planner.schedule = [];

        savePlanner();

        if (currentDay === "Planner") {

            events = [];

        }

        displayEvents();

    });

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

    return eventsToSort.sort((a, b) =>

        convertTime(a.time) - convertTime(b.time)

    );

}



// ======================================================
// REFRESH APPLICATION
// ======================================================

function refreshApplication() {

    if (currentDay === "Planner") {

    const dayOrder = {

        Wednesday: 0,

        Thursday: 1,

        Friday: 2,

        Saturday: 3,

        Sunday: 4

    };

    events = [...planner.schedule];

    events.sort((a, b) => {

        const dayDifference =
            dayOrder[a.day] - dayOrder[b.day];

        if (dayDifference !== 0) {

            return dayDifference;

        }

        return convertTime(a.time) - convertTime(b.time);

    });

}
updatePlannerCounter();

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
// ===========================
// Back To Top Button
// ===========================

const backToTop = document.getElementById("backToTop");

if (backToTop) {

    window.addEventListener("scroll", () => {

        backToTop.style.display =
            window.scrollY > 400 ? "block" : "none";

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}
// ======================================================
// END OF FILE
// ======================================================
