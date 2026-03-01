const carousels = {
  'חזה': document.getElementById('carousel-1'),
  'רגליים': document.getElementById('carousel-2'),
  'גב': document.getElementById('carousel-3'),
  'יד קדמית ואחורית': document.getElementById('carousel-4'),
  'כתפיים': document.getElementById('carousel-5'),
  'בטן': document.getElementById('carousel-6')
};

const title = document.getElementById("exerciseTitle");
const instructionsEl = document.getElementById("exerciseInstructions");
const mistakesEl = document.getElementById("exerciseMistakes");
const frame = document.getElementById("exerciseFrame");
const exerciseDetails = document.getElementById("exerciseDetails");

// elements for view switching
const menu = document.getElementById('menu');
const showExercisesBtn = document.getElementById('showExercises');
const showGymMapBtn = document.getElementById('showGymMap');
const exerciseView = document.getElementById('exerciseView');
const mapView = document.getElementById('mapView');
const gymMapFrame = document.getElementById('gymMapFrame');

// back buttons inside the views
const backExercises = document.getElementById('backFromExercises');
const backMap = document.getElementById('backFromMap');
const backFromCarousel = document.getElementById('backFromCarousel');

let currentId = null;
let activeCarouselCategory = null;
let exercisesByCategory = {};

function renderExercisesByCategory(exercises) {
  // clear and organize exercises by category
  Object.keys(carousels).forEach(cat => {
    carousels[cat].innerHTML = "";
    exercisesByCategory[cat] = [];
  });

  // group exercises
  exercises.forEach(ex => {
    if (!ex || typeof ex.id === "undefined" || !ex.name || !ex.link || !ex.category) {
      console.warn("Skipping invalid exercise entry:", ex);
      return;
    }
    if (!exercisesByCategory[ex.category]) {
      exercisesByCategory[ex.category] = [];
    }
    exercisesByCategory[ex.category].push(ex);
  });

  // render each category carousel
  Object.keys(exercisesByCategory).forEach(category => {
    const categoryExercises = exercisesByCategory[category];
    const carousel = carousels[category];

    categoryExercises.forEach(ex => {
      const card = document.createElement("div");
      card.className = "card";
      card.textContent = ex.name;
      card.dataset.exerciseId = ex.id;

      card.addEventListener("click", () => {
        onCardClick(ex, category);
      });

      carousel.appendChild(card);
    });
  });
}

function onCardClick(exercise, category) {
  if (currentId === exercise.id) return;
  currentId = exercise.id;

  // hide all other carousels, show only this one
  Object.keys(carousels).forEach(cat => {
    if (cat === category) {
      carousels[cat].classList.remove('hidden-carousel');
      carousels[cat].classList.add('active-carousel');
    } else {
      carousels[cat].classList.add('hidden-carousel');
      carousels[cat].classList.remove('active-carousel');
    }
  });

  // hide carousel titles
  document.querySelectorAll('.carousel-title').forEach(title => title.style.display = 'none');

  // clear all active cards
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  // activate the clicked card
  document.querySelector(`[data-exercise-id="${exercise.id}"]`).classList.add("active");

  // update details panel and show it
  title.textContent = exercise.name;
  frame.src = exercise.link;
  setInstructions(exercise.description);
  setMistakes(exercise.mistakes);
  exerciseDetails.classList.remove('hidden');
  
  // show the back-carousel button
  const backCarouselBtn = document.getElementById('backFromCarousel');
  if (backCarouselBtn) {
    backCarouselBtn.style.display = 'block';
  }
}

function showAllCarousels() {
  // show all carousels
  Object.keys(carousels).forEach(cat => {
    carousels[cat].classList.remove('hidden-carousel');
    carousels[cat].classList.remove('active-carousel');
    carousels[cat].querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  });
  
  // show carousel titles
  document.querySelectorAll('.carousel-title').forEach(title => title.style.display = 'block');
  
  // hide the details panel
  exerciseDetails.classList.add('hidden');
  
  // hide the back-carousel button
  const backCarouselBtn = document.getElementById('backFromCarousel');
  if (backCarouselBtn) {
    backCarouselBtn.style.display = 'none';
  }
  
  currentId = null;
  activeCarouselCategory = null;
  
  // clear details
  title.textContent = 'בחר תרגיל';
  frame.src = '';
  instructionsEl.innerHTML = '';
  mistakesEl.innerHTML = '';
}

function showCarousel(category) {
  // hide all carousels
  Object.keys(carousels).forEach(cat => {
    carousels[cat].classList.remove('active-carousel');
  });
  // show only the requested one
  if (carousels[category]) {
    carousels[category].classList.add('active-carousel');
    activeCarouselCategory = category;
  }
}

