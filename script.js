/* Διακριτικές αλληλεπιδράσεις χωρίς βιβλιοθήκες — λειτουργεί στο GitHub Pages. */
document.documentElement.classList.add('js');

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Κινητό: προσβάσιμο μενού που κλείνει με Escape, έξω click ή επιλογή.
const menuButton = $('.menu-toggle');
const navigation = $('.site-nav');
function setMenu(open) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
  navigation.classList.toggle('is-open', open);
  menuButton.querySelector('use')?.setAttribute('href', open ? '#icon-x' : '#icon-menu');
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
$$('.site-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', event => {
  if (navigation?.classList.contains('is-open') && !event.target.closest('.header-inner')) setMenu(false);
});

// Εναλλαγή dark/light με αποθήκευση επιλογής στον συγκεκριμένο browser.
const THEME_KEY = 'christos-portfolio-theme-v4';
const themeButton = $('.theme-toggle');
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
} catch { /* π.χ. browser που δεν επιτρέπει τοπική αποθήκευση */ }
function updateThemeLabel() {
  const light = document.documentElement.dataset.theme === 'light';
  themeButton?.setAttribute('aria-label', light ? 'Ενεργοποίηση σκοτεινής εμφάνισης' : 'Ενεργοποίηση φωτεινής εμφάνισης');
}
updateThemeLabel();
themeButton?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  updateThemeLabel();
});

// Κανονικοποίηση ελληνικών / λατινικών: δεν χρειάζονται τόνοι στην αναζήτηση.
const normalize = text => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('el-GR').trim();
const projectCards = $$('.project-card');
const filterButtons = $$('.filter-chip');
const searchInput = $('#project-search');
const countText = $('#result-count');
const emptyMessage = $('#no-results');
let activeFilter = 'all';
function updateProjects() {
  const query = normalize(searchInput?.value);
  let shown = 0;
  for (const card of projectCards) {
    const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
    const textMatch = !query || normalize(card.dataset.search).includes(query);
    card.hidden = !(categoryMatch && textMatch);
    if (!card.hidden) shown += 1;
  }
  if (countText) countText.textContent = `Εμφανίζονται ${shown} από ${projectCards.length} έργα`;
  if (emptyMessage) emptyMessage.hidden = shown !== 0;
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => {
    const selected = item === button;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  updateProjects();
}));
searchInput?.addEventListener('input', updateProjects);
$('#clear-filters')?.addEventListener('click', () => {
  searchInput.value = '';
  filterButtons.find(button => button.dataset.filter === 'all')?.click();
  searchInput.focus();
});
// '/' και Ctrl/Cmd+K για αναζήτηση. Escape για καθαρισμό.
document.addEventListener('keydown', event => {
  const typing = event.target.matches('input,textarea,[contenteditable="true"]');
  if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
    event.preventDefault();
    searchInput?.focus();
    searchInput?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  if (event.key === 'Escape') {
    setMenu(false);
    if (document.activeElement === searchInput) {
      if (searchInput.value) { searchInput.value = ''; updateProjects(); }
      else searchInput.blur();
    }
  }
});
updateProjects();

// Ήπια reveal animations, με σεβασμό σε reduced motion.
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: .08, rootMargin: '0px 0px 35px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else revealItems.forEach(item => item.classList.add('is-visible'));

// Γραμμή προόδου ανάγνωσης και ήπια αλλαγή χρώματος του header.
const header = $('#site-header');
const progressBar = $('#scroll-progress-bar');
let scrollQueued = false;
function handleScroll() {
  const top = window.scrollY || 0;
  header?.classList.toggle('is-scrolled', top > 12);
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.transform = `scaleX(${available > 0 ? Math.min(1, top / available) : 0})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { requestAnimationFrame(handleScroll); scrollQueued = true; }
}, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });
handleScroll();

// Δείκτης ενεργής ενότητας στην πλοήγηση.
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      $$('.site-nav a').forEach(link => link.classList.toggle('is-current', link.getAttribute('href') === `#${entry.target.id}`));
    }
  }, { rootMargin: '-24% 0px -60% 0px', threshold: 0 });
  $$('main section[id]').forEach(section => navObserver.observe(section));
}

// Μικρή αντίδραση του γραφικού στο ποντίκι, μόνο σε μεγάλες οθόνες.
const heroArt = $('.hero-art');
const canFollowMouse = window.matchMedia('(pointer: fine) and (min-width: 850px) and (prefers-reduced-motion: no-preference)').matches;
if (heroArt && canFollowMouse) {
  heroArt.addEventListener('pointermove', event => {
    const rect = heroArt.getBoundingClientRect();
    heroArt.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width - .5) * 9}px`);
    heroArt.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height - .5) * 9}px`);
  });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--mx', '0px'); heroArt.style.setProperty('--my', '0px');
  });
}

// Αντιγραφή email με οπτική ένδειξη, όπου υποστηρίζεται.
const copyButton = $('.copy-email');
const copyFeedback = $('#copy-feedback');
copyButton?.addEventListener('click', async () => {
  const email = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.classList.add('is-copied');
    if (copyFeedback) copyFeedback.textContent = 'Το email αντιγράφηκε.';
  } catch {
    if (copyFeedback) copyFeedback.textContent = 'Η αντιγραφή δεν υποστηρίζεται εδώ. Μπορείς να επιλέξεις το email παραπάνω.';
  }
});

const year = $('#current-year');
if (year) year.textContent = new Date().getFullYear();
