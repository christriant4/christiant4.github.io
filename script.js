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
  menuButton.setAttribute('aria-label', currentLanguage === 'en' ? (open ? 'Close menu' : 'Open menu') : (open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'));
  navigation.classList.toggle('is-open', open);
  menuButton.querySelector('use')?.setAttribute('href', open ? '#icon-x' : '#icon-menu');
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
$$('.site-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', event => {
  if (navigation?.classList.contains('is-open') && !event.target.closest('.header-inner')) setMenu(false);
});

// Εναλλαγή dark/light με αποθήκευση επιλογής στον συγκεκριμένο browser.
const THEME_KEY = 'christos-portfolio-theme-v6';
const themeButton = $('.theme-toggle');
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
} catch { /* π.χ. browser που δεν επιτρέπει τοπική αποθήκευση */ }
function updateThemeLabel() {
  const light = document.documentElement.dataset.theme === 'light';
  themeButton?.setAttribute('aria-label', light ? (currentLanguage === 'en' ? 'Switch to dark mode' : 'Ενεργοποίηση σκοτεινής εμφάνισης') : (currentLanguage === 'en' ? 'Switch to light mode' : 'Ενεργοποίηση φωτεινής εμφάνισης'));
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
    const textMatch = !query || normalize(card.dataset.search + " " + (card.dataset.searchEn || "")).includes(query);
    card.hidden = !(categoryMatch && textMatch);
    if (!card.hidden) shown += 1;
  }
  if (countText) countText.textContent = currentLanguage === 'en' ? `Showing ${shown} of ${projectCards.length} projects` : `Εμφανίζονται ${shown} από ${projectCards.length} έργα`;
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

// Reveal animations, σε κάθε κύλιση προς τα πάνω και προς τα κάτω.
// Σε χρήστες που προτιμούν μειωμένη κίνηση, τα στοιχεία εμφανίζονται κανονικά.
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else if (entry.boundingClientRect.bottom < -15 ||
                 entry.boundingClientRect.top > window.innerHeight + 15) {
        // Επαναφορά ΜΟΝΟ όταν το στοιχείο έχει βγει εντελώς από την οθόνη.
        // Έτσι δεν τρεμοπαίζει όσο διαβάζουμε την ενότητα.
        entry.target.classList.remove('is-visible');
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.documentElement.classList.add('motion-ready');
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

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
    if (copyFeedback) copyFeedback.textContent = currentLanguage === 'en' ? 'Email copied.' : 'Το email αντιγράφηκε.';
  } catch {
    if (copyFeedback) copyFeedback.textContent = currentLanguage === 'en' ? 'Copying is unavailable here. Please select the email above.' : 'Η αντιγραφή δεν υποστηρίζεται εδώ. Μπορείς να επιλέξεις το email παραπάνω.';
  }
});

const year = $('#current-year');
if (year) year.textContent = new Date().getFullYear();


