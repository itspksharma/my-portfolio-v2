document.addEventListener("DOMContentLoaded", async () => {

  const $ = (id) => document.getElementById(id);

  // ================= SAFE SET =================
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.innerText = value || "";
  };

  // ================= TYPE EFFECT =================
  function typeEffect(element, words = [], speed = 100) {
    if (!element || !words.length) return;

    let i = 0, j = 0, isDeleting = false;

    function type() {
      let currentWord = words[i];

      element.innerText = isDeleting
        ? currentWord.substring(0, j--)
        : currentWord.substring(0, j++);

      if (!isDeleting && j === currentWord.length) {
        isDeleting = true;
        return setTimeout(type, 1000);
      }

      if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
      }

      setTimeout(type, isDeleting ? speed / 2 : speed);
    }

    type();
  }

  // ================= LOAD JSON =================
  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      return await res.json();
    } catch {
      return {};
    }
  }

  const [site, home, about, resume, portfolio, contact] = await Promise.all([
    loadJSON("data/site.json"),
    loadJSON("data/home.json"),
    loadJSON("data/about.json"),
    loadJSON("data/resume.json"),
    loadJSON("data/portfolio.json"),
    loadJSON("data/contact.json")
  ]);

  // ================= AOS =================
  if (window.AOS) AOS.init({ duration: 1000, once: true });

  // ================= SITE =================
  setText("site-title", site.title);
  setText("site-name", site.name);
  setText("mobile-name", site.name);

  if ($("profile-img")) $("profile-img").src = site.logo || "";

  // ================= SIDEBAR SOCIAL =================
if ($("sidebar-social")) {
  $("sidebar-social").innerHTML = `
    ${contact.social?.github ? `
      <a href="${contact.social.github}" target="_blank" class="sidebar-icon">
        <i class="ri-github-fill"></i>
      </a>` : ""}

    ${contact.social?.linkedin ? `
      <a href="${contact.social.linkedin}" target="_blank" class="sidebar-icon">
        <i class="ri-linkedin-fill"></i>
      </a>` : ""}
  `;
}

  

  // ================= HOME =================
  setText("hero-name", home.name);
  typeEffect($("hero-role"), home.roles || []);
  setText("hero-tagline", home.tagline);

  if (home.background?.type === "image" && $("hero-bg")) {
  $("hero-bg").style.backgroundImage = `
    linear-gradient(
      to right,
      rgba(2,6,23,0.95) 20%,
      rgba(2,6,23,0.85) 40%,
      rgba(2,6,23,0.4) 65%,
      rgba(2,6,23,0.05) 100%
    ),
    url(${home.background.value})
  `;
}

  const cta = $("hero-cta");
  if (cta) {
    cta.innerHTML = "";
    home.cta?.forEach(btn => {
      const a = document.createElement("a");
      a.href = btn.link;
      a.innerText = btn.text;
      cta.appendChild(a);
    });
  }

  // ================= ABOUT =================
  setText("about-text", about.bio);

  if ($("about-summary")) {
    $("about-summary").innerHTML = "";
    about.summary?.forEach(t => {
      const p = document.createElement("p");
      p.innerText = t;
      $("about-summary").appendChild(p);
    });
  }

  if ($("about-details")) {
    $("about-details").innerHTML = "";
    Object.entries(about.details || {}).forEach(([k, v]) => {
      const d = document.createElement("div");
      d.innerHTML = `<b>${k}:</b> ${v}`;
      $("about-details").appendChild(d);
    });
  }

  if ($("skills")) {
  $("skills").innerHTML = "";

  about.skills?.forEach(s => {
    const div = document.createElement("div");
    div.className = "skill-card";

    div.innerHTML = `
      <i class="${s.icon} skill-icon"></i>
      <span>${s.name}</span>
    `;

    $("skills").appendChild(div);
  });
}

  // ================= RESUME =================
  // SUMMARY
setText("summary", resume.summary);
setText("education-summary", resume.education_summary);
setText("certification-summary", resume.certification_summary);


// ================= SLIDER (FINAL FIX) =================
const sliderTrack = document.getElementById("slider-track");

if (sliderTrack) {
  sliderTrack.innerHTML = "";

  const images = [
    "assets/cutm/mca01.JPG",
    "assets/cutm/mca02.jpg",
    "assets/cutm/mca03.JPG",
    "assets/cutm/mca04.jpg",
    "assets/cutm/mca05.jpeg",
    "assets/cutm/mca06.jpeg",
  ];
  


  // 🔥 duplicate for smooth infinite loop
  const allImages = [...images, ...images];

  allImages.forEach(img => {
    const i = document.createElement("img");
    i.src = img;
    sliderTrack.appendChild(i);
  });
}

// ================= EDUCATION =================
const icons = ["ri-graduation-cap-line","ri-book-open-line","ri-school-line","ri-building-line"];

const colors = ["#3b82f6","#22c55e","#f59e0b","#ef4444"];

