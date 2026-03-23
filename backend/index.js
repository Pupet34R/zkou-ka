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
    'odpoved1','odpoved2','odpoved3','odpoved4','odpoved5','odpoved6','odpoved7','Eo1','Eo2','Eo3',
    'Eo4','Eo5','Eo6','EoF','Ko1','Ko2','Ko3','Ko4','Ko5','Ko6',
    'KoF','So1','So2','So3','So4','So5','So6','SoF','To1','To2',
    'To3','To4','To5','To6','ToF',
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
  res.redirect( '/stranky/dotaznik/1stranka.html');
});

app.get('/stranky/dotaznik/:page.html', (req, res) => {
  res.sendFile(path.join(__dirname, `../stranky/dotaznik/${page}.html`));
});

app.listen(PORT, () => {
  console.log(`Server běží → http://localhost:${PORT}`);
  console.log('Otevřete např.: http://localhost:3000/stranky/dotaznik/1stranka.html');
});