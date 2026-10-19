/**
 * EDIT THIS FIRST! Replace the sample values with your own details.
 * All three projects below are EXAMPLES — not real projects.
 * Leave email/github/linkedin empty until you have the correct URLs.
 */
const portfolio = {
  name: "Your Name",
  role: "an engineering student",
  school: "ICSD · University of the Aegean",
  location: "Samos, Greece",
  email: "", // e.g. "you@example.com"
  github: "", // e.g. "https://github.com/your-username"
  linkedin: "", // e.g. "https://www.linkedin.com/in/your-username/"
  skills: ["Add your languages", "Add your frameworks", "Add your tools"],
  about: "I'm an ICSD student at the University of the Aegean in Samos. This space brings together the projects that best reflect my interests, progress, and problem-solving approach.",
  projects: [
    {
      title: "University Project Presentation",
      type: "University",
      category: "UNIVERSITY PROJECT",
      description: "Presentation stored on Google Drive. Project title, summary, and technologies will be added once finalized.",
      technologies: [],
      github: "",
      demo: "https://drive.google.com/drive/folders/19M8ysfLiGidzGjgcnpZ1qXVP3ryUxhaO?usp=sharing",
      demoLabel: "Open Drive folder", // Folder link for now; change to a direct PPT file link when available
      placeholderLabel: "DETAILS COMING SOON",
      placeholder: true
    },
    {
      title: "Your technical challenge",
      type: "Systems",
      category: "SYSTEMS / BACKEND",
      description: "Highlight a university project involving systems, algorithms, architecture, or technical decisions.",
      technologies: ["Tech 01", "Tech 02"],
      github: "",
      demo: "",
      placeholder: true
    },
    {
      title: "Your favorite experiment",
      type: "Data",
      category: "DATA / RESEARCH",
      description: "Show a project that reflects curiosity, experimentation, or an approach you are proud of.",
      technologies: ["Tech 01", "Tech 02"],
      github: "",
      demo: "",
      placeholder: true
    }
  ]
};

const byId = (id) => document.getElementById(id);
const text = (el, value) => { if (el) el.textContent = value; };
const safeUrl = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};

// Simple helpers intentionally avoid injecting user-controlled HTML.
function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function makeProjectArt(type, isPlaceholder, placeholderLabel) {
  const art = element("div", "project-art " + ({Web:"art-web",Systems:"art-system",Data:"art-data"}[type] || "art-web"));
  if (isPlaceholder) art.append(element("span", "art-placeholder", placeholderLabel || "EXAMPLE CARD"));
  if (type === "Systems") {
    const graphic = element("div", "art-system-graphic");
    ["{ }", "01", "API"].forEach(s => graphic.append(element("span", "art-node", s)));
    art.append(graphic);
  } else if (type === "Data") {
    const bars = element("div", "art-bars");
    for (let i=0;i<4;i++) bars.append(document.createElement("i"));
    art.append(bars);
  } else {
    const graphic = element("div", "art-window");
    for (let i=0;i<3;i++) graphic.append(document.createElement("i"));
    art.append(graphic);
  }
  return art;
}

function link(label, url) {
  const a = element("a", "", label + " ↗");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

function renderProjects(type="All") {
  const grid = byId("project-grid");
  grid.replaceChildren();
  const projects = portfolio.projects.filter(project => type === "All" || project.type === type);
  if (!projects.length) {
    grid.append(element("p", "editing-note", "No projects in this category yet."));
    return;
  }
  projects.forEach((project, index) => {
    const card = element("article", "project-card");
    card.append(makeProjectArt(project.type, project.placeholder, project.placeholderLabel));
    const body = element("div", "project-body");
    const top = element("div", "project-topline");
    top.append(element("span", "", project.category || project.type || "PROJECT"));
    top.append(element("span", "project-number", String(index+1).padStart(2,"0")));
    body.append(top, element("h3", "", project.title), element("p", "", project.description));
    const tags = element("div", "project-tags");
    (project.technologies || []).forEach(tech => tags.append(element("span", "", tech)));
    body.append(tags);
    const links = element("div", "project-links");
    const repo = safeUrl(project.github), demo = safeUrl(project.demo);
    if (repo) links.append(link("GitHub",repo));
    if (demo) links.append(link(project.demoLabel || "Live demo",demo));
    if (!repo && !demo) links.append(element("span", "no-link", "Links will be added here ↗"));
    body.append(links);
    card.append(body);
    grid.append(card);
  });
}

function setupFilters() {
  const filters = byId("project-filters");
  const types = ["All",...new Set(portfolio.projects.map(project => project.type).filter(Boolean))];
  const buttons = types.map(type => {
    const btn = element("button", "filter-chip" + (type === "All" ? " active" : ""), type === "All" ? "All projects" : type);
    btn.type = "button";
    btn.setAttribute("aria-pressed",String(type === "All"));
    btn.addEventListener("click", () => {
      buttons.forEach(b => { b.classList.remove("active");b.setAttribute("aria-pressed","false"); });
      btn.classList.add("active");btn.setAttribute("aria-pressed","true");
      renderProjects(type);
    });
    filters.append(btn);
    return btn;
  });
  renderProjects();
}

function setupContact() {
  const actions = byId("contact-actions");
  const links = [];
  if (portfolio.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(portfolio.email)) {
    const a = element("a", "contact-link", "Send me an email ↗");
    a.href = "mailto:" + encodeURIComponent(portfolio.email).replace(/%40/g,"@");
    links.push(a);
  }
  const github = safeUrl(portfolio.github), linkedin = safeUrl(portfolio.linkedin);
  if (github) { const a=link("GitHub",github);a.className="contact-link";links.push(a); }
  if (linkedin) { const a=link("LinkedIn",linkedin);a.className="contact-link";links.push(a); }
  if (links.length) actions.replaceChildren(...links);
}

function init() {
  document.title = portfolio.name + " — Portfolio";
  document.querySelectorAll("[data-name]").forEach(el => text(el, portfolio.name));
  document.querySelectorAll("[data-name-short]").forEach(el => text(el, portfolio.name));
  document.querySelectorAll("[data-role]").forEach(el => text(el, portfolio.role));
  document.querySelectorAll("[data-school]").forEach(el => text(el, portfolio.school));
  document.querySelectorAll("[data-location]").forEach(el => text(el, portfolio.location));
  text(byId("about-text"),portfolio.about);
  const year = String(new Date().getFullYear());
  text(byId("current-year"),year);
  text(byId("footer-year"),year);
  const skills = byId("skills-list");
  skills.replaceChildren(...portfolio.skills.map(skill => element("span", "", skill)));
  setupFilters();
  setupContact();
}

document.addEventListener("DOMContentLoaded",init);
