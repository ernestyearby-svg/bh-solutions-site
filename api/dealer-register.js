import nodemailer from "nodemailer";

export const config = {
api: {
bodyParser: false, // we’ll parse multipart ourselves minimally
},
};

function readStream(req) {
return new Promise((resolve, reject) => {
const chunks = [];
req.on("data", (c) => chunks.push(c));
req.on("end", () => resolve(Buffer.concat(chunks)));
req.on("error", reject);
});
}

// Minimal multipart parser for TEXT FIELDS only (fast + stable).
// We are intentionally not processing file binaries yet.
function parseMultipartText(req, buf) {
const ct = req.headers["content-type"] || "";
const boundaryMatch = ct.match(/boundary=([^;]+)/i);
if (!boundaryMatch) return {};
const boundary = "--" + boundaryMatch[1];

const parts = buf.toString("utf8").split(boundary).slice(1, -1);
const fields = {};

for (const part of parts) {
const nameMatch = part.match(/name="([^"]+)"/i);
if (!nameMatch) continue;
const name = nameMatch[1];

// Skip file fields
if (part.includes('filename="')) continue;

const splitIndex = part.indexOf("\r\n\r\n");
if (splitIndex === -1) continue;

const value = part.slice(splitIndex + 4).replace(/\r\n--\s*$/g, "").trim();
fields[name] = value;
}
return fields;
}

export default async function handler(req, res) {
try {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const raw = await readStream(req);
const fields = parseMultipartText(req, raw);

const required = ["businessName", "contactName", "dealerLicense", "email", "phone", "participation"];
for (const r of required) {
if (!fields[r] || String(fields[r]).trim() === "") {
return res.status(400).json({ error: `Missing required field: ${r}` });
}
}

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || "587"),
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

const to = process.env.REGISTER_TO_EMAIL;
const from = process.env.REGISTER_FROM_EMAIL || process.env.SMTP_USER;

const subject = `BH Dealer Application — ${fields.businessName} (${fields.participation})`;

const body = `
BH SOLUTIONS AUTO AUCTIONS — DEALER ACCESS APPLICATION

Dealership:
- Business Name: ${fields.businessName}
- Dealer License #: ${fields.dealerLicense}
- State: ${fields.state || ""}

Primary Contact:
- Name: ${fields.contactName}
- Email: ${fields.email}
- Phone: ${fields.phone}

Participation:
- Buying/Selling: ${fields.participation}
- Est. Monthly Volume: ${fields.monthlyVolume || ""}

Documents:
- Upload Link: ${fields.docLink || ""}

Notes:
${fields.notes || ""}

--- System ---
Submitted: ${new Date().toISOString()}
IP: ${(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString()}
`;

await transporter.sendMail({
from,
to,
subject,
text: body,
replyTo: fields.email,
});

return res.status(200).json({ ok: true });
} catch (e) {
return res.status(500).json({ error: e?.message || "Server error" });
}
}

