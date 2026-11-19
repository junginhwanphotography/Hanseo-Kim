(function () {
  const arrow =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function open(root, project) {
    root.replaceChildren();
    const images = project.images || [];
    const article = document.createElement("article");
    article.className = "project";
    const label = document.createElement("p");
    label.className = "project-label";
    label.append(document.createTextNode(project.title || project.id || ""));
    label.append(document.createElement("br"));
    label.append(document.createTextNode(project.year || ""));
    const gallery = document.createElement("div");
    article.append(label, gallery);
    root.appendChild(article);
    const slider = mount(gallery, images, project.title || "");
    return {
      destroy() {
        slider.destroy();
      },
    };
  }

  function mount(gallery, images, title) {
    if (!images.length) return { destroy() {} };
    let index = 0;
    let startX = null;
    const slider = document.createElement("div");
    slider.className = "slider";
    const stage = document.createElement("div");
    stage.className = "slider-stage";
    const frame = document.createElement("div");
    frame.className = "slider-frame";
    const img = document.createElement("img");
    img.alt = title;
    img.decoding = "async";
    img.addEventListener("load", () => {
      img.classList.toggle("is-landscape", img.naturalWidth > img.naturalHeight);
    });
    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "slider-arrow slider-prev";
    prev.setAttribute("aria-label", "Previous");
    prev.innerHTML = arrow;
    const next = document.createElement("button");
    next.type = "button";
    next.className = "slider-arrow slider-next";
    next.setAttribute("aria-label", "Next");
    next.innerHTML = arrow;
    const dots = document.createElement("div");
    dots.className = "slider-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Pictures");
    const dotButtons = images.map((src, dotIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "View picture " + (dotIndex + 1));
      button.addEventListener("click", () => show(dotIndex));
      dots.appendChild(button);
      return button;
    });
    frame.append(img);
    stage.append(frame, dots);
    slider.append(prev, stage, next);
    gallery.appendChild(slider);
    if (images.length < 2) {
      prev.hidden = true;
      next.hidden = true;
      dots.hidden = true;
    }

    function show(nextIndex) {
      index = (nextIndex + images.length) % images.length;
      img.src = images[index];
      dotButtons.forEach((button, dotIndex) => {
        const on = dotIndex === index;
        button.classList.toggle("is-on", on);
        if (on) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
      const ahead = images[(index + 1) % images.length];
      if (ahead) {
        const preload = new Image();
        preload.src = ahead;
      }
    }

    function onKey(event) {
      if (!slider.isConnected || images.length < 2) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        show(index + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        show(index - 1);
      }
    }

    function onPointerDown(event) {
      if (event.target.closest("button")) return;
      startX = event.clientX;
    }

    function onPointerUp(event) {
      if (startX == null || images.length < 2) {
        startX = null;
        return;
      }
      const delta = event.clientX - startX;
      startX = null;
      if (delta > 42) show(index - 1);
      else if (delta < -42) show(index + 1);
    }

    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    frame.addEventListener("pointerdown", onPointerDown);
    frame.addEventListener("pointerup", onPointerUp);
    frame.addEventListener("pointercancel", () => {
      startX = null;
    });
    window.addEventListener("keydown", onKey);
    show(0);

    return {
      destroy() {
        window.removeEventListener("keydown", onKey);
      },
    };
  }

  window.HanseoGallery = { open };
})();
