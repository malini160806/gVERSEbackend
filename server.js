require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();


app.use(cors({
  origin: "*", 
}));

app.use(express.json());


const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;


app.post("/students", async (req, res) => {
  try {
    const { name, degree,dept, regno,mobile, email, address, feedback } = req.body;

    if (!name || !degree || !dept || !regno || !mobile || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Students!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            name,
            degree,
            dept,
            regno,
            "Final Year",
            mobile,
            email,
            address || "",
            feedback || "",
            new Date().toLocaleString("en-IN"),
          ],
        ],
      },
    });

    res.json({ success: true, message: "Student saved successfully" });

  } catch (error) {
    console.error("Student Error:", error);
    res.status(500).json({ error: "Error saving student" });
  }
});


// app.post("/alumni", async (req, res) => {
//   try {
//     const { name, batch, dept, company, role, mobile, email, feedback } = req.body;

//     if (!name || !batch || !dept || !mobile || !email) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: client });

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SPREADSHEET_ID,
//       range: "Alumni!A:I",
//       valueInputOption: "USER_ENTERED",
//       requestBody: {
//         values: [
//           [
//             name,
//             batch,
//             dept,
//             company || "",
//             role || "",
//             mobile,
//             email,
//             feedback || "",
//             new Date().toLocaleString("en-IN"),
//           ],
//         ],
//       },
//     });

//     res.json({ success: true, message: "Alumni saved successfully" });

//   } catch (error) {
//     console.error("Alumni Error:", error);
//     res.status(500).json({ error: "Error saving alumni" });
//   }
// });


app.get("/", (req, res) => {
  res.send("🚀 Google Sheets Backend Running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});