const STORAGE_KEY = 'quizAnswers';

// 1. Load previous answers on page load and check radios
document.addEventListener('DOMContentLoaded', () => {
  const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  // Check radios based on previous answers
  for (const [name, value] of Object.entries(previous)) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
    }
  }

  console.log('[quiz.js] Načteno z localStorage na této stránce:', previous);
});

// 2. Helper function for "Další" / "Předchozí" – save current page + navigate
function saveAndNext(nextPageUrl) {
  const form = document.getElementById('quizForm');
  if (form) {
    const formData = new FormData(form);
    const currentAnswers = Object.fromEntries(formData.entries());

    // Merge with previous answers
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const allAnswers = { ...previous, ...currentAnswers };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAnswers));

    // Debug logs – remove if not needed
    console.log('[quiz.js] Uloženo z této stránky:', currentAnswers);
    console.log('[quiz.js] Celkem v localStorage:', allAnswers);
  } else {
    console.warn('[quiz.js] Formulář id="quizForm" nebyl nalezen – odpovědi se neuložily');
  }

  // Navigate to next/previous page
  window.location.href = nextPageUrl;
}

// 3. Final submit – called from konec.html "Odeslat odpovědi" button
async function submitAnswersAndGo(nextUrl) {
  try {
    const allAnswers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (Object.keys(allAnswers).length === 0) {
      alert('Nebyly nalezeny žádné odpovědi – vyplňte prosím dotazník.');
      return;
    }

    console.log('[quiz.js] Odesílám na server:', allAnswers);

    const response = await fetch('/save-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allAnswers)
    });

    if (!response.ok) {
      throw new Error(`Chyba serveru: ${response.status}`);
    }

    // Success – clean up and redirect
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = nextUrl;

    console.log('[quiz.js] Úspěšně odesláno!');
  } catch (err) {
    console.error('[quiz.js] Chyba při odesílání:', err);
    alert('Nepodařilo se odeslat odpovědi. Zkontroluj konzoli (F12).');
  }
}