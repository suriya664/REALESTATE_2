$(document).ready(function () {
  "use strict";

  // Theme Toggle Functionality
  (function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Theme toggle click handler
    if (themeToggle) {
      themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Switching theme from', currentTheme, 'to', newTheme);
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
      });
    } else {
      console.error('Theme toggle button not found!');
    }
    
    function updateThemeIcon(theme) {
      if (themeIcon) {
        if (theme === 'dark') {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
        } else {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
        }
      }
    }
  })();

  // Highlight active navigation link or button based on body data attribute
  const currentPage = $("body").data("page");
  if (currentPage) {
    const $matches = $(`[data-page="${currentPage}"]`);
    $matches.each(function () {
      const $el = $(this);
      $el.addClass("active");

      if ($el.hasClass("nav-link") || $el.hasClass("dropdown-toggle")) {
        $el.attr("aria-current", "page");
      }

      if ($el.hasClass("dropdown-item")) {
        $el.closest(".dropdown").find(".dropdown-toggle").addClass("active").attr("aria-current", "page");
      }

      if ($el.hasClass("dropdown-toggle")) {
        $el
          .closest(".dropdown")
          .find(`.dropdown-item[data-page="${currentPage}"]`)
          .addClass("active");
      }
    });
  }

  // Smooth scroll for anchor links
  $('a[href*="#"]').on("click", function (event) {
    const target = $(this.getAttribute("href"));
    if (target.length) {
      event.preventDefault();
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: target.offset().top - 72,
          },
          600
        );
    }
  });

  // Equal height cards for testimonials, services, and property cards
  function equalizeHeights(selector) {
    let maxHeight = 0;
    const elements = $(selector);
    elements.css("height", "auto");
    elements.each(function () {
      maxHeight = Math.max(maxHeight, $(this).outerHeight());
    });
    elements.css("height", maxHeight);
  }

  function runEqualizers() {
    equalizeHeights(".testimonial-card");
    equalizeHeights(".service-card");
    equalizeHeights(".property-card");
    equalizeHeights(".featured-card");
    equalizeHeights(".listing-card .content");
  }

  runEqualizers();
  $(window).on("resize", function () {
    clearTimeout(window.equalizeTimer);
    window.equalizeTimer = setTimeout(runEqualizers, 200);
  });

  // Generic AJAX form handler
  function attachAjaxForm(formSelector) {
    const $form = $(formSelector);
    if (!$form.length) return;

    const $success = $form.find(".success-message");
    const $error = $form.find(".error-message");

    $form.on("submit", function (event) {
      event.preventDefault();
      $success.hide();
      $error.hide();

      const isValid = validateForm($form);
      if (!isValid) {
        $error.text("Please complete all required fields before submitting.").fadeIn();
        return;
      }

      const formData = $form.serialize();
      $.ajax({
        url: "https://jsonplaceholder.typicode.com/posts",
        method: "POST",
        data: formData,
        beforeSend: function () {
          $form.find("button[type=submit]").prop("disabled", true).text("Submitting...");
        },
        success: function () {
          $success.fadeIn();
          $form[0].reset();
        },
        error: function () {
          $error.text("Something went wrong. Please try again later.").fadeIn();
        },
        complete: function () {
          $form.find("button[type=submit]").prop("disabled", false).text($form.data("submit-text"));
        },
      });
    });
  }

  function validateForm($form) {
    let valid = true;
    $form.find("[required]").each(function () {
      const $field = $(this);
      if (!$field.val() || ($field.is(":checkbox") && !$field.is(":checked"))) {
        valid = false;
        $field.addClass("is-invalid");
      } else {
        $field.removeClass("is-invalid");
      }
    });
    return valid;
  }

  attachAjaxForm("#contactForm");
  attachAjaxForm("#addPropertyForm");
  attachAjaxForm("#loginForm");
  attachAjaxForm("#registerForm");
  attachAjaxForm("#footerNewsletter");
  attachAjaxForm("#propertyInquiryForm");
  attachAjaxForm("#agentInquiryForm");
  attachAjaxForm("#serviceProposalForm");

  // Reset invalid state on input
  $("input, textarea, select").on("input change", function () {
    $(this).removeClass("is-invalid");
  });

  // Animate counters on scroll
  const counterSection = $(".stat-card");
  if (counterSection.length) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const $counter = $(entry.target).find(".counter");
            const target = parseInt($counter.data("target"), 10);
            const prefix = $counter.data("prefix") || "";
            const suffix = $counter.data("suffix") || "";
            $({ countNum: 0 }).animate(
              { countNum: target },
              {
                duration: 2000,
                easing: "swing",
                step: function () {
                  const value = Math.floor(this.countNum).toLocaleString();
                  $counter.text(`${prefix}${value}${suffix}`);
                },
                complete: function () {
                  const value = target.toLocaleString();
                  $counter.text(`${prefix}${value}${suffix}`);
                },
              }
            );
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counterSection.each(function () {
      observer.observe(this);
    });
  }

  // Navbar shrink on scroll
  const $navbar = $(".navbar");
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 10) {
      $navbar.addClass("navbar-scrolled");
    } else {
      $navbar.removeClass("navbar-scrolled");
    }
  });

  // Footer year update
  const $year = $("#currentYear");
  if ($year.length) {
    $year.text(new Date().getFullYear());
  }

  // Property listing filters and sorting
  const $listingGrid = $("#listingGrid");
  if ($listingGrid.length) {
    let currentFilter = "all";
    let currentSort = "featured";
    let currentStatus = "all";
    
    // Store original order
    const $allCards = $listingGrid.find(".listing-card");
    $allCards.each(function (index) {
      $(this).data("original-index", index);
    });

    // Filter pills click handler
    $(".filter-pill").on("click", function () {
      $(".filter-pill").removeClass("active");
      $(this).addClass("active");
      currentFilter = $(this).data("filter") || "all";
      applyFilters();
    });

    // Sort select handler
    $("#sortSelect").on("change", function () {
      currentSort = $(this).val();
      applyFilters();
    });

    // Status select handler
    $("#statusSelect").on("change", function () {
      currentStatus = $(this).val();
      applyFilters();
    });

    function applyFilters() {
      const $cards = $listingGrid.find(".listing-card");
      
      // Filter and show/hide cards
      $cards.each(function () {
        const $card = $(this);
        const category = $card.data("category");
        const status = $card.data("status");
        
        let show = true;
        
        // Filter by category
        if (currentFilter !== "all" && category !== currentFilter) {
          show = false;
        }
        
        // Filter by status
        if (currentStatus !== "all" && status !== currentStatus) {
          show = false;
        }
        
        if (show) {
          $card.fadeIn(300);
        } else {
          $card.fadeOut(300);
        }
      });

      // Sort visible cards
      const $visibleCards = $cards.filter(":visible").toArray();
      
      $visibleCards.sort(function (a, b) {
        const $a = $(a);
        const $b = $(b);

        if (currentSort === "price-low") {
          return parseInt($a.data("price")) - parseInt($b.data("price"));
        } else if (currentSort === "price-high") {
          return parseInt($b.data("price")) - parseInt($a.data("price"));
        } else if (currentSort === "newest") {
          // For newest, reverse the original order (last = newest)
          return $b.data("original-index") - $a.data("original-index");
        }
        // Default: featured (original order)
        return $a.data("original-index") - $b.data("original-index");
      });

      // Reorder in DOM
      $visibleCards.forEach(function (card) {
        $listingGrid.append(card);
      });
    }
  }

  // Image fallback handler to prevent broken thumbnails
  const defaultFallback = "assets/images/property-1.svg";
  $("img").on("error", function () {
    const $img = $(this);
    const fallback = $img.data("fallback") || defaultFallback;
    if ($img.attr("src") !== fallback) {
      $img.attr("src", fallback);
    }
  });

  // Newsletter submission
  const $newsletterForm = $("#footerNewsletter");
  if ($newsletterForm.length) {
    const $success = $newsletterForm.siblings(".success-message");
    const $error = $newsletterForm.siblings(".error-message");
    $newsletterForm.attr("data-submit-text", "Subscribe");

    $newsletterForm.on("submit", function (event) {
      event.preventDefault();
      $success.hide();
      $error.hide();

      const email = $(this).find("input[type=email]").val();
      if (!email) {
        $error.text("Please enter a valid email address.").fadeIn();
        return;
      }

      $.ajax({
        url: "https://jsonplaceholder.typicode.com/posts",
        method: "POST",
        data: { email },
        beforeSend: () => {
          $newsletterForm.find("button[type=submit]").prop("disabled", true).text("Subscribing...");
        },
        success: () => {
          $success.fadeIn();
          $newsletterForm[0].reset();
        },
        error: () => {
          $error.text("Unable to subscribe. Try again later.").fadeIn();
        },
        complete: () => {
          $newsletterForm.find("button[type=submit]").prop("disabled", false).text($newsletterForm.data("submit-text"));
        },
      });
    });
  }
});

