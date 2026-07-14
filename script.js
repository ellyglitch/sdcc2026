// ======================================================
// SDCC OFF-SITES PLANNER
// Version 2.0
// By Elly Glitch
// ======================================================



// ======================================================
// CONFIGURATION
// ======================================================

const DAY_FILES = {

    Tuesday: "events/tuesday.json",
        
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

    Show: "#E24848",

};



const STORAGE_KEY = "sdccPlanner";



// ======================================================
// APPLICATION STATE
// ======================================================

let events = [];

let allEvents = [];

let currentDay = "All";

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
        if (

    planner.schedule.length > 0 &&

    typeof planner.schedule[0] === "object"

) {

    planner.schedule =

        planner.schedule.map(

            event => event.id

        );

    savePlanner();

}

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

    return planner.schedule.includes(id);

}

function isFavorite(id) {

    return planner.favorites.includes(id);

}

function isCompleted(id) {

    return planner.completed.includes(id);

}

function toggleSchedule(event) {

    if (planner.schedule.includes(event.id)) {

        planner.schedule = planner.schedule.filter(

            id => id !== event.id

        );

    }

    else {

        planner.schedule.push(event.id);

    }

    savePlanner();

}

function toggleFavorite(id) {

    if (planner.favorites.includes(id)) {

        planner.favorites = planner.favorites.filter(

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

        planner.completed = planner.completed.filter(

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

            const response = await fetch(file);

            if (!response.ok) {

                throw new Error(`Failed to load ${file}`);

            }

            const text = await response.text();

            const data = JSON.parse(text);

            json.push(data);

        }

        allEvents = json.flat();

        const dayOrder = {

            Tuesday: 0,

            Wednesday: 1,

            Thursday: 2,

            Friday: 3,

            Saturday: 4,

            Sunday: 5

        };



        // ==============================
        // PLANNER
        // ==============================

        if (day === "Planner") {

            events = planner.schedule

                .map(id =>

                    allEvents.find(event => event.id === id)

                )

                .filter(Boolean);

            events.sort((a, b) => {

                const dayDifference =

                    (dayOrder[a.day] ?? 999) -

                    (dayOrder[b.day] ?? 999);

                if (dayDifference !== 0) {

                    return dayDifference;

                }

                return convertTime(a.time) -

                    convertTime(b.time);

            });

        }



        // ==============================
        // ALL EVENTS
        // ==============================

        else if (day === "All") {

            events = [...allEvents];

            events.sort((a, b) => {

                const dayDifference =

                    (dayOrder[a.day] ?? 999) -

                    (dayOrder[b.day] ?? 999);

                if (dayDifference !== 0) {

                    return dayDifference;

                }

                return convertTime(a.time) -

                    convertTime(b.time);

            });

        }



        // ==============================
        // SINGLE DAY
        // ==============================

        else {

            events = allEvents.filter(

                event => event.day === day

            );

            events.sort((a, b) =>

                convertTime(a.time) -

                convertTime(b.time)

            );

        }

    }

    catch (error) {

        console.error(

            "Failed loading events:",

            error

        );

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

        updatePlannerCounter();

        initializeDayButtons();

        initializeCategoryButtons();

        initializeSearch();

        initializePlanner();

    }
);

// ======================================================
// CONVERT TIME TO MINUTES (FOR SORTING)
// ======================================================

function convertTime(time) {

    if (!time) {

        return 999999;

    }

    if (

        time === "TBA" ||

        time === "Assigned" ||

        time === "Ticketed"

    ) {

        return 999999;

    }

    const match = time
        .trim()
        .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) {

        return 999999;

    }

    let hours = parseInt(match[1], 10);

    const minutes = parseInt(match[2], 10);

    const period = match[3].toUpperCase();

    if (period === "AM" && hours === 12) {

        hours = 0;

    }

    if (period === "PM" && hours !== 12) {

        hours += 12;

    }

    return (hours * 60) + minutes;

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

    const container = document.getElementById("events");
    
    const plannerControls =
    document.getElementById("planner-controls");

if (plannerControls) {

    plannerControls.style.display =
        currentDay === "Planner"
            ? "flex"
            : "none";

}

    container.innerHTML = "";

   const sourceEvents =

    searchText.trim() === ""

        ? events

        : allEvents;

    const filteredEvents =

        sourceEvents

            .filter(event => {

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

                    activeFilters.length === 0 ||

                    activeFilters.some(filter => {

                        if (filter === "Party & Events") {

                            return (

                                event.category === "Party" ||

                                event.category === "Event"

                            );

                        }

                        return filter === event.category;

                    });

                return (

                    matchesSearch &&

                    matchesCategory

                );

            });

    // Sort planner by day first, then by time.
    // Sort individual day pages by time only.

const dayOrder = {

    Tuesday: 0,
    Wednesday: 1,
    Thursday: 2,
    Friday: 3,
    Saturday: 4,
    Sunday: 5

};

if (currentDay === "Planner" || currentDay === "All") {

    filteredEvents.sort((a, b) => {

        const dayDifference =

            (dayOrder[a.day] ?? 999) -

            (dayOrder[b.day] ?? 999);

        if (dayDifference !== 0) {

            return dayDifference;

        }

        return convertTime(a.time) -

               convertTime(b.time);

    });

} else {

    filteredEvents.sort((a, b) =>

        convertTime(a.time) -

        convertTime(b.time)

    );

}

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

    let currentHeading = "";

    const dayDates = {

        Tuesday: "July 21",

        Wednesday: "July 22",

        Thursday: "July 23",

        Friday: "July 24",

        Saturday: "July 25",

        Sunday: "July 26"

    };

    filteredEvents.forEach((event, index) => {

        // Planner day headings

       if (

    (currentDay === "Planner" ||

     currentDay === "All") &&

    event.day !== currentHeading

) {

            currentHeading = event.day;

            const heading = document.createElement("div");

            heading.className = "planner-day-heading";

            heading.innerHTML = `

                <h2>

                    📅 ${event.day} • ${dayDates[event.day]}

                </h2>

            `;

            container.appendChild(heading);

        }

        // Event card

        const card = createEventCard(event);

        container.appendChild(card);

        // Ads only on day pages

        if (

    currentDay !== "Planner" &&

    currentDay !== "All" &&

    (index + 1) % 12 === 0

) {

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

                refreshApplication();

                return;

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

    const exportButton =
        document.getElementById("export-calendar");

    if (clearButton) {

        clearButton.addEventListener("click", () => {

            if (!confirm("Clear your entire schedule?"))
                return;

            planner.schedule = [];

            savePlanner();

            if (currentDay === "Planner") {

                events = [];

            }

            displayEvents();

            updatePlannerCounter();

        });

    }

    if (exportButton) {

        exportButton.addEventListener(

            "click",

            exportPlannerToICS

        );

    }

}

// ======================================================
// EXPORT PLANNER (.ICS)
// ======================================================

function exportPlannerToICS() {

    const scheduledEvents = planner.schedule

        .map(id =>

            allEvents.find(event => event.id === id)

        )

        .filter(Boolean);

    if (scheduledEvents.length === 0) {

        alert("Your schedule is empty.");

        return;

    }

    const dayMap = {

        Tuesday: "20260721",

        Wednesday: "20260722",

        Thursday: "20260723",

        Friday: "20260724",

        Saturday: "20260725",

        Sunday: "20260726"

    };

    let ics = [

        "BEGIN:VCALENDAR",

        "VERSION:2.0",

        "PRODID:-//SDCC Off-Sites//Planner//EN"

    ];

    scheduledEvents.forEach(event => {

        const date = dayMap[event.day];

        if (!date) return;

        let start = "090000";
        let end = "100000";

        if (event.time) {

            const match = event.time.match(

                /(\d{1,2}):(\d{2})\s*(AM|PM)/i

            );

            if (match) {

                let hour = parseInt(match[1]);

                const minute = match[2];

                const period = match[3].toUpperCase();

                if (period === "PM" && hour !== 12)

                    hour += 12;

                if (period === "AM" && hour === 12)

                    hour = 0;

                start =

                    `${String(hour).padStart(2,"0")}${minute}00`;

                const endHour =

                    hour + 1;

                end =

                    `${String(endHour).padStart(2,"0")}${minute}00`;

            }

        }

        ics.push(

            "BEGIN:VEVENT",

            `UID:${event.id}@sdccoffsites.com`,

            `DTSTAMP:${date}T000000Z`,

            `DTSTART:${date}T${start}`,

            `DTEND:${date}T${end}`,

            `SUMMARY:${event.title}`,

            `LOCATION:${event.address || event.location || ""}`,

            `DESCRIPTION:${(event.description || "").replace(/\n/g," ")}`,

            event.website

                ? `URL:${event.website}`

                : "",

            "END:VEVENT"

        );

    });

    ics.push("END:VCALENDAR");

    const blob = new Blob(

        [ics.filter(Boolean).join("\r\n")],

        {

            type: "text/calendar"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "SDCC-OffSites-2026.ics";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

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

    return planner.schedule

        .map(id =>

            allEvents.find(event => event.id === id)

        )

        .filter(Boolean);

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
    Tuesday: 0,
    Wednesday: 1,
    Thursday: 2,
    Friday: 3,
    Saturday: 4,
    Sunday: 5
};

    events = planner.schedule

    .map(id =>

        allEvents.find(event => event.id === id)

    )

    .filter(Boolean);

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
