/*
  AstaNed — wysyłka formularza (Formspree)
  - bez backendu
  - walidacja przeglądarki + wysyłka fetch
  - komunikaty sukces/błąd
  - honeypot: pole _gotcha (bez ujawniania e-maila w JS)
*/

(function () {
  "use strict";

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.dataset.type = type || "info";
  }

  function disableSubmit(form, disabled) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = disabled;
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  function getStatusEl(form) {
    return form.querySelector(".form-status");
  }

  function isHoneypotFilled(form) {
    var hp = form.querySelector('input[name="_gotcha"]');
    if (!hp) return false;
    return String(hp.value || "").trim().length > 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    var form = e.currentTarget;
    var statusEl = getStatusEl(form);

    if (isHoneypotFilled(form)) {
      // Cicho ignorujemy potencjalny spam.
      setStatus(statusEl, "Dziękujemy, wiadomość została wysłana.", "success");
      form.reset();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var action = form.getAttribute("action") || "";
    if (!action || action.indexOf("formspree.io") === -1 || action.indexOf("REPLACE_WITH_YOUR_FORM_ID") !== -1) {
      setStatus(
        statusEl,
        "Formularz nie jest jeszcze skonfigurowany. Uzupełnij adres Formspree w atrybucie action.",
        "error"
      );
      return;
    }

    disableSubmit(form, true);
    setStatus(statusEl, "Wysyłanie wiadomości…", "info");

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json",
      },
    })
      .then(function (res) {
        if (res.ok) return res.json();
        return res.json().then(function (data) {
          throw data;
        });
      })
      .then(function () {
        setStatus(statusEl, "Dziękujemy, wiadomość została wysłana.", "success");
        form.reset();
      })
      .catch(function () {
        setStatus(
          statusEl,
          "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę lub skontaktuj się telefonicznie.",
          "error"
        );
      })
      .finally(function () {
        disableSubmit(form, false);
      });
  }

  function init() {
    var forms = document.querySelectorAll("form[data-formspree]");
    if (!forms || !forms.length) return;
    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", handleSubmit);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
