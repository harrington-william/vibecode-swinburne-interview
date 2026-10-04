/**
 * Google Apps Script web app that receives desk-survey responses from the
 * Next.js server and appends them as one row each to the "Survey_Data" sheet.
 *
 * Deploy: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Then copy the /exec URL into the server's APPS_SCRIPT_URL environment variable.
 *
 * Setup (Project Settings > Script Properties, only if this script is standalone):
 *   - SPREADSHEET_ID : the ID from the sheet URL
 *
 * Expected request body (JSON, POST):
 *   { "id": "uuid", "submittedAt": "ISO-8601", "answers": { "q1": "...", "q7": [...] } }
 */

const SHEET_NAME = "Data";

// Column order for the answers. Must match the question ids in app/lib/survey.ts.
const QUESTION_IDS = Array.from({ length: 15 }, (_, i) => `q${i + 1}`);

const QUESTION_HEADERS = [
  "Q1. Year of study",
  "Q2. How often use this desk",
  "Q3. Time sitting per class",
  "Q4. Comfort with current desks",
  "Q5. Difficulty maintaining position",
  "Q6. Uncomfortable body part",
  "Q7. Causes of discomfort",
  "Q8. Bending neck / hunching",
  "Q9. Ability to change position",
  "Q10. Effect on concentration",
  "Q11. Changed position due to discomfort",
  "Q12. Importance of improving desks",
  "Q13. Preferred improvements",
  "Q14. One thing to change",
  "Q15. Other suggestions",
];

const META_HEADERS = ["Received At", "Response ID", "Submitted At"];

/** Receives a survey response from the server and appends it to the sheet. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = parseBody(e);
    if (!body) return jsonResponse({ ok: false, error: "Invalid JSON" });

    const answers = body.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return jsonResponse({ ok: false, error: "Missing answers" });
    }

    const row = [
      new Date(),
      body.id || Utilities.getUuid(),
      body.submittedAt || "",
      ...QUESTION_IDS.map((id) => formatCell(answers[id])),
    ];

    // Serialise writes so concurrent submissions never interleave or overwrite headers.
    lock.waitLock(10000);
    const sheet = getSheet();
    ensureHeader(sheet);
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    // TEMPORARY (debugging): return the real error. Restore the generic message after testing.
    return jsonResponse({
      ok: false,
      error: "Could not save response",
      detail: String(err),
    });
  } finally {
    lock.releaseLock();
  }
}

/** Simple health check: open the /exec URL in a browser to confirm the deployment works. */
function doGet() {
  return jsonResponse({ ok: true, sheet: SHEET_NAME });
}

// ---------- helpers ----------

function parseBody(e) {
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return null;
  }
}

function getSheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  const ss = id
    ? SpreadsheetApp.openById(id)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found`);
  return sheet;
}

/** Writes the header row once, when the sheet is empty. */
function ensureHeader(sheet) {
  if (sheet.getLastRow() > 0) return;
  const header = [...META_HEADERS, ...QUESTION_HEADERS];
  sheet
    .getRange(1, 1, 1, header.length)
    .setValues([header])
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * Turns an answer into a sheet-safe cell value.
 * - Multi-select arrays are joined with " | ".
 * - Values starting with = + - @ are prefixed with ' so Sheets stores them as text, not formulas.
 */
function formatCell(value) {
  if (value === undefined || value === null) return "";
  const text = Array.isArray(value) ? value.join(" | ") : String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run this from the editor to test the sheet connection without going through HTTP. */
function testAppend() {
  const fake = {
    id: Utilities.getUuid(),
    submittedAt: new Date().toISOString(),
    answers: {
      q1: "Second year",
      q4: "Neutral",
      q7: ["Desk height", "Other: test"],
      q14: "Test row",
    },
  };
  const result = doPost({ postData: { contents: JSON.stringify(fake) } });
  Logger.log(result.getContent());
}
