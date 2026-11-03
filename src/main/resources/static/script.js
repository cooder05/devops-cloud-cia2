// DOM elements
const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const eventCount = document.getElementById("eventCount");
const eventsList = document.getElementById("eventsList");

const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventDescription = document.getElementById("eventDescription");
const eventColor = document.getElementById("eventColor");

// Calendar state
const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let selectedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
);

// Load saved events from localStorage
let events = [];

try {
    events = JSON.parse(localStorage.getItem("calendarEvents")) || [];
} catch {
    events = [];
}

// Convert a Date object into YYYY-MM-DD using local time
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Save events
function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
}

// Render calendar
function renderCalendar() {
    monthYear.textContent = new Date(
        currentYear,
        currentMonth
    ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    calendarDays.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const previousMonthLastDay = new Date(
        currentYear,
        currentMonth,
        0
    ).getDate();

    // Always render six calendar rows
    for (let i = 0; i < 42; i++) {
        let date;
        let isOtherMonth = false;

        if (i < startingDay) {
            // Previous month's dates
            const day = previousMonthLastDay - startingDay + i + 1;

            date = new Date(currentYear, currentMonth - 1, day);
            isOtherMonth = true;

        } else if (i >= startingDay + totalDays) {
            // Next month's dates
            const day = i - startingDay - totalDays + 1;

            date = new Date(currentYear, currentMonth + 1, day);
            isOtherMonth = true;

        } else {
            // Current month's dates
            const day = i - startingDay + 1;

            date = new Date(currentYear, currentMonth, day);
        }

        const dateString = formatDate(date);

        const cell = document.createElement("div");
        cell.className = "day";

        if (isOtherMonth) {
            cell.classList.add("other-month");
        }

        if (dateString === formatDate(today)) {
            cell.classList.add("today");
        }

        if (dateString === formatDate(selectedDate)) {
            cell.classList.add("selected");
        }

        const number = document.createElement("span");
        number.className = "day-number";
        number.textContent = date.getDate();

        cell.appendChild(number);

        // Display event indicators
        const dayEvents = events.filter(
            event => event.date === dateString
        );

        if (dayEvents.length > 0) {
            const indicators = document.createElement("div");
            indicators.className = "event-indicators";

            dayEvents.slice(0, 4).forEach(event => {
                const dot = document.createElement("span");
                dot.className = `event-dot ${event.color}`;
                indicators.appendChild(dot);
            });

            cell.appendChild(indicators);
        }

        // Select date
        cell.addEventListener("click", () => {
            selectedDate = date;

            currentMonth = date.getMonth();
            currentYear = date.getFullYear();

            renderCalendar();
            renderEvents();
        });

        calendarDays.appendChild(cell);
    }
}

// Render events for selected date
function renderEvents() {
    const dateString = formatDate(selectedDate);

    selectedDateTitle.textContent = selectedDate.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    const dayEvents = events
        .filter(event => event.date === dateString)
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    eventCount.textContent =
        `${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`;

    eventsList.innerHTML = "";

    if (dayEvents.length === 0) {
        eventsList.innerHTML =
            '<p class="empty-message">No events for this day.</p>';

        return;
    }

    dayEvents.forEach(event => {
        const card = document.createElement("div");
        card.className = `event-card ${event.color}`;

        const title = document.createElement("h3");
        title.textContent = event.title;

        const time = document.createElement("p");
        time.className = "event-time";
        time.textContent = event.time
            ? `Time: ${event.time}`
            : "No time specified";

        card.appendChild(title);
        card.appendChild(time);

        if (event.description) {
            const description = document.createElement("p");
            description.className = "event-description";
            description.textContent = event.description;
            card.appendChild(description);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete event";

        deleteButton.addEventListener("click", () => {
            deleteEvent(event.id);
        });

        card.appendChild(deleteButton);
        eventsList.appendChild(card);
    });
}

// Add event
function addEvent(event) {
    event.preventDefault();

    const title = eventTitle.value.trim();
    const date = eventDate.value;

    if (!title || !date) {
        return;
    }

    const newEvent = {
        id: crypto.randomUUID(),
        title: title,
        date: date,
        time: eventTime.value,
        description: eventDescription.value.trim(),
        color: eventColor.value
    };

    events.push(newEvent);

    saveEvents();

    selectedDate = new Date(`${date}T00:00:00`);

    currentMonth = selectedDate.getMonth();
    currentYear = selectedDate.getFullYear();

    closeModal();

    renderCalendar();
    renderEvents();
}

// Delete event
function deleteEvent(id) {
    events = events.filter(event => event.id !== id);

    saveEvents();

    renderCalendar();
    renderEvents();
}

// Open modal
function openModal() {
    eventForm.reset();

    eventDate.value = formatDate(selectedDate);

    eventModal.classList.remove("hidden");
    eventTitle.focus();
}

// Close modal
function closeModal() {
    eventModal.classList.add("hidden");
}

// Previous month
document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    renderCalendar();
});

// Next month
document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    renderCalendar();
});

// Today button
document.getElementById("todayBtn").addEventListener("click", () => {
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    selectedDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    renderCalendar();
    renderEvents();
});

// Modal controls
document.getElementById("addEventBtn").addEventListener("click", openModal);

document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("cancelEvent").addEventListener("click", closeModal);

eventForm.addEventListener("submit", addEvent);

// Close modal when clicking outside
eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) {
        closeModal();
    }
});

// Close modal with Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// Initial rendering
renderCalendar();
renderEvents();