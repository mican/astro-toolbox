const { google } = require("googleapis");

module.exports = async function saveUserConsentInGoogleSpreadsheet({
  created_at,
  email,
  marketingConsentMatter,
  name,
  newsletter,
  newsletterConsentMatter
}) {
  const googleAuth = new google.auth.GoogleAuth({
    credentials: JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, "base64").toString("utf8")),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const googleSheets = google.sheets({ version: "v4", auth: googleAuth });
  const spreadsheetId = "1qpgGwA2dpHKZhf4sUpubAik46qzghCd_ZWiE5lWPEyw";

  const resource = {
    values: [
      [
        name,
        email,
        newsletter,
        newsletterConsentMatter,
        "true",
        marketingConsentMatter,
        new Date(created_at).toLocaleDateString(),
        "e-mail"
      ]
    ]
  };

  const sheetMeta = await googleSheets.spreadsheets.get({
    spreadsheetId
  });
  const sheetTitle = process.env.PUBLIC_PATH === "https://selleo.com" ? "selleo.com" : "selleo.pl";
  const sheetId = sheetMeta.data.sheets.find((s) => s.properties.title === sheetTitle).properties.sheetId;

  await googleSheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: 1,
              endIndex: 2
            },
            inheritFromBefore: true
          }
        }
      ]
    }
  });

  await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!A2:H2`,
    valueInputOption: "USER_ENTERED",
    resource
  });
};
