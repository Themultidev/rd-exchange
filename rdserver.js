const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');


dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());


const sheetId = process.env.GOOGLE_SHEET_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'); 


const auth = new google.auth.JWT(
  clientEmail,
  null,
  privateKey,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });


async function appendTradeData(tradeData) {
  const request = {
    spreadsheetId: sheetId,
    range: 'Sheet1!A:E', 
    valueInputOption: 'USER_ENTERED', 
    resource: {
      values: [tradeData], 
    },
  };

  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log(`${response.data.updates.updatedCells} cells appended.`);
  } catch (err) {
    console.error('Error appending data to sheet:', err);
  }
}


app.post('/send-trade', async (req, res) => {
  const { buyorsell, amount, crypto, wallet, email } = req.body;

  
  await appendTradeData([buyorsell, amount, crypto, wallet, email]);

  res.json({
    message: 'Trade details have been saved and sent for processing you will receive an email shortly.',
  });
});


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