if ($("education")) {
  $("education").innerHTML = "";

  resume.education?.forEach((e, index) => {
    const div = document.createElement("div");

    div.className = "edu-card";

    div.innerHTML = `
      <div class="edu-icon" style="background:${colors[index]}">
        <i class="${icons[index]}"></i>
      </div>

      <div class="edu-content">
        <h4>${e.course}</h4>
        <p>${e.university} (${e.year})</p>
        <small>${e.location}</small>
        ${e.note ? `<p class="edu-note">${e.note}</p>` : ""}
        ${e.link ? `<a href="${e.link}" target="_blank">Verify</a>` : ""}
      </div>
    `;

    $("education").appendChild(div);
  });
}

  if ($("certifications")) {
    $("certifications").innerHTML = "";
    resume.certifications?.forEach(c => {
      const div = document.createElement("div");
      div.className = "cert-card";

      div.innerHTML = `
        <div class="cert-icon"><i class="${c.icon}"></i></div>
        <div class="cert-content">
          <h4>${c.title}</h4>
          <p>${c.desc || ""}</p>
          <small>${c.organization} (${c.year})</small><br>
          ${c.link ? `<a class="cert-link" href="${c.link}" target="_blank">View</a>` : ""}
        </div>
      `;

      $("certifications").appendChild(div);
    });
  }

    // ================= PROJECT =================
    // ================= PORTFOLIO SUMMARY =================
setText("projects-summary", portfolio.projects_summary);
setText("achievements-summary", portfolio.achievements_summary);
portfolio.projects?.forEach(p => {
  const div = document.createElement("div");

  div.className = "col-md-6 col-lg-4 mb-4";

  div.innerHTML = `
    <div class="card h-100 shadow-sm" data-aos="zoom-in">

      <img src="${p.image}" class="card-img-top" alt="${p.title}" />

      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${p.title}</h5>
        <p class="card-text">${p.desc}</p>

        <div class="mt-auto">
          ${p.github ? `<a href="${p.github}" target="_blank" class="btn btn-dark btn-sm me-2">GitHub</a>` : ""}
          ${p.live ? `<a href="${p.live}" target="_blank" class="btn btn-primary btn-sm">Live</a>` : ""}
        </div>
      </div>

    </div>
  `;

  document.getElementById("projects").appendChild(div);
});

  // ================= ACHIEVEMENTS =================
portfolio.achievements?.forEach((a, index) => {
  const div = document.createElement("div");

  div.className = "timeline-item";

  div.innerHTML = `
    <div class="timeline-dot"></div>

    <div class="timeline-content" data-aos="fade-up" data-aos-delay="${index * 150}">
      <span class="timeline-year">${a.year}</span>
      <h5>${a.title}</h5>
      <p>${a.desc}</p>
    </div>
  `;

  document.getElementById("achievements").appendChild(div);
});

  // ================= CONTACT =================
  setText("contact-title", contact.title);
  setText("contact-subtitle", contact.subtitle);
  setText("contact-desc", contact.description);

  if ($("contact-info")) {
    $("contact-info").innerHTML = `
      <p>📧 ${contact.email || ""}</p>
      <p>📞 ${contact.phone || ""}</p>
      <p>📍 ${contact.location || ""}</p>

      <div class="social-links mt-3">
      ${contact.social?.github ? `
        <a href="${contact.social.github}" target="_blank" class="social-btn">
          <i class="ri-github-fill"></i>
        </a>` : ""}

      ${contact.social?.linkedin ? `
        <a href="${contact.social.linkedin}" target="_blank" class="social-btn">
          <i class="ri-linkedin-fill"></i>
        </a>` : ""}
    </div>

    `;
  }

  // ================= CONTACT FORM =================
if (contact.form?.enabled && $("contact-form-box")) {

  const form = document.createElement("form");
  form.method = "POST";
  form.action = contact.form.action;
  form.className = "contact-form";

  // fields
  contact.form.fields.forEach(f => {
    let input;

    if (f.type === "textarea") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = f.type;
    }

    input.name = f.name;
    input.placeholder = f.placeholder;
    input.required = true;

    form.appendChild(input);
  });

  // hidden settings
  Object.entries(contact.form.settings || {}).forEach(([k, v]) => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = k;
    hidden.value = v;
    form.appendChild(hidden);
  });

  // submit button
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.innerText = "Send Message ";
  btn.className = "btn btn-primary mt-2";

  form.appendChild(btn);

  $("contact-form-box").appendChild(form);
}

  if ($("map-frame")) $("map-frame").src = contact.map?.embed || "";

  // ================= WHATSAPP AUTO GREETING =================
if ($("whatsappBtn")) {

  const message = `Hello 👋

Thank you for reaching out!

I'm Pawan, a Full Stack Developer.  
Feel free to share your requirement or opportunity — I'll be happy to connect with you 🚀`;

  const encodedMsg = encodeURIComponent(message);

  $("whatsappBtn").href = `https://wa.me/91${contact.phone}?text=${encodedMsg}`;
}

  // ================= NAV + SCROLL =================
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const topBtn = $("topBtn");

  window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        current = sec.id;
      }
    });

    // bottom fix (contact)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      current = "contact";
    }

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });

    // scroll top button
    if (topBtn) {
      topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    }
  });

  // ================= SCROLL TOP =================
  if (topBtn) {
    topBtn.onclick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  const profileImg = document.getElementById("profile-img");

if (profileImg) {
  profileImg.addEventListener("click", () => {

    // 🔥 SWING ANIMATION
    profileImg.classList.add("swing");
    setTimeout(() => {
      profileImg.classList.remove("swing");
    }, 600);

  });
}

// ================= MOBILE NAV =================
const toggleBtn = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

// mobile profile image
if ($("mobile-profile-img")) {
  $("mobile-profile-img").src = site.logo || "";
}

if (toggleBtn && mobileMenu) {
  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

// close menu after click
document.querySelectorAll("#mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
  });
});

});