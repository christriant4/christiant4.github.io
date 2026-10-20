// Απλό JavaScript για το mobile μενού και την αυτόματη ενημέρωση της χρονιάς.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
  navigation?.classList.toggle('is-open', open);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Άνοιγμα μενού');
  });
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
