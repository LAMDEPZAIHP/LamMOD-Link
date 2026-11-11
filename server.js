const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "links.json");

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}", "utf8");
}
function readLinks() {
  ensureDb();
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
}
function writeLinks(links) {
  ensureDb();
  const temp = DB_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(links, null, 2), "utf8");
  fs.renameSync(temp, DB_FILE);
}
function adminOnly(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: "Admin password is not configured. Set ADMIN_PASSWORD in Render environment variables." });
  }
  const supplied = req.get("x-admin-password") || "";
  if (supplied !== ADMIN_PASSWORD) return res.status(401).json({ error: "Mật khẩu quản trị không đúng." });
  next();
}
function validSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/.test(slug);
}
function validTarget(value) {
  try {
    const u = new URL(value);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch { return false; }
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "LamMOD Link" }));
app.post("/api/login", (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: "Chưa cấu hình ADMIN_PASSWORD trên Render." });
  if ((req.body && req.body.password) !== ADMIN_PASSWORD) return res.status(401).json({ error: "Mật khẩu không đúng." });
  res.json({ ok: true });
});
app.get("/api/links", adminOnly, (_req, res) => res.json(readLinks()));
app.post("/api/links", adminOnly, (req, res) => {
  const slug = String(req.body.slug || "").trim().toLowerCase();
  const target = String(req.body.target || "").trim();
  if (!validSlug(slug)) return res.status(400).json({ error: "Tên link chỉ dùng chữ thường, số và dấu gạch ngang; tối đa 30 ký tự." });
  if (!validTarget(target)) return res.status(400).json({ error: "Link đích phải là URL http:// hoặc https:// hợp lệ." });
  const links = readLinks();
  if (links[slug]) return res.status(409).json({ error: "Tên link đã tồn tại." });
  links[slug] = { target, createdAt: new Date().toISOString() };
  writeLinks(links);
  res.status(201).json({ slug, target, path: `/r/${slug}` });
});
app.delete("/api/links/:slug", adminOnly, (req, res) => {
  const slug = req.params.slug;
  const links = readLinks();
  if (!links[slug]) return res.status(404).json({ error: "Không tìm thấy link." });
  delete links[slug];
  writeLinks(links);
  res.json({ ok: true });
});

app.get("/r/:slug", (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const link = readLinks()[slug];
  if (!link) return res.status(404).sendFile(path.join(__dirname, "public", "not-found.html"));
  res.sendFile(path.join(__dirname, "public", "wait.html"));
});

app.get("/api/resolve/:slug", (req, res) => {
  const link = readLinks()[String(req.params.slug || "").toLowerCase()];
  if (!link) return res.status(404).json({ error: "Link không tồn tại." });
  res.json({ target: link.target });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`LamMOD Link running on port ${PORT}`));
