(function () {
  function linkify(text, parent) {
    const pattern = /https?:\/\/[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(text))) {
      const raw = match[0];
      const visible = raw.replace(/[),.:;]+$/, "");
      if (match.index > last) parent.appendChild(document.createTextNode(text.slice(last, match.index)));
      const anchor = document.createElement("a");
      anchor.textContent = visible;
      if (visible.includes("@") && !visible.startsWith("http")) anchor.href = "mailto:" + visible;
      else {
        anchor.href = visible;
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
      }
      parent.appendChild(anchor);
      if (visible.length < raw.length) parent.appendChild(document.createTextNode(raw.slice(visible.length)));
      last = match.index + raw.length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function paragraphs(source) {
    return source
      .split(/\n\s*\n/)
      .map((block) => block.replace(/^\n+|\n+$/g, ""))
      .filter((block) => block.trim() !== "");
  }

  function fill(parent, blocks, labelFirst) {
    blocks.forEach((block, index) => {
      const el = document.createElement("p");
      if (labelFirst && index === 0 && !block.includes("\n") && !/@|https?:/.test(block)) {
        el.className = "info-label";
      }
      block.split("\n").forEach((line, lineIndex) => {
        if (lineIndex) el.appendChild(document.createElement("br"));
        linkify(line, el);
      });
      parent.appendChild(el);
    });
  }

  function split(source) {
    const buckets = { left: [], contact: [], note: [] };
    let key = "left";
    String(source || "")
      .split(/\n/)
      .forEach((line) => {
        const mark = line.trim();
        if (mark === "::contact") {
          key = "contact";
          return;
        }
        if (mark === "::note") {
          key = "note";
          return;
        }
        buckets[key].push(line);
      });
    return {
      left: paragraphs(buckets.left.join("\n")),
      contact: paragraphs(buckets.contact.join("\n")),
      note: paragraphs(buckets.note.join("\n")),
    };
  }

  function render(root, source) {
    root.replaceChildren();
    const parts = split(source);
    const info = document.createElement("div");
    info.className = "info";
    const left = document.createElement("div");
    left.className = "info-col";
    const right = document.createElement("div");
    right.className = "info-col";
    fill(left, parts.left, false);
    fill(right, parts.contact, true);
    info.append(left, right);
    if (parts.note.length) {
      const note = document.createElement("div");
      note.className = "info-note";
      fill(note, parts.note, false);
      info.appendChild(note);
    }
    root.appendChild(info);
    return { destroy() {} };
  }

  window.HanseoInfo = { render };
})();
