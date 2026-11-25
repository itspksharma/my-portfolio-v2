document.addEventListener("DOMContentLoaded", async () => {
  const $ = (id) => document.getElementById(id);

  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value || "";
  };

  let toastTimer = null;
  function showToast(message) {
    const toast = $("toast-pill");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return {};
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

  // ================= SITE & HEADER =================
  if (site.title) document.title = site.title;
  setText("nav-brand-name", `${(site.shortName || "pawan").toLowerCase()}.`);
  setText("availability-text", site.availability || "Open to Work");
  setText("footer-name", site.name || "Pawan Kumar Sharma");

  if ($("hero-portrait") && site.portrait) {
    $("hero-portrait").src = site.portrait;
  }

  // Resume PDF link or graceful fallback until PDF is uploaded
  const resumeBtn = $("resume-btn");
  if (resumeBtn) {
    if (site.resumePdf) {
      resumeBtn.href = site.resumePdf;
      resumeBtn.setAttribute("target", "_blank");
      resumeBtn.setAttribute("rel", "noopener noreferrer");
      setText("resume-btn-label", "Download CV ↗");
    } else {
      resumeBtn.href = "#experience";
      setText("resume-btn-label", "Resume PDF (Soon)");
      resumeBtn.addEventListener("click", () => {
        showToast("Resume PDF will be linked shortly — view experience below.");
      });
    }
  }

  // ================= 01 HERO =================
  setText("hero-eyebrow", home.eyebrow || "Hi, I'm");
  setText("hero-display", home.displayName || "Pawan");
  setText("hero-role", home.role || "Full Stack Developer — MERN & Django");
  setText("hero-tagline", home.tagline || "");

  if (home.stickyNote) {
    setText("sticky-index", home.stickyNote.index || "01 /");
    const stickyEl = $("sticky-text");
    if (stickyEl) {
      stickyEl.innerHTML = "";
      String(home.stickyNote.text || "")
        .split("\n")
        .forEach((line, idx, arr) => {
          stickyEl.appendChild(document.createTextNode(line));
          if (idx < arr.length - 1) stickyEl.appendChild(document.createElement("br"));
        });
    }
  }

  const ctaBox = $("hero-cta");
  if (ctaBox && Array.isArray(home.cta)) {
    ctaBox.innerHTML = "";
    home.cta.forEach((btn, idx) => {
      const a = document.createElement("a");
      a.href = btn.link || "#";
      a.className = idx === 0 ? "btn-cream" : "btn-ghost-light";
      a.textContent = btn.text || "";
      ctaBox.appendChild(a);
    });
  }

  // Subtle interactive tilt on portrait stage (desktop)
  const portraitStage = $("portrait-stage");
  if (portraitStage && window.matchMedia("(pointer: fine)").matches) {
    portraitStage.addEventListener("mousemove", (e) => {
      const rect = portraitStage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portraitStage.style.transform = `perspective(700px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg)`;
    });
    portraitStage.addEventListener("mouseleave", () => {
      portraitStage.style.transform = "";
    });
  }

  // ================= 02 SELECTED WORK & MODAL =================
  setText("projects-summary", portfolio.projects_summary || "");
  const allProjects = Array.isArray(portfolio.projects) ? portfolio.projects : [];
  const projectsGrid = $("projects");
  const wideSlot = $("featured-wide-slot");

  function openProjectModal(project) {
    const modal = $("project-modal");
    if (!modal) return;
    $("modal-img").src = project.image || "";
    $("modal-img").alt = project.title || "";
    setText("modal-title", project.title || "");
    setText("modal-desc", project.desc || "");

    const tagsBox = $("modal-tags");
    tagsBox.innerHTML = "";
    (project.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "stack-tag";
      span.textContent = tag;
      tagsBox.appendChild(span);
    });

    const actionsBox = $("modal-actions");
    actionsBox.innerHTML = "";
    if (project.github) {
      const gh = document.createElement("a");
      gh.href = project.github;
      gh.target = "_blank";
      gh.rel = "noopener noreferrer";
      gh.className = "btn-card-primary";
      gh.innerHTML = `<i class="ri-github-fill"></i> View Code`;
      actionsBox.appendChild(gh);
    }
    if (project.live) {
      const lv = document.createElement("a");
      lv.href = project.live;
      lv.target = "_blank";
      lv.rel = "noopener noreferrer";
      lv.className = "btn-card-secondary";
      lv.innerHTML = `<i class="ri-external-link-line"></i> Live Demo`;
      actionsBox.appendChild(lv);
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    const modal = $("project-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  if ($("modal-close")) {
    $("modal-close").addEventListener("click", closeProjectModal);
  }
  if ($("project-modal")) {
    $("project-modal").addEventListener("click", (e) => {
      if (e.target.id === "project-modal") closeProjectModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });

  function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";

    const tape = document.createElement("span");
    tape.className = "card-tape";
    tape.setAttribute("aria-hidden", "true");
    card.appendChild(tape);

    const thumbBtn = document.createElement("button");
    thumbBtn.type = "button";
    thumbBtn.className = "project-thumb-btn";
    thumbBtn.setAttribute("aria-label", `Inspect ${project.title}`);
    const img = document.createElement("img");
    img.src = project.image || "";
    img.alt = project.title || "Project preview";
    img.loading = "lazy";
    thumbBtn.appendChild(img);
    thumbBtn.addEventListener("click", () => openProjectModal(project));
    card.appendChild(thumbBtn);

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.title || "";
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = project.desc || "";
    card.appendChild(desc);

    const tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    (project.tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = "stack-tag";
      span.textContent = t;
      tagRow.appendChild(span);
    });
    card.appendChild(tagRow);

    const actions = document.createElement("div");
    actions.className = "project-actions";
    if (project.github) {
      const codeLink = document.createElement("a");
      codeLink.href = project.github;
      codeLink.target = "_blank";
      codeLink.rel = "noopener noreferrer";
      codeLink.className = "btn-card-primary";
      codeLink.innerHTML = `<i class="ri-github-fill"></i> Code`;
      actions.appendChild(codeLink);
    }

    if (project.live) {
      const liveLink = document.createElement("a");
      liveLink.href = project.live;
      liveLink.target = "_blank";
      liveLink.rel = "noopener noreferrer";
      liveLink.className = "btn-card-secondary";
      liveLink.innerHTML = `Live <i class="ri-arrow-right-up-line"></i>`;
      actions.appendChild(liveLink);
    } else {
      const detailBtn = document.createElement("button");
      detailBtn.type = "button";
      detailBtn.className = "btn-card-secondary";
      detailBtn.innerHTML = `Details <i class="ri-eye-line"></i>`;
      detailBtn.addEventListener("click", () => openProjectModal(project));
      actions.appendChild(detailBtn);
    }
    card.appendChild(actions);

    return card;
  }

  function renderProjects(filter = "All") {
    if (!projectsGrid || !wideSlot) return;
    projectsGrid.innerHTML = "";
    wideSlot.innerHTML = "";

    const filtered = filter === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === filter);

    const gridItems = filter === "All"
      ? filtered.filter((p) => !p.featuredWide)
      : filtered;

    const wideItems = filter === "All"
      ? filtered.filter((p) => p.featuredWide)
      : [];

    gridItems.forEach((p) => projectsGrid.appendChild(createProjectCard(p)));

    wideItems.forEach((p) => {
      const wrap = document.createElement("article");
      wrap.className = "featured-wide-card";

      const thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.className = "project-thumb-btn";
      thumbBtn.setAttribute("aria-label", `Inspect ${p.title}`);
      const img = document.createElement("img");
      img.src = p.image || "";
      img.alt = p.title || "";
      img.loading = "lazy";
      thumbBtn.appendChild(img);
      thumbBtn.addEventListener("click", () => openProjectModal(p));

      const meta = document.createElement("div");
      meta.className = "featured-wide-meta";

      const pill = document.createElement("span");
      pill.className = "spotlight-pill";
      pill.textContent = "Browser Extension Spotlight";

      const title = document.createElement("h3");
      title.className = "project-title";
      title.textContent = p.title || "";

      const desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = p.desc || "";

      const tagRow = document.createElement("div");
      tagRow.className = "tag-row";
      (p.tags || []).forEach((t) => {
        const span = document.createElement("span");
        span.className = "stack-tag";
        span.textContent = t;
        tagRow.appendChild(span);
      });

      const actRow = document.createElement("div");
      actRow.className = "featured-wide-actions";
      if (p.github) {
        const code = document.createElement("a");
        code.href = p.github;
        code.target = "_blank";
        code.rel = "noopener noreferrer";
        code.className = "btn-card-primary";
        code.innerHTML = `<i class="ri-github-fill"></i> Code`;
        actRow.appendChild(code);
      }
      const det = document.createElement("button");
      det.type = "button";
      det.className = "btn-card-secondary";
      det.innerHTML = `Preview <i class="ri-eye-line"></i>`;
      det.addEventListener("click", () => openProjectModal(p));
      actRow.appendChild(det);

      meta.append(pill, title, desc, tagRow, actRow);
      wrap.append(thumbBtn, meta);
      wideSlot.appendChild(wrap);
    });
  }

  renderProjects("All");

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects(btn.dataset.filter || "All");
    });
  });

  // ================= 03 EXPERIENCE & TECH STACK =================
  const expList = $("experience-list");
  if (expList && Array.isArray(resume.experience)) {
    expList.innerHTML = "";
    resume.experience.forEach((exp) => {
      const card = document.createElement("article");
      card.className = "exp-card";

      card.innerHTML = `
        <span class="ribbon-bookmark" aria-hidden="true"></span>
        <div class="exp-top">
          <h4 class="exp-company"></h4>
          <span class="exp-year"></span>
        </div>
        <p class="exp-role"></p>
        <p class="exp-desc"></p>
      `;
      card.querySelector(".exp-company").textContent = exp.company || "";
      card.querySelector(".exp-year").textContent = exp.year || "";
      card.querySelector(".exp-role").textContent = exp.role || "";
      card.querySelector(".exp-desc").textContent = exp.desc || "";

      if (exp.link) {
        const link = document.createElement("a");
        link.href = exp.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "pill-link";
        link.innerHTML = `Certificate <i class="ri-arrow-right-up-line"></i>`;
        card.appendChild(link);
      }

      expList.appendChild(card);
    });
  }

  const skillsGrid = $("skills");
  if (skillsGrid && Array.isArray(about.skills)) {
    skillsGrid.innerHTML = "";
    about.skills.forEach((s) => {
      const tile = document.createElement("div");
      tile.className = "skill-tile";
      tile.innerHTML = `
        <i class="${s.icon || "ri-code-s-slash-line"}" aria-hidden="true"></i>
        <span class="skill-name"></span>
        <span class="skill-group"></span>
      `;
      tile.querySelector(".skill-name").textContent = s.name || "";
      tile.querySelector(".skill-group").textContent = s.group || "";
      skillsGrid.appendChild(tile);
    });
  }

  // ================= 04 ABOUT, EDUCATION & CERTIFICATIONS =================
  setText("about-text", about.bio || "");
  setText("about-location", about.location ? `📍 ${about.location}` : "");

  const highlightsBox = $("about-highlights");
  if (highlightsBox && Array.isArray(about.highlights)) {
    highlightsBox.innerHTML = "";
    about.highlights.forEach((h) => {
      const pill = document.createElement("span");
      pill.className = "about-pill";
      pill.textContent = h;
      highlightsBox.appendChild(pill);
    });
  }

  const eduBox = $("education");
  if (eduBox && Array.isArray(resume.education)) {
    eduBox.innerHTML = "";
    resume.education.forEach((e) => {
      const row = document.createElement("div");
      row.className = "cred-row";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="cred-title"></div>
        <div class="cred-meta"></div>
        ${e.note ? `<div class="cred-note"></div>` : ""}
      `;
      left.querySelector(".cred-title").textContent = `${e.course} (${e.year})`;
      left.querySelector(".cred-meta").textContent = `${e.university} • ${e.location}`;
      if (e.note) left.querySelector(".cred-note").textContent = e.note;
      row.appendChild(left);

      if (e.link) {
        const a = document.createElement("a");
        a.href = e.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "pill-link";
        a.innerHTML = `Verify <i class="ri-arrow-right-up-line"></i>`;
        row.appendChild(a);
      }

      eduBox.appendChild(row);
    });
  }

  const certBox = $("certifications");
  if (certBox && Array.isArray(resume.certifications)) {
    certBox.innerHTML = "";
    resume.certifications.forEach((c) => {
      const row = document.createElement("div");
      row.className = "cred-row";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="cred-title"></div>
        <div class="cred-meta"></div>
      `;
      left.querySelector(".cred-title").textContent = c.title || "";
      left.querySelector(".cred-meta").textContent = `${c.organization} • ${c.year}`;
      row.appendChild(left);

      if (c.link) {
        const a = document.createElement("a");
        a.href = c.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "pill-link";
        a.innerHTML = `View <i class="ri-arrow-right-up-line"></i>`;
        row.appendChild(a);
      }

      certBox.appendChild(row);
    });
  }

  const sliderTrack = $("slider-track");
  if (sliderTrack && Array.isArray(resume.gallery) && resume.gallery.length) {
    sliderTrack.innerHTML = "";
    const loopImages = [...resume.gallery, ...resume.gallery];
    loopImages.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `MCA convocation highlight ${(i % resume.gallery.length) + 1}`;
      img.loading = "lazy";
      sliderTrack.appendChild(img);
    });
  }

  // ================= 05 CONTACT & AJAX FORM =================
  setText("contact-headline", contact.headline || "Got a good idea or role?");
  setText("contact-desc", contact.description || "");

  const contactInfo = $("contact-info");
  if (contactInfo) {
    contactInfo.innerHTML = "";

    if (contact.email) {
      const emailRow = document.createElement("div");
      emailRow.className = "contact-line";
      emailRow.innerHTML = `
        <i class="ri-mail-line" aria-hidden="true"></i>
        <a href="mailto:${contact.email}">${contact.email}</a>
        <button type="button" class="copy-email-btn" id="copy-email-btn">Copy</button>
      `;
      contactInfo.appendChild(emailRow);

      emailRow.querySelector("#copy-email-btn").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(contact.email);
          showToast("Email copied to clipboard!");
        } catch {
          showToast(contact.email);
        }
      });
    }

    if (contact.phone) {
      const phoneRow = document.createElement("div");
      phoneRow.className = "contact-line";
      const cleanTel = (contact.phoneRaw || contact.phone).replace(/\s+/g, "");
      phoneRow.innerHTML = `
        <i class="ri-phone-line" aria-hidden="true"></i>
        <a href="tel:+${cleanTel.replace(/^\+/, "")}">${contact.phone}</a>
      `;
      contactInfo.appendChild(phoneRow);
    }

    if (contact.location) {
      const locRow = document.createElement("div");
      locRow.className = "contact-line";
      locRow.innerHTML = `
        <i class="ri-map-pin-line" aria-hidden="true"></i>
        <span></span>
      `;
      locRow.querySelector("span").textContent = contact.location;
      contactInfo.appendChild(locRow);
    }
  }

  const socialsBox = $("contact-socials");
  if (socialsBox) {
    socialsBox.innerHTML = "";
    if (contact.social?.github) {
      const gh = document.createElement("a");
      gh.href = contact.social.github;
      gh.target = "_blank";
      gh.rel = "noopener noreferrer";
      gh.className = "social-pill";
      gh.innerHTML = `<i class="ri-github-fill"></i> GitHub`;
      socialsBox.appendChild(gh);
    }
    if (contact.social?.linkedin) {
      const li = document.createElement("a");
      li.href = contact.social.linkedin;
      li.target = "_blank";
      li.rel = "noopener noreferrer";
      li.className = "social-pill";
      li.innerHTML = `<i class="ri-linkedin-fill"></i> LinkedIn`;
      socialsBox.appendChild(li);
    }
    if (contact.phoneRaw) {
      const msg = encodeURIComponent(
        "Hi Pawan, I checked out your portfolio and would love to connect regarding an opportunity."
      );
      const wa = document.createElement("a");
      wa.href = `https://wa.me/${contact.phoneRaw}?text=${msg}`;
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.className = "social-pill";
      wa.innerHTML = `<i class="ri-whatsapp-line"></i> WhatsApp`;
      socialsBox.appendChild(wa);
    }
  }

  // AJAX FormSubmit with loading -> success feedback
  const formBox = $("contact-form-box");
  const feedbackEl = $("form-feedback");
  if (contact.form?.enabled && formBox) {
    const form = document.createElement("form");
    form.className = "contact-form";
    form.method = "POST";
    form.action = contact.form.action;

    const settings = contact.form.settings || {};
    Object.entries(settings).forEach(([key, val]) => {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = key;
      hidden.value = val;
      form.appendChild(hidden);
    });

    (contact.form.fields || []).forEach((field) => {
      const el = field.type === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input");
      if (field.type !== "textarea") el.type = field.type || "text";
      el.name = field.name || "";
      el.placeholder = field.placeholder || "";
      el.required = true;
      form.appendChild(el);
    });

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "submit-pill-btn";
    submitBtn.textContent = "Send Message";
    form.appendChild(submitBtn);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (feedbackEl) {
        feedbackEl.textContent = "";
        feedbackEl.className = "form-feedback";
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        const res = await fetch(contact.form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        if (feedbackEl) {
          feedbackEl.textContent = "Message sent! Thanks for reaching out — I'll reply soon.";
          feedbackEl.classList.add("success");
        }
        showToast("Message sent successfully!");
      } catch {
        if (feedbackEl) {
          feedbackEl.textContent = "Could not send via form right now — please email or WhatsApp directly.";
          feedbackEl.classList.add("error");
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });

    formBox.appendChild(form);
  }

  // ================= SCROLL SPY, BACK TO TOP & MOBILE NAV =================
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-pill-link");

  window.addEventListener("scroll", () => {
    let activeId = "";
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 160 && rect.bottom >= 160) {
        activeId = sec.id;
      }
    });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 40) {
      activeId = "contact";
    }
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }, { passive: true });

  if ($("topBtn")) {
    $("topBtn").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const menuToggle = $("menu-toggle");
  const mobileMenu = $("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
});
