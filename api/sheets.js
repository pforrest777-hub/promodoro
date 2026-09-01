const { google } = require('googleapis');

const HEADERS = ['id','date','category','title','duration','completed','createdAt','updatedAt','note','actualMinutes','pomodoros','lastPomodoroAt'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function credentials() {
  const clientEmail = String(process.env.GOOGLE_CLIENT_EMAIL || '').trim();
  const privateKey = String(process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  if (clientEmail && privateKey) return { client_email: clientEmail, private_key: privateKey };
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return {
    client_email: '',
    private_key: ''
  };
}

async function sheetsClient() {
  const auth = new google.auth.JWT({ ...credentials(), scopes: SCOPES });
  return google.sheets({ version: 'v4', auth });
}

function normalizeDate(value) {
  if (!value) return '';
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function rowToTask(row) {
  return {
    id: String(row[0] || ''),
    date: normalizeDate(row[1]),
    category: String(row[2] || 'SINH HOẠT'),
    title: String(row[3] || ''),
    duration: String(row[4] || '30m'),
    completed: row[5] === true || String(row[5]).toLowerCase() === 'true',
    createdAt: String(row[6] || ''),
    updatedAt: String(row[7] || ''),
    note: String(row[8] || ''),
    actualMinutes: Number(row[9] || 0),
    pomodoros: Number(row[10] || 0),
    lastPomodoroAt: String(row[11] || '')
  };
}

function taskToRow(task) {
  return [
    String(task.id || ''),
    normalizeDate(task.date),
    String(task.category || 'SINH HOẠT'),
    String(task.title || 'Untitled task'),
    String(task.duration || '30m'),
    task.completed === true,
    String(task.createdAt || ''),
    String(task.updatedAt || ''),
    String(task.note || ''),
    Number(task.actualMinutes || 0),
    Number(task.pomodoros || 0),
    String(task.lastPomodoroAt || '')
  ];
}

async function readRows(sheets) {
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Tasks!A1:L'
  });
  const rows = result.data.values || [];
  const header = rows[0] || [];
  const body = rows.slice(1).filter(row => row[0]);
  return { rows, header, body };
}

async function bootstrap(sheets) {
  const { body } = await readRows(sheets);
  return { tasks: body.map(rowToTask), serverTime: new Date().toISOString() };
}

async function sync(sheets, changes) {
  const source = await readRows(sheets);
  const rows = source.body.map(row => {
    const copy = row.slice();
    while (copy.length < HEADERS.length) copy.push('');
    return copy;
  });
  const byId = new Map(rows.map((row, index) => [String(row[0]), index]));

  for (const change of changes) {
    const id = String(change.id || '');
    if (!id) continue;
    if (change.type === 'delete') {
      const index = byId.get(id);
      if (index !== undefined) rows[index][0] = '';
      continue;
    }
    const old = byId.has(id) ? rowToTask(rows[byId.get(id)]) : {};
    const task = {
      ...old,
      ...(change.task || {}),
      id,
      createdAt: old.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const row = taskToRow(task);
    if (byId.has(id)) rows[byId.get(id)] = row;
    else { byId.set(id, rows.length); rows.push(row); }
  }

  const output = [HEADERS, ...rows];
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Tasks!A1:L' + output.length,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: output }
  });
  return { tasks: rows.filter(row => row[0]).map(rowToTask), serverTime: new Date().toISOString() };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const sheets = await sheetsClient();
    if (req.method === 'GET') return res.status(200).json(await bootstrap(sheets));
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      return res.status(200).json(await sync(sheets, Array.isArray(body.changes) ? body.changes : []));
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Sheet API failed', detail: error.message });
  }
};
