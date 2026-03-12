// backend/server.js – ONLY server-side code

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());              // for JSON from final submit
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));  // serve HTML/CSS/JS from parent folder

// POST /save-answer – saves to TXT in one line per submission
app.post('/save-answer', (req, res) => {
  const answers = req.body || {};

  // Remove nextPage if it leaked from previous pages
  delete answers.nextPage;

  const record = {
    cas: new Date().toISOString(),
    ...answers
  };

  const txtPath = path.join(__dirname, 'quiz_vysledky.txt');

  // Fixed order of questions
  const allQuestions = [
    'u1', 'u2', 'u3',
    'q1','q2','q3','q4','q5','q6','q7','q8','q9','q10',
    'q11','q12','q13','q14','q15','q16','q17','q18','q19','q20',
    'q21','q22','q23','q24','q25','q26','q27','q28','q29','q30',
    'q31','q32','q33','q34','q35','q36','q37','q38','q39','q40',
    'q41','q42','q43','q44','q45','q46','q47','q48','q49','q50',
    'q51','q52','q53','q54','q55','q56', 'q57','q58','q59',
    'odpoved1','odpoved2','odpoved3','odpoved4','odpoved5','odpoved6','odpoved7','odpoved8','odpoved9','odpoved10',
    'odpoved11','odpoved12','odpoved13','odpoved14','odpoved15','odpoved16','odpoved17','odpoved18','odpoved19','odpoved20',
    'odpoved21','odpoved22','odpoved23','odpoved24','odpoved25','odpoved26','odpoved27','odpoved28','odpoved29','odpoved30',
    'odpoved31','odpoved32','odpoved33','odpoved34','odpoved35'
  ];

  // Build one line: timestamp,q1:value,q2:value,...
  let line = record.cas;
  allQuestions.forEach(q => {
    const val = answers[q] ?? '-'; // unanswered = '-'
    line += `,${q}:${val}`;
  });
  line += '\n';

  fs.appendFile(txtPath, line, (err) => {
    if (err) {
      console.error('Chyba zápisu TXT:', err);
      return res.status(500).json({ error: 'Chyba serveru' });
    }

    console.log('Uloženo:', record.cas);
    res.json({ success: true });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../stranky/dotaznik/1stranka.html'));
});

app.listen(PORT, () => {
  console.log(`Server běží → http://localhost:${PORT}`);
  console.log('Otevřete např.: http://localhost:3000/stranky/dotaznik/1stranka.html');
});