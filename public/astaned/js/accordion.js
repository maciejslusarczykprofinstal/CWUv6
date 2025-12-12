/*
  AstaNed — minimalny JavaScript
  - Accordion (rozwijane sekcje oferty)
  - Ustawienie roku w stopce
*/

(function () {
  "use strict";

  // Accordion
  var root = document.querySelector("[data-accordion]");
  if (root) {
    var triggers = Array.prototype.slice.call(root.querySelectorAll(".acc-trigger"));

    // Stan początkowy wynika z HTML (aria-expanded).
    // Jeśli w HTML ustawisz aria-expanded="true", panel będzie widoczny od razu.
    triggers.forEach(function (btn) {
      var item = btn.closest(".acc-item");
      var panel = item ? item.querySelector(".acc-panel") : null;
      if (!panel) return;

      var expanded = btn.getAttribute("aria-expanded") === "true";
      panel.hidden = !expanded;
    });

    // Przełączanie kliknięciem (zostawiamy możliwość zwinięcia/rozwinięcia).
    triggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".acc-item");
        var panel = item ? item.querySelector(".acc-panel") : null;
        if (!panel) return;

        var expanded = btn.getAttribute("aria-expanded") === "true";
        var next = !expanded;

        btn.setAttribute("aria-expanded", next ? "true" : "false");
        panel.hidden = !next;
      });
    });
  }

  // Rok w stopce
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