function hideAllCarousels() {
  Object.keys(carousels).forEach(cat => {
    carousels[cat].classList.remove('active-carousel');
    carousels[cat].querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  });
  activeCarouselCategory = null;
  currentId = null;
}


// Try to load exercises from data/exercises.json.
// Note: when opening via file:// the fetch may be blocked; serve via HTTP for correct behavior.
fetch('data/exercises.json')
  .then(resp => {
    if (!resp.ok) throw new Error('Network response was not ok: ' + resp.status);
    return resp.json();
  })
  .then(raw => {
    // expect object with categories as keys
    if (Array.isArray(raw)) {
      throw new Error('old format detected; expected object keyed by category');
    }
    const normalized = [];
    let nextId = 1;
    for (const [category, items] of Object.entries(raw)) {
      if (!Array.isArray(items)) continue;
      items.forEach(item => {
        normalized.push({
          id: nextId++,
          category,
          name: item.name || `תרגיל ${nextId}`,
          description: item.description || (Array.isArray(item.details) ? item.details : (item.details ? [item.details] : [])),
          link: item.link || item.url || '',
          mistakes: item.mistakes || item.errors || []
        });
      });
    }
    renderExercisesByCategory(normalized);
  })
  .catch(err => {
    console.error('Failed to load data/exercises.json:', err);
    // Fallback: small built-in default list (keeps the app usable)
    const fallback = [
      { id: 1, category: 'חזה', name: 'לחיצת חזה (Dumbbell Bench Press)', description: '', link: 'https://drive.google.com/file/d/FILE_ID_1/preview', mistakes: [] },
      { id: 2, category: 'חזה', name: 'בנץ\' פרס', description: 'חיזוק חזה ויד אחורית.', link: 'https://drive.google.com/file/d/FILE_ID_2/preview', mistakes: ['הנחת כפות ידיים לא נכונה','משיכה חדה']},
      { id: 3, category: 'רגליים', name: 'סקוואט', description: 'תרגיל רגליים בסיסי', link: 'https://drive.google.com/file/d/FILE_ID_3/preview', mistakes: [] }
    ];
    renderExercisesByCategory(fallback);
  });

// --- helper functions for rendering instruction & mistakes content ---
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setInstructions(desc) {
  if (Array.isArray(desc)) {
    instructionsEl.innerHTML = desc.map(s => `<p>${escapeHtml(s)}</p>`).join('');
  } else {
    instructionsEl.innerHTML = `<p>${escapeHtml(desc || '')}</p>`;
  }
}

function setMistakes(mist) {
  if (!mist || (Array.isArray(mist) && mist.length === 0) || (typeof mist === 'string' && !mist.trim())) {
    mistakesEl.innerHTML = '<p class="muted">אין טעויות נפוצות רשומות</p>';
    return;
  }

  if (Array.isArray(mist)) {
    mistakesEl.innerHTML = '<ul>' + mist.map(m => `<li>${escapeHtml(m)}</li>`).join('') + '</ul>';
    return;
  }

  // string: try to split by newline or comma
  const items = String(mist).split(/\r?\n|,\s*/).map(s => s.trim()).filter(Boolean);
  if (items.length > 1) {
    mistakesEl.innerHTML = '<ul>' + items.map(m => `<li>${escapeHtml(m)}</li>`).join('') + '</ul>';
  } else {
    mistakesEl.innerHTML = `<p>${escapeHtml(String(mist))}</p>`;
  }
}

// ------ view switching logic ------------------------------------------------

function showSection(section) {
  // hide everything first
  menu.classList.add('hidden');
  exerciseView.classList.add('hidden');
  mapView.classList.add('hidden');

  if (section === 'exercises') {
    exerciseView.classList.remove('hidden');
  } else if (section === 'map') {
    mapView.classList.remove('hidden');
    // optional: set the iframe src if not already set or dynamic
    //gymMapFrame.src = gymMapFrame.src || 'https://my.treedis.com/tour/547d8aec';
  } else {
    // default/unknown -> show main menu again
    menu.classList.remove('hidden');
  }
}

// wire up menu buttons
showExercisesBtn.addEventListener('click', () => showSection('exercises'));
showGymMapBtn.addEventListener('click', () => showSection('map'));

backExercises.addEventListener('click', () => {
  hideAllCarousels();
  showSection();
});
backMap.addEventListener('click', () => showSection());
backFromCarousel.addEventListener('click', () => showAllCarousels());

// initial state: show the menu only
showSection();