(function(){
const form = document.getElementById("dealerForm");
const status = document.getElementById("status");
if(!form) return;

form.addEventListener("submit", async (e) => {
e.preventDefault();
status.textContent = "Submitting…";

try{
const fd = new FormData(form);

// Prevent huge files from breaking early-stage flow
const f1 = fd.get("dealerLicenseFile");
const f2 = fd.get("resaleCertFile");
const maxBytes = 5 * 1024 * 1024; // 5MB
if (f1 && f1.size && f1.size > maxBytes) throw new Error("Dealer License file is too large (max 5MB). Use the upload link field instead.");
if (f2 && f2.size && f2.size > maxBytes) throw new Error("Resale Cert file is too large (max 5MB). Use the upload link field instead.");

const res = await fetch("/api/dealer-register", {
method: "POST",
body: fd
});

const data = await res.json().catch(() => ({}));
if(!res.ok) throw new Error(data.error || "Submission failed.");

status.textContent = "Submitted. We’ll verify and follow up shortly.";
window.location.href = "/thank-you.html";
}catch(err){
status.textContent = err.message || "Something went wrong.";
}
});
})();

