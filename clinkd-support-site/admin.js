const config = window.CLINKD_CONFIG || {};
const supabaseClient = window.supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const ticketsPanel = document.getElementById("ticketsPanel");
const ticketsEl = document.getElementById("tickets");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const statusFilter = document.getElementById("statusFilter");

function setLoginStatus(message, type = "") {
  loginStatus.textContent = message;
  loginStatus.className = `status ${type}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replyLink(ticket) {
  const subject = encodeURIComponent("Clinkd support");
  const body = encodeURIComponent(
    `Hey,\n\nThanks for reaching out about Clinkd.\n\n\n\n---\nOriginal message:\n${ticket.message}`
  );

  return `mailto:${encodeURIComponent(ticket.email)}?subject=${subject}&body=${body}`;
}

async function showAdmin() {
  loginForm.classList.add("hidden");
  ticketsPanel.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  await loadTickets();
}

async function showLogin() {
  loginForm.classList.remove("hidden");
  ticketsPanel.classList.add("hidden");
  logoutBtn.classList.add("hidden");
}

async function loadTickets() {
  ticketsEl.innerHTML = "<p>Loading tickets...</p>";

  let query = supabaseClient
    .from("tickets")
    .select("id,email,message,status,created_at")
    .order("created_at", { ascending: false });

  if (statusFilter.value !== "all") {
    query = query.eq("status", statusFilter.value);
  }

  const { data, error } = await query;

  if (error) {
    ticketsEl.innerHTML = `<p class="status error">Could not load tickets: ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data.length) {
    ticketsEl.innerHTML = "<p>No tickets here.</p>";
    return;
  }

  ticketsEl.innerHTML = data.map((ticket) => {
    const created = new Date(ticket.created_at).toLocaleString();
    const buttonText = ticket.status === "closed" ? "Reopen" : "Mark closed";
    const nextStatus = ticket.status === "closed" ? "open" : "closed";

    return `
      <article class="ticket">
        <div class="ticket-header">
          <div>
            <div class="ticket-email">${escapeHtml(ticket.email)}</div>
            <div class="ticket-date">${escapeHtml(created)}</div>
          </div>
          <div class="ticket-status">${escapeHtml(ticket.status)}</div>
        </div>

        <div class="ticket-message">${escapeHtml(ticket.message)}</div>

        <div class="ticket-actions">
          <a href="${replyLink(ticket)}">Reply by email</a>
          <button class="secondary" data-ticket-id="${ticket.id}" data-next-status="${nextStatus}">
            ${buttonText}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  setLoginStatus("Logging in...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setLoginStatus("Login failed. Check the email/password.", "error");
    return;
  }

  setLoginStatus("");
  await showAdmin();
});

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  await showLogin();
});

refreshBtn.addEventListener("click", loadTickets);
statusFilter.addEventListener("change", loadTickets);

ticketsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-ticket-id]");
  if (!button) return;

  button.disabled = true;

  const id = button.dataset.ticketId;
  const status = button.dataset.nextStatus;

  const { error } = await supabaseClient
    .from("tickets")
    .update({ status })
    .eq("id", id);

  if (error) {
    alert(`Could not update ticket: ${error.message}`);
    button.disabled = false;
    return;
  }

  await loadTickets();
});

supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    showAdmin();
  } else {
    showLogin();
  }
});
