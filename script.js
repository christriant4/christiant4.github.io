/**
 * Christos' portfolio. All 3 university projects below are based on the
 * accompanying reports/code shared by their author.
 * Project repositories / public report links can be added when approved.
 */
const portfolio = {
  name: "Χρήστος Τριανταφυλλάκης",
  nameShort: "Χρήστος",
  role: "a student of Information and Communication Systems Engineering at the University of the Aegean",
  school: "ICSD · University of the Aegean",
  location: "Samos, Greece",
  email: "",
  github: "https://github.com/christriant4",
  linkedin: "",
  skills: ["Python", "FastAPI", "PHP", "JavaScript", "HTML / CSS", "SQL", "Raspberry Pi", "Computer Vision"],
  about: "I'm Χρήστος Τριανταφυλλάκης, studying Information and Communication Systems Engineering (ICSD) at the University of the Aegean in Samos, Greece. My university projects span software engineering, web development and embedded systems.",
  projects: [
    {
      title: "Cinema Management System",
      type: "Software",
      category: "SOFTWARE ENGINEERING",
      description: "A role-based system for managing cinema programmes and screenings, from creation and submission to review and approval through RESTful services.",
      technologies: ["Python", "FastAPI", "REST APIs", "SQL"],
      image: "assets/cinema-management.webp",
      imageAlt: "Cinema-themed illustration from the Software Engineering project report",
      github: "",
      demo: ""
    },
    {
      title: "Car Workshop Management",
      type: "Web",
      category: "WEB PROGRAMMING",
      description: "A web application for managing vehicles and appointments at a car workshop, with dedicated functions for customers, mechanics and secretaries.",
      technologies: ["PHP", "HTML / CSS", "JavaScript", "MySQL"],
      image: "assets/car-workshop.webp",
      imageAlt: "Developer workstation illustration from the Web Programming project report",
      github: "",
      demo: ""
    },
    {
      title: "Autonomous Health Kiosk",
      type: "Robotics",
      category: "ADVANCED ROBOTICS",
      description: "An educational Raspberry Pi health-kiosk prototype combining vital-sign sensors, camera-based guidance, local storage and local AI-assisted explanations.",
      technologies: ["Raspberry Pi", "Python", "Sensors", "Computer Vision", "SQLite", "Ollama"],
      image: "assets/health-kiosk.webp",
      imageAlt: "Health-kiosk illustration from the Advanced Robotics project report",
      github: "",
      demo: ""
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

function makeProjectArt(project) {
  if (project.image) {
    const art = element("div", "project-art project-art-image");
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.imageAlt || project.title;
    img.loading = "eager";
    img.decoding = "async";
    art.append(img);
    return art;
  }
  // Keep the original decorative artwork available as a fallback.
  const type = project.type;
  const art = element("div", "project-art " + ({Web:"art-web",Software:"art-data",Robotics:"art-system"}[type] || "art-web"));
  const graphic = element("div", "art-window");
  for (let i=0;i<3;i++) graphic.append(document.createElement("i"));
  art.append(graphic);
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
    card.append(makeProjectArt(project));
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
    if (repo || demo) body.append(links);
    card.append(body);
    grid.append(card);
  });
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
  document.querySelectorAll("[data-name-short]").forEach(el => text(el, portfolio.nameShort || portfolio.name));
  document.querySelectorAll("[data-role]").forEach(el => text(el, portfolio.role));
  document.querySelectorAll("[data-school]").forEach(el => text(el, portfolio.school));
  document.querySelectorAll("[data-location]").forEach(el => text(el, portfolio.location));
  text(byId("about-text"),portfolio.about);
  const year = String(new Date().getFullYear());
  text(byId("current-year"),year);
  text(byId("footer-year"),year);
  const skills = byId("skills-list");
  skills.replaceChildren(...portfolio.skills.map(skill => element("span", "", skill)));
  renderProjects();
  setupContact();
}

document.addEventListener("DOMContentLoaded",init);