// Bilingual UI. The original Greek text stays in the HTML for SEO and no-JS visitors.
const EN_TRANSLATIONS = {
  "Χρήστος Τριανταφυλλάκης | Έργα & Σπουδές": "Christos Triantafyllakis | Projects & Studies",
  "Μετάβαση στο περιεχόμενο": "Skip to content",
  "ΧΤ": "CT",
  "Χρήστος Τριανταφυλλάκης": "Christos Triantafyllakis",
  "Έργα": "Projects",
  "Πρακτική άσκηση": "Internship",
  "Σχετικά": "About",
  "Επικοινωνία": "Contact",
  "Τμήμα Μηχανικών Πληροφοριακών και Επικοινωνιακών Συστημάτων": "Department of Information and Communication Systems Engineering",
  "Πανεπιστήμιο Αιγαίου": "University of the Aegean",
  "Γεια! Είμαι ο": "Hi! I'm",
  "Χρήστος!": "Christos!",
  "Φοιτητής του Τμήματος Μηχανικών Πληροφοριακών & Επικοινωνιακών Συστημάτων": "Student at the Department of Information & Communication Systems Engineering",
  "Με ενδιαφέρει να συνδυάζω τη θεωρία με την πράξη, δημιουργώντας εφαρμογές λογισμικού και ρομποτικά συστήματα και εξερευνώντας την τεχνητή νοημοσύνη και τις σύγχρονες επικοινωνίες.": "I enjoy turning ideas into practical work: building software applications and robotic systems while exploring artificial intelligence and modern communications.",
  "Δες τα έργα μου": "Explore my projects",
  "6 πανεπιστημιακά έργα": "6 academic projects",
  "Πρακτική στο Γενικό Νοσοκομείο Άρτας": "Internship at Arta General Hospital",
  "01 / ΕΠΙΛΕΓΜΕΝΑ ΕΡΓΑ": "01 / SELECTED PROJECTS",
  "Τα έργα μου": "My projects",
  "Έξι πανεπιστημιακές εργασίες με αναφορές PDF, βίντεο και παρουσίαση.": "Six academic projects with PDF reports, videos and a presentation.",
  "Όλα": "All",
  "Ρομποτική": "Robotics",
  "Λογισμικό": "Software",
  "Διαδίκτυο": "Web",
  "Δεδομένα": "Data",
  "Καινοτομία": "Innovation",
  "Εμφανίζονται 6 από 6 έργα": "Showing 6 of 6 projects",
  "Προηγμένη Ρομποτική": "Advanced Robotics",
  "Αυτόνομο Health Kiosk": "Autonomous Health Kiosk",
  "Αναβάθμιση σταθμού μέτρησης ζωτικών λειτουργιών με Raspberry Pi 4, αισθητήρες, Computer Vision, τοπική βάση δεδομένων και μοντέλο AI μέσω Ollama.": "An enhanced vital-sign monitoring station using Raspberry Pi 4, sensors, computer vision, a local database and an AI model through Ollama.",
  "Άνοιγμα PDF": "View PDF",
  "Βίντεο": "Video",
  "Τεχνολογία Λογισμικού": "Software Engineering",
  "Σύστημα Διαχείρισης Κινηματογράφου": "Cinema Management System",
  "Πληροφοριακό σύστημα για την οργάνωση κινηματογραφικών προγραμμάτων και προβολών, με ρόλους χρηστών και REST API.": "An information system for managing cinema schedules and screenings, featuring user roles and a REST API.",
  "Προγραμματισμός στο Διαδίκτυο": "Web Programming",
  "Διαχείριση Συνεργείου Αυτοκινήτων": "Car Workshop Management",
  "Διαδικτυακή εφαρμογή για πελάτες και προσωπικό συνεργείου, με διαχείριση οχημάτων, ραντεβού και δικαιωμάτων πρόσβασης.": "A web application for customers and workshop staff, managing vehicles, appointments and access permissions.",
  "Βάσεις Δεδομένων ΙΙ": "Databases II",
  "Σύστημα Ιατρικών Ραντεβού": "Medical Appointment System",
  "Σχεδιασμός σχεσιακής βάσης και βάσης γραφοδεδομένων για ασθενείς, γιατρούς, ραντεβού, εξετάσεις και υπηρεσίες υγείας.": "Design of relational and graph databases for patients, doctors, appointments, examinations and healthcare services.",
  "Διάγραμμα ER": "ER Diagram",
  "Εισαγωγή στη Ρομποτική": "Introduction to Robotics",
  "Αρχικό Health Station": "Original Health Station",
  "Κατασκευή εκπαιδευτικού σταθμού με Raspberry Pi, οθόνη αφής και αισθητήρες για θερμοκρασία σώματος, καρδιακούς παλμούς και SpO₂.": "An educational health station built with Raspberry Pi, a touchscreen and sensors for body temperature, heart rate and SpO₂.",
  "Αισθητήρες": "Sensors",
  "Οθόνη αφής": "Touchscreen",
  "Ψηφιακή Καινοτομία και Επιχειρηματικότητα": "Digital Innovation and Entrepreneurship",
  "Ψηφιακή Καινοτομία": "Digital Innovation",
  "Πανεπιστημιακή εργασία στην ψηφιακή καινοτομία και την επιχειρηματικότητα, διαθέσιμη ως παρουσίαση PowerPoint.": "An academic project on digital innovation and entrepreneurship, available as a PowerPoint presentation.",
  "Ψηφιακή καινοτομία": "Digital innovation",
  "Επιχειρηματικότητα": "Entrepreneurship",
  "Άνοιγμα παρουσίασης": "View presentation",
  "Δεν βρέθηκαν έργα.": "No matching projects.",
  "Δοκίμασε διαφορετική λέξη ή άλλαξε κατηγορία.": "Try another search term or switch category.",
  "Καθαρισμός φίλτρων": "Clear filters",
  "Οι αναφορές ανοίγουν σε νέα καρτέλα. Ορισμένα έργα πραγματοποιήθηκαν σε συνεργασία με μέλη των αντίστοιχων πανεπιστημιακών ομάδων.": "Reports open in a new tab. Some projects were completed in collaboration with other university team members.",
  "02 / ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΕΜΠΕΙΡΙΑ": "02 / EXPERIENCE",
  "Πρακτική": "Internship",
  "άσκηση": "experience",
  "Γενικό Νοσοκομείο Άρτας": "Arta General Hospital",
  "Τμήμα Πληροφορικής · 2025–2026": "IT Department · 2025–2026",
  "Στην πρακτική μου ασχολήθηκα με την ανάπτυξη ψηφιακών εργαλείων για τις ανάγκες πολιτών και εργαζομένων, καθώς και με τεχνικές παρεμβάσεις σε πραγματικό περιβάλλον υπηρεσιών υγείας.": "During my internship, I developed digital tools for the public and hospital staff and contributed to technical improvements in a real healthcare environment.",
  "Web ανάπτυξη": "Web development",
  "Βάσεις δεδομένων": "Databases",
  "Ασφάλεια εφαρμογών": "Application security",
  "Ψηφιακός βοηθός για πολίτες": "Digital assistant for the public",
  "Εφαρμογή για την ιστοσελίδα του νοσοκομείου, με πληροφορίες για υπηρεσίες, κλινικές, εφημερίες, ραντεβού και συχνές ερωτήσεις, με διαχείριση περιεχομένου μέσω WordPress.": "A website assistant providing information about hospital services, clinics, on-call schedules, appointments and FAQs, with content managed through WordPress.",
  "Ψηφιακός βοηθός για το προσωπικό": "Digital assistant for hospital staff",
  "Οργάνωση καθημερινών διαδικασιών σε σύντομες, αναζητήσιμες οδηγίες βήμα προς βήμα για τους εργαζομένους.": "Everyday workflows presented as concise, searchable step-by-step instructions for hospital employees.",
  "Εφαρμογές και τεχνική υποστήριξη": "Applications and technical support",
  "Πρωτότυπο καταγραφής ζωτικών σημείων, μελέτη βελτίωσης της διαδικασίας ακτινολογικών εξετάσεων και τεχνική τεκμηρίωση προβλημάτων.": "A prototype for recording vital signs, analysis of improvements to radiology workflows and documentation of technical issues.",
  "03 / ΛΙΓΑ ΛΟΓΙΑ ΓΙΑ ΕΜΕΝΑ": "03 / ABOUT ME",
  "Πεδία που με": "Areas I’m",
  "ενδιαφέρουν": "interested in",
  "Οι σπουδές μου συνδυάζουν την πληροφορική με τις επικοινωνίες. Μέσα από μαθήματα, κατασκευές και εφαρμογές εξερευνώ πώς οι διαφορετικές τεχνολογίες μπορούν να συνεργαστούν για χρήσιμες λύσεις.": "My studies bring together computer science and communications. Through coursework, hands-on projects and applications, I explore how different technologies can work together to solve real problems.",
  "Τεχνητή νοημοσύνη": "Artificial intelligence",
  "Web εφαρμογές": "Web applications",
  "Οπτικές επικοινωνίες": "Optical communications",
  "Δορυφορικές επικοινωνίες": "Satellite communications",
  "IoT — Διαδίκτυο των Πραγμάτων": "IoT — Internet of Things",
  "04 / ΕΠΙΚΟΙΝΩΝΙΑ": "04 / CONTACT",
  "Ας μιλήσουμε": "Get in touch",
  "Για κάποια εργασία, ιδέα ή δυνατότητα συνεργασίας, μπορείς να επικοινωνήσεις μαζί μου.": "Have a question about a project, an idea or a potential collaboration? Feel free to reach out.",
  "Τηλέφωνο": "Phone",
  "Επιστροφή στην αρχή ↑": "Back to top ↑"
};
const LANGUAGE_KEY = 'christos-portfolio-language-v6';
const translate = (greek, language = currentLanguage) => language === 'en' ? (EN_TRANSLATIONS[greek] ?? greek) : greek;
const langButton = $('.language-toggle');
const translatableText = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (node.parentElement?.closest('svg,script,style')) continue;
  const original = node.nodeValue;
  const key = original.trim();
  if (Object.hasOwn(EN_TRANSLATIONS, key)) translatableText.push({node, original, key});
}
const translatableAttrs = [];
for (const element of $$('[aria-label], [title], [placeholder], [alt]')) {
  const attributes = {};
  for (const name of ['aria-label','title','placeholder','alt']) {
    if (element.hasAttribute(name)) attributes[name] = element.getAttribute(name);
  }
  translatableAttrs.push({element, attributes});
}
const EN_ATTRIBUTES = {
  'Άνοιγμα μενού':'Open menu',
  'Κλείσιμο μενού':'Close menu',
  'Χρήστος Τριανταφυλλάκης — αρχική':'Christos Triantafyllakis — Home',
  'Κύρια πλοήγηση':'Main navigation',
  'Αλλαγή εμφάνισης':'Toggle theme',
  'Εναλλαγή φωτεινής / σκοτεινής εμφάνισης':'Switch light / dark theme',
  'Αναζήτηση και φιλτράρισμα έργων':'Search and filter projects',
  'Φίλτρο κατηγορίας':'Filter by category',
  'Αναζήτηση έργων και τεχνολογιών':'Search projects and technologies',
  'Αναζήτηση έργων...':'Search projects...',
  'Συντόμευση αναζήτησης':'Search shortcut',
  'Άνοιγμα PDF: Αυτόνομο Health Kiosk':'Open PDF: Autonomous Health Kiosk',
  'Άνοιγμα PDF: Σύστημα Διαχείρισης Κινηματογράφου':'Open PDF: Cinema Management System',
  'Άνοιγμα PDF: Διαχείριση Συνεργείου Αυτοκινήτων':'Open PDF: Car Workshop Management',
  'Άνοιγμα PDF: Σύστημα Ιατρικών Ραντεβού':'Open PDF: Medical Appointment System',
  'Άνοιγμα PDF: Αρχικό Health Station':'Open PDF: Original Health Station',
  'Άνοιγμα παρουσίασης: Ψηφιακή Καινοτομία':'Open presentation: Digital Innovation',
  'Εικονογράφηση του αυτόνομου Health Kiosk':'Illustration of the autonomous Health Kiosk',
  'Εικονογράφηση κινηματογραφικής αίθουσας':'Illustration of a cinema',
  'Εικονογράφηση διαδικτυακής εφαρμογής συνεργείου':'Illustration of a car workshop web application',
  'Διάγραμμα συνδεδεμένων οντοτήτων':'Diagram of linked database entities',
  'Φωτογραφίες του αρχικού σταθμού τηλεμετρίας υγείας':'Photos of the original Health Station',
  'Σχηματική απεικόνιση παρουσίασης':'Presentation illustration',
  'Πεδία ενδιαφέροντος':'Areas of interest',
  'Αντιγραφή email':'Copy email',
  'Ενεργοποίηση σκοτεινής εμφάνισης':'Switch to dark mode',
  'Ενεργοποίηση φωτεινής εμφάνισης':'Switch to light mode'
};
var currentLanguage = 'el';
function applyLanguage(language) {
  currentLanguage = language === 'en' ? 'en' : 'el';
  document.documentElement.lang = currentLanguage;
  for (const item of translatableText) {
    const leading = item.original.match(/^\s*/)?.[0] ?? '';
    const trailing = item.original.match(/\s*$/)?.[0] ?? '';
    item.node.nodeValue = leading + translate(item.key) + trailing;
  }
  for (const item of translatableAttrs) {
    for (const [name, original] of Object.entries(item.attributes)) {
      item.element.setAttribute(name, currentLanguage === 'en' ? (EN_ATTRIBUTES[original] || original) : original);
    }
  }
  document.title = currentLanguage === 'en' ? 'Christos Triantafyllakis | Projects & Studies' : 'Χρήστος Τριανταφυλλάκης | Έργα & Σπουδές';
  document.querySelector('meta[name="description"]')?.setAttribute('content',currentLanguage === 'en' ? 'Christos Triantafyllakis — University of the Aegean student. Projects in software, robotics, AI and communications.' : 'Χρήστος Τριανταφυλλάκης — φοιτητής του Πανεπιστημίου Αιγαίου. Έργα στην πληροφορική, τη ρομποτική και τις επικοινωνίες.');
  if (langButton) {
    const next = currentLanguage === 'el' ? 'en' : 'el';
    langButton.dataset.langTarget = next;
    langButton.querySelector('span').textContent = next.toUpperCase();
    langButton.setAttribute('aria-label',next==='en'?'Switch language to English':'Αλλαγή γλώσσας στα Ελληνικά');
    langButton.setAttribute('title',next==='en'?'Switch to English':'Μετάβαση στα Ελληνικά');
  }
  updateThemeLabel();
  setMenu(navigation?.classList.contains('is-open') ?? false);
  updateProjects();
}
langButton?.addEventListener('click', () => {
  applyLanguage(currentLanguage === 'el' ? 'en' : 'el');
  try {localStorage.setItem(LANGUAGE_KEY,currentLanguage);} catch {}
});

try { applyLanguage(localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'el'); }
catch { applyLanguage('el'); }
