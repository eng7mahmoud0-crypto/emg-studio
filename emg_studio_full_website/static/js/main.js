const starterWorks = [
  {
    id: "s1",
    title: "Brand Identity Design",
    category: "graphic",
    description: "هوية بصرية كاملة: لوجو، ألوان، تطبيقات براند وسوشيال ميديا.",
    type: "image",
    src: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "s2",
    title: "Social Media Campaign",
    category: "graphic",
    description: "تصميمات إعلانية مناسبة للحملات الممولة والمطاعم والكافيهات.",
    type: "image",
    src: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "s3",
    title: "Video Editing Reel",
    category: "video",
    description: "مونتاج سريع، موشن جرافيك، كولور جريدينج وساوند ديزاين.",
    type: "image",
    src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "s4",
    title: "Studio Photography",
    category: "photo",
    description: "تصوير منتجات وبورتريه بإضاءة استوديو احترافية.",
    type: "image",
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop"
  }
];

let currentFilter = "all";

function openAdmin() {
  document.getElementById("adminModal").classList.add("active");
}

function closeAdmin() {
  document.getElementById("adminModal").classList.remove("active");
}

async function loadWorks() {
  try {
    const response = await fetch("/api/works");
    const uploadedWorks = await response.json();
    renderWorks([...uploadedWorks, ...starterWorks]);
  } catch {
    renderWorks(starterWorks);
  }
}

function renderWorks(works) {
  const grid = document.getElementById("portfolioGrid");
  const filtered = currentFilter === "all" ? works : works.filter(work => work.category === currentFilter);

  grid.innerHTML = filtered.map(work => `
    <article class="work-card reveal visible">
      <div class="work-media">
        <span class="tag">${labelCategory(work.category)}</span>
        ${work.type === "video"
          ? `<video src="${work.src}" controls muted></video>`
          : `<img src="${work.src}" alt="${work.title}">`
        }
      </div>
      <div class="work-body">
        <h3>${escapeHTML(work.title)}</h3>
        <p>${escapeHTML(work.description || "")}</p>
      </div>
    </article>
  `).join("");
}

function labelCategory(category) {
  if (category === "graphic") return "Graphic";
  if (category === "video") return "Video";
  if (category === "photo") return "Photo";
  return "Work";
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

async function uploadWork() {
  const password = document.getElementById("adminPassword").value;
  const title = document.getElementById("workTitle").value;
  const category = document.getElementById("workCategory").value;
  const description = document.getElementById("workDesc").value;
  const fileInput = document.getElementById("workFile");
  const message = document.getElementById("adminMessage");

  if (!fileInput.files[0]) {
    message.innerText = "اختار صورة أو فيديو الأول.";
    return;
  }

  const formData = new FormData();
  formData.append("password", password);
  formData.append("title", title);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("file", fileInput.files[0]);

  message.innerText = "جاري الرفع...";

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.ok) {
      message.innerText = result.message || "حصل خطأ.";
      return;
    }

    message.innerText = "تم رفع العمل بنجاح.";
    document.getElementById("workTitle").value = "";
    document.getElementById("workDesc").value = "";
    document.getElementById("workFile").value = "";
    await loadWorks();
  } catch {
    message.innerText = "حصل خطأ في الاتصال بالسيرفر.";
  }
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    loadWorks();
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

loadWorks();
