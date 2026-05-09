const config = window.CLINKD_CONFIG || {};
const supabaseClient = window.supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

const form = document.getElementById("ticketForm");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("formStatus");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!email || !message) {
    setStatus("Add your email and message first.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Sending...");

  const { error } = await supabaseClient
    .from("tickets")
    .insert({
      email,
      message,
      status: "open"
    });

  if (error) {
    setStatus("Something went wrong. Try again or email support directly.", "error");
    submitBtn.disabled = false;
    return;
  }

  form.reset();
  setStatus("Ticket sent. We’ll reply by email.", "success");
  submitBtn.disabled = false;
});
