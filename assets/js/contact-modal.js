/* ---------------------------------------------------------------------------
   Vantiro — contact popup

   Every "talk to us / book a demo / contact us" CTA on the site carries a
   data-v-contact="<context>" attribute and opens this modal instead of
   navigating anywhere.

   The modal markup lives here so the three pages stay in sync: edit it once,
   it changes everywhere.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  /* =========================================================================
     >>> HUBSPOT — THE ONLY THING YOU NEED TO FILL IN <<<

     Paste the three values from your HubSpot embed code here and the form
     renders inside the popup. Leave them empty and the popup falls back to
     the phone number below, so nothing is broken in the meantime.

     HubSpot gives you a snippet that looks like this:

       hbspt.forms.create({
         region:   "eu1",
         portalId: "12345678",
         formId:   "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
       });

     The embed script is loaded only when someone actually opens the popup —
     no HubSpot cookies are dropped on visitors who never ask to be contacted.
     ========================================================================= */
  var HUBSPOT = {
    region: "eu1",   // "na1" for US portals, "eu1" for EU portals
    portalId: "147621238",    // e.g. "12345678"
    formId: "f1ce8d62-3cb1-4048-a221-aa1076e80b06"       // e.g. "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
  };

  // Optional: a hidden field in the HubSpot form that records which button was
  // clicked ("demo", "expert", ...). Create it in HubSpot with this internal
  // name, or leave it — it is skipped when the field does not exist.
  var CONTEXT_FIELD = "vantiro_context";

  var PHONE = "+39 0547 174 0026";
  var PHONE_HREF = "tel:+3905471740026";

  /* Headline + subline per CTA, keyed on data-v-contact. */
  var COPY = {
    expert: {
      title: "Talk to an expert",
      sub: "Tell us about your systems and your data. We'll come back with a concrete view of what Vantiro can connect, simplify, and accelerate."
    },
    demo: {
      title: "Book a demo",
      sub: "See how our SaaS solutions integrate with the tools you already run — walked through by someone who has done it before."
    },
    contact: {
      title: "Get in touch",
      sub: "Questions about our solutions, integrations, or roadmap? Leave your details and we'll get back to you shortly."
    },
    roadmap: {
      title: "Be first to know what's next",
      sub: "We're continuously expanding the Vantiro SaaS portfolio. Tell us what you need and we'll keep you posted as new solutions ship."
    }
  };

  var PATH_PREFIX = location.pathname.indexOf("/privacy-policy") === 0 ? "../" : "";

  var modalEl = null;
  var modalInstance = null;
  var formRequested = false;

  function markup() {
    return [
      '<div class="modal fade v-modal" id="vContactModal" tabindex="-1" aria-labelledby="vContactTitle" aria-hidden="true">',
      '  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">',
      '    <div class="modal-content">',
      '      <div class="modal-header">',
      '        <div>',
      '          <img class="v-modal-mark" src="' + PATH_PREFIX + 'assets/img/vantiro-logo-light.png" alt="Vantiro" width="142" height="34" />',
      '          <h2 class="v-modal-title" id="vContactTitle">Talk to an expert</h2>',
      '          <p class="v-modal-sub" id="vContactSub"></p>',
      '        </div>',
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
      '      </div>',
      '      <div class="modal-body">',
      '        <!-- HubSpot form is rendered in here -->',
      '        <div id="vContactFormTarget"></div>',
      '      </div>',
      '      <div class="modal-footer">',
      '        <div class="text-muted-v small">',
      '          <i class="bi bi-shield-lock me-1 text-accent"></i>',
      '          We only use your details to answer you. See our',
      '          <a class="text-accent text-decoration-none" href="/privacy-policy/">Privacy Policy</a>.',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function fallbackMarkup() {
    return [
      '<div class="v-form-fallback">',
      '  <div class="d-flex gap-3 align-items-start">',
      '    <i class="bi bi-telephone-fill fs-4"></i>',
      '    <div>',
      '      <div class="fw-semibold mb-1">Our contact form is being set up.</div>',
      '      <div class="text-muted-v mb-3">In the meantime, call us and we\'ll take it from there.</div>',
      '      <a class="v-contact-link fs-5" href="' + PHONE_HREF + '">' + PHONE + "</a>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");
  }

  function isConfigured() {
    return Boolean(HUBSPOT.portalId && HUBSPOT.formId);
  }

  function renderHubspotForm() {
    window.hbspt.forms.create({
      region: HUBSPOT.region,
      portalId: HUBSPOT.portalId,
      formId: HUBSPOT.formId,
      target: "#vContactFormTarget",
      onFormReady: function ($form) {
        var form = $form && $form.length ? $form[0] : $form;
        if (!form || !form.querySelector) return;
        var field = form.querySelector('input[name="' + CONTEXT_FIELD + '"]');
        if (field) field.value = modalEl.getAttribute("data-context") || "";
      }
    });
  }

  /* Loads the HubSpot embed script on first open, then renders the form. */
  function loadForm() {
    if (formRequested) return;
    formRequested = true;

    var target = document.getElementById("vContactFormTarget");

    if (!isConfigured()) {
      target.innerHTML = fallbackMarkup();
      return;
    }

    if (window.hbspt && window.hbspt.forms) {
      renderHubspotForm();
      return;
    }

    var s = document.createElement("script");
    s.src = "https://js.hsforms.net/forms/embed/v2.js";
    s.charset = "utf-8";
    s.async = true;
    s.onload = renderHubspotForm;
    s.onerror = function () {
      target.innerHTML = fallbackMarkup();
    };
    document.head.appendChild(s);
  }

  function open(context) {
    var copy = COPY[context] || COPY.contact;
    modalEl.setAttribute("data-context", context || "contact");
    document.getElementById("vContactTitle").textContent = copy.title;
    document.getElementById("vContactSub").textContent = copy.sub;
    loadForm();
    modalInstance.show();
  }

  function init() {
    if (document.getElementById("vContactModal")) return;

    var host = document.createElement("div");
    host.innerHTML = markup();
    modalEl = host.firstChild;
    document.body.appendChild(modalEl);
    modalInstance = new bootstrap.Modal(modalEl);

    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest) return;
      var trigger = e.target.closest("[data-v-contact]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger.getAttribute("data-v-contact"));
    });

    // Anyone can open it from the console or a future link: Vantiro.openContact("demo")
    window.Vantiro = window.Vantiro || {};
    window.Vantiro.openContact = open;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
