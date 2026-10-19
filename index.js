const defaultTickets = [
    { 
        title: "Cannot access VPN", 
        requester: "Alice Smith", 
        assignee: "David IT", 
        priority: "High", 
        status: "In Progress", 
        description: "Connection timeout experienced by remote employee." 
    },
    { 
        title: "Request software license", 
        requester: "Bob Jones", 
        assignee: "Helpdesk", 
        priority: "Low", 
        status: "Open", 
        description: "Need MS Office installed on new laptop." 
    }
];

const storedData = localStorage.getItem("simple_text_tickets");
let tickets = [];

if (storedData === null) {
    tickets = defaultTickets;
} else {
    tickets = JSON.parse(storedData);
}

const form = document.getElementById("ticket-form");
const tableBody = document.getElementById("ticket-table-body");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const index = document.getElementById("ticket-index").value;
    const titleInput = document.getElementById("title").value;
    const requesterInput = document.getElementById("requester").value;
    const assigneeInput = document.getElementById("assignee").value;
    const priorityInput = document.getElementById("priority").value;
    const statusInput = document.getElementById("status").value;
    const descriptionInput = document.getElementById("description").value;
    const newTicket = {
        title: titleInput,
        requester: requesterInput,
        assignee: assigneeInput,
        priority: priorityInput,
        status: statusInput,
        description: descriptionInput
    };
    if (index === "") {
        tickets.unshift(newTicket);
        alert("Ticket created successfully!");
    } else {
        tickets[index] = newTicket;
        alert("Ticket updated successfully!");
        resetForm();
    }
    form.reset();
    renderApp();
});

function renderApp() {
    tableBody.innerHTML = "";
    const searchText = document.getElementById("search-input").value.toLowerCase();
    const filterStatus = document.getElementById("filter-status").value;
    let totalCount = tickets.length;
    let openAssignedCount = 0;
    let inProgressHoldCount = 0;
    let resolvedClosedCount = 0;
    for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        if (t.status === "Open" || t.status === "Assigned") {
            openAssignedCount++;
        } else if (t.status === "In Progress" || t.status === "On Hold") {
            inProgressHoldCount++;
        } else if (t.status === "Resolved" || t.status === "Closed") {
            resolvedClosedCount++;
        }
    }

    document.getElementById("stat-total").innerText = totalCount;
    document.getElementById("stat-open").innerText = openAssignedCount;
    document.getElementById("stat-progress").innerText = inProgressHoldCount;
    document.getElementById("stat-resolved").innerText = resolvedClosedCount;
    let match_count = 0; 
    let startIndex = (currentPage - 1) * rowsPerPage;
    let displayedCount = 0;
    for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        const matchesSearch = ticket.title.toLowerCase().indexOf(searchText) !== -1 || 
                                ticket.requester.toLowerCase().indexOf(searchText) !== -1;
        let matchesFilter = true;
        if (filterStatus !== "" && ticket.status !== filterStatus) {
            matchesFilter = false;
        }

        if (matchesSearch && matchesFilter) {
            match_count++; 
            if (match_count > startIndex && displayedCount < rowsPerPage) {
                displayedCount++;
                const row = document.createElement("tr");  
                let html = "";
                html += "<td><strong>" + ticket.title + "</strong><br><small style='color:var(--text-muted);'>" + ticket.description.substring(0, 30) + "...</small></td>";
                html += "<td>" + ticket.requester + "</td>";
                html += "<td>" + (ticket.assignee ? ticket.assignee : "Unassigned") + "</td>";
                html += "<td><span class='badge " + ticket.priority + "'>" + ticket.priority + "</span></td>";
                html += "<td><span class='badge status-badge'>" + ticket.status + "</span></td>";
                
                //action buttons
                html += "<td>";
                html += "<div class='action-btns'>";
                html += "<button class='button btn-view' onclick='viewTicket(" + j + ")'>View</button>";
                html += "<button class='button' onclick='editTicket(" + j + ")'>Edit</button>";
                html += "<button class='button btn-delete' onclick='deleteTicket(" + j + ")'>Delete</button>";
                html += "</div>";
                html += "</td>";
                row.innerHTML = html;
                tableBody.appendChild(row);
            }
        }
    }

    if (match_count === 0) { 
        tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center; color: var(--text-muted);'>No tickets found.</td></tr>";
    }

    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.innerText = "Page " + currentPage;
    }

    localStorage.setItem("simple_text_tickets", JSON.stringify(tickets));
}

function viewTicket(index) {
    const t = tickets[index];
    const details = "--- TICKET DETAILS ---\n\n" +
                    "Title: " + t.title + "\n" +
                    "Requester: " + t.requester + "\n" +
                    "Assignee: " + (t.assignee ? t.assignee : "Unassigned") + "\n" +
                    "Priority: " + t.priority + "\n" +
                    "Status: " + t.status + "\n\n" +
                    "Description / Notes:\n" + t.description;
    alert(details);
}

function editTicket(index) {
    const t = tickets[index];
    document.getElementById("ticket-index").value = index;
    document.getElementById("title").value = t.title;
    document.getElementById("requester").value = t.requester;
    document.getElementById("assignee").value = t.assignee;
    document.getElementById("priority").value = t.priority;
    document.getElementById("status").value = t.status;
    document.getElementById("description").value = t.description;

    document.getElementById("form-heading").innerText = "Edit Ticket #" + (index + 1);
    document.getElementById("save-btn").innerText = "Update Ticket";
    document.getElementById("cancel-btn").style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    document.getElementById("ticket-index").value = "";
    document.getElementById("form-heading").innerText = "Create New Ticket";
    document.getElementById("save-btn").innerText = "Save Ticket";
    document.getElementById("cancel-btn").style.display = "none";
}

function deleteTicket(index) {
    if (confirm("Are you sure you want to delete this ticket?")) {
        tickets.splice(index, 1);
        renderApp();
        alert("Ticket deleted successfully.");
    }
}

let currentPage = 1;
const rowsPerPage = 5;

function nextPage() {
    if (currentPage * rowsPerPage < tickets.length) {
        currentPage++;
        renderApp();
    }
}

function prePage() {
    if (currentPage > 1) {
        currentPage--;
        renderApp();
    }
}

renderApp();