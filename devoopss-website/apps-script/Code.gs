// Dev_oopss trip planner.
// Stores trips added from the website's "Plan a trip" form in this Google Sheet,
// and their photos in a Google Drive folder. Setup steps: TRIP-PLANNER-SETUP.md.

// Change this to the passcode your group will type in the form.
const PASSCODE = "change-me";

const SHEET_NAME = "Trips";
const FOLDER_NAME = "Dev_oopss trip photos";
const HEADERS = ["Trip name", "Place", "Date", "Emoji", "Note", "Photo", "Added on"];

// Run once from the editor: creates the Trips tab and the photo folder, and asks for permission.
function setup() {
  sheet_();
  folder_();
}

// The website loads all trips from here.
function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const trips = rows.filter(r => r[0] && r[2]).map(r => ({
    title: String(r[0]),
    place: String(r[1]),
    date: r[2] instanceof Date ? Utilities.formatDate(r[2], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(r[2]).trim(),
    emoji: String(r[3] || "🧳"),
    note: String(r[4] || ""),
    photo: String(r[5] || ""),
  }));
  return json_({ ok: true, trips: trips });
}

// The website's form posts a new trip here.
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "The request couldn't be read. Try again." });
  }
  if (PASSCODE === "change-me") return json_({ ok: false, error: "The group passcode hasn't been set up yet." });
  if (String(body.passcode || "") !== PASSCODE) return json_({ ok: false, error: "Wrong passcode" });

  const title = clean_(body.title, 60);
  const place = clean_(body.place, 60);
  const note = clean_(body.note, 140);
  const emoji = clean_(body.emoji, 8) || "🧳";
  const date = String(body.date || "");
  if (!title || !place || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json_({ ok: false, error: "Fill in the trip name, place and date." });
  }

  let photo = "";
  if (body.photo) {
    const m = String(body.photo).match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
    if (!m) return json_({ ok: false, error: "The photo must be a JPG, PNG or WebP image." });
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    const file = folder_().createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), "image/" + m[1], title + "." + ext));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    photo = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1280";
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // The leading ' keeps the date as plain text so Sheets doesn't reformat it
    sheet_().appendRow([safe_(title), safe_(place), "'" + date, emoji, safe_(note), photo, new Date()]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, trip: { title: title, place: place, date: date, emoji: emoji, note: note, photo: photo } });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function folder_() {
  const found = DriveApp.getFoldersByName(FOLDER_NAME);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
}

function clean_(value, max) {
  return String(value || "").trim().slice(0, max);
}

// Stop text starting with = + - @ being run as a spreadsheet formula
function safe_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
