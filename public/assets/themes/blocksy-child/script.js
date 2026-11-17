console.log("scripts loading");

/* =====================================================
   HEADER SCRIPTS (NEW VERSION + FIXED DOCTORS)
===================================================== */
document.addEventListener('DOMContentLoaded', function () {

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileTreatmentsBtn = document.getElementById('mobileTreatmentsBtn');
    const mobileMegaMenu = document.getElementById('mobileMegaMenu');
    const treatmentsArrow = document.getElementById('treatmentsArrow');
    const topLine = document.querySelector('.top-line');
    const bottomLine = document.querySelector('.bottom-line');

    // Desktop – Treatments
    const desktopTreatmentsBtn = document.getElementById('desktopTreatmentsBtn');
    const desktopMegaMenu = document.getElementById('desktopMegaMenu');
    const desktopArrow = document.getElementById('desktopArrow');

    // Desktop – Resources
    const desktopResourcesBtn = document.getElementById('desktopResourcesBtn');
    const desktopResourcesMenu = document.getElementById('desktopResourcesMenu');
    const desktopResourcesArrow = document.getElementById('desktopResourcesArrow');

    let isMenuOpen = false;
    let isTreatmentsOpen = false;

    // 🔑 GLOBAL DESKTOP STATE
    let openDesktopMenu = null;
    let openDesktopArrow = null;

    function closeActiveDesktopMenu() {
        if (openDesktopMenu && openDesktopArrow) {
            openDesktopMenu.classList.add('opacity-0', 'invisible');
            openDesktopArrow.style.transform = 'rotate(0deg)';
            openDesktopMenu = null;
            openDesktopArrow = null;
        }
    }

    /* ---------------------------
       DESKTOP – TREATMENTS
    --------------------------- */
    desktopTreatmentsBtn?.addEventListener('click', function (e) {
        e.stopPropagation();

        if (openDesktopMenu === desktopMegaMenu) {
            closeActiveDesktopMenu();
            return;
        }

        closeActiveDesktopMenu();
        desktopMegaMenu.classList.remove('opacity-0', 'invisible');
        desktopArrow.style.transform = 'rotate(180deg)';

        openDesktopMenu = desktopMegaMenu;
        openDesktopArrow = desktopArrow;
    });

    desktopMegaMenu?.addEventListener('click', e => e.stopPropagation());

    /* ---------------------------
       DESKTOP – RESOURCES
    --------------------------- */
    desktopResourcesBtn?.addEventListener('click', function (e) {
        e.stopPropagation();

        if (openDesktopMenu === desktopResourcesMenu) {
            closeActiveDesktopMenu();
            return;
        }

        closeActiveDesktopMenu();
        desktopResourcesMenu.classList.remove('opacity-0', 'invisible');
        desktopResourcesArrow.style.transform = 'rotate(180deg)';

        openDesktopMenu = desktopResourcesMenu;
        openDesktopArrow = desktopResourcesArrow;
    });

    desktopResourcesMenu?.addEventListener('click', e => e.stopPropagation());

    /* ---------------------------
       DESKTOP – OTHER DROPDOWNS
       (Doctors FIXED HERE)
    --------------------------- */
    document.querySelectorAll("[id^='desktop'][id$='Btn']").forEach(btn => {

        if (
            btn.id === 'desktopTreatmentsBtn' ||
            btn.id === 'desktopResourcesBtn'
        ) return;

        const base = btn.id.replace('Btn', '');
        const menu = document.getElementById(base + 'Menu');
        const arrow = document.getElementById(base + 'Arrow');
        if (!menu || !arrow) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            if (openDesktopMenu === menu) {
                closeActiveDesktopMenu();
                return;
            }

            closeActiveDesktopMenu();
            menu.classList.remove('opacity-0', 'invisible');
            arrow.style.transform = 'rotate(180deg)';

            openDesktopMenu = menu;
            openDesktopArrow = arrow;
        });

        menu.addEventListener('click', e => e.stopPropagation());
    });

    document.addEventListener('click', closeActiveDesktopMenu);

    /* ---------------------------
       MOBILE MAIN MENU
    --------------------------- */
    mobileMenuBtn?.addEventListener('click', function () {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
            mobileMenu.classList.remove('max-h-0', 'opacity-0');
            mobileMenu.style.maxHeight = '100vh';
            topLine.style.transform = "translateY(6px) rotate(45deg)";
            bottomLine.style.transform = "translateY(-6px) rotate(-45deg)";
        } else {
            mobileMenu.classList.add('max-h-0', 'opacity-0');
            mobileMenu.style.maxHeight = '0';
            topLine.style.transform = "";
            bottomLine.style.transform = "";

            if (isTreatmentsOpen) {
                mobileMegaMenu.style.maxHeight = '0';
                treatmentsArrow.style.transform = 'rotate(0deg)';
                isTreatmentsOpen = false;
            }
        }
    });

    /* ---------------------------
       MOBILE – TREATMENTS
    --------------------------- */
    mobileTreatmentsBtn?.addEventListener('click', function () {
        isTreatmentsOpen = !isTreatmentsOpen;
        mobileMegaMenu.style.maxHeight = isTreatmentsOpen
            ? mobileMegaMenu.scrollHeight + 'px'
            : '0';
        treatmentsArrow.style.transform = isTreatmentsOpen
            ? 'rotate(90deg)'
            : 'rotate(0deg)';
    });
});

/* =====================================================
   SERVICES SCROLL
===================================================== */
function scrollToCard(index) {
    const container = document.getElementById('servicesScroll');
    if (!container) return;

    const cards = container.querySelectorAll('.pv-service-card');
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 16;

    container.scrollTo({
        left: (cardWidth + gap) * index,
        behavior: 'smooth'
    });

    updateDots(index);
}

function updateDots(activeIndex) {
    document.querySelectorAll('.pv-dot').forEach((dot, index) => {
        dot.classList.toggle('bg-[#0595C4]', index === activeIndex);
        dot.classList.toggle('w-8', index === activeIndex);
        dot.classList.toggle('bg-gray-300', index !== activeIndex);
    });
}

/* =====================================================
   VIDEO TESTIMONIALS
===================================================== */
window.addEventListener("load", function () {
    const cards = document.querySelectorAll('.vt-card-9x7k');
    const scrollContainer = document.querySelector('.vt-container-9x7k');
    const dots = document.querySelectorAll('.vt-dot-9x7k');
    const isMobile = window.innerWidth <= 768;

    cards.forEach(card => {
        const video = card.querySelector('.vt-video-9x7k');
        if (!video) return;

        if (!isMobile) {
            card.addEventListener('mouseenter', () => {
                video.muted = true;
                video.play().catch(() => {});
            });

            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });

            video.addEventListener('click', () => {
                video.muted = false;
                video.controls = true;
            });
        } else {
            video.addEventListener('click', () => {
                video.controls = true;
                video.muted = false;
            });
        }
    });

    if (isMobile && dots.length && scrollContainer) {
        scrollContainer.addEventListener('scroll', () => {
            const cardWidth = cards[0].offsetWidth + 20;
            const index = Math.round(scrollContainer.scrollLeft / cardWidth);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        });
    }
});

/* =====================================================
   LOCATIONS SLIDER
===================================================== */
function initLocationsSlider() {
    const slider = document.getElementById("locationCarousel");
    const dots = document.querySelectorAll("#dots .dot");
    if (!slider) return;

    function updateDots() {
        const cardWidth = slider.children[0].offsetWidth + 16;
        const index = Math.round(slider.scrollLeft / cardWidth);

        dots.forEach((dot, i) => {
            dot.classList.toggle("w-12", i === index);
            dot.classList.toggle("bg-[#0A6465]", i === index);
            dot.classList.toggle("w-8", i !== index);
            dot.classList.toggle("bg-gray-400", i !== index);
        });
    }

    slider.addEventListener("scroll", updateDots);
    updateDots();
}

/* =====================================================
   FOUNDER MESSAGE
===================================================== */
function pv_initFounderMessage() {
    const btn = document.getElementById("pv_toggle_btn");
    const paras = document.querySelectorAll(".pv_toggle_paragraph");
    if (!btn || !paras.length) return;

    let expanded = false;

    function render() {
        if (window.innerWidth < 768) {
            paras.forEach((p, i) => p.classList.toggle("hidden", !expanded && i > 0));
            btn.textContent = expanded ? "View Less" : "View More";
            btn.style.display = "block";
        } else {
            paras.forEach(p => p.classList.remove("hidden"));
            btn.style.display = "none";
        }
    }

    btn.addEventListener("click", () => {
        expanded = !expanded;
        render();
    });

    window.addEventListener("resize", render);
    render();
}

/* =====================================================
   DOCTORS SLIDER
===================================================== */
function pv_initDoctorsSlider() {
    const slider = document.getElementById("doctorCarousel");
    const dots = document.querySelectorAll("#doctorDots .dot");
    if (!slider) return;

    function updateDots() {
        const cardWidth = slider.children[0].offsetWidth + 16;
        const index = Math.round(slider.scrollLeft / cardWidth);

        dots.forEach((dot, i) => {
            dot.classList.toggle("w-14", i === index);
            dot.classList.toggle("bg-[#0A6465]", i === index);
        });
    }

    slider.addEventListener("scroll", updateDots);
    updateDots();
}

/* =====================================================
   DOCTOR TALKS
===================================================== */
function pv_initDoctorTalks() {
    const carousel = document.getElementById("talkCarousel");
    const next = document.getElementById("nextTalk");
    const prev = document.getElementById("prevTalk");
    if (!carousel || !next || !prev) return;

    const scrollAmount = () => carousel.children[0].offsetWidth + 16;

    next.addEventListener("click", () =>
        carousel.scrollBy({ left: scrollAmount(), behavior: "smooth" })
    );

    prev.addEventListener("click", () =>
        carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" })
    );
}

/* =====================================================
   GLOBAL MODAL
===================================================== */
document.addEventListener("click", function (e) {
    const modal = document.getElementById("globalModal");
    if (!modal) return;

    if (e.target.closest(".open-modal")) {
        e.preventDefault();
        modal.classList.remove("hidden");
        modal.offsetHeight;
        modal.classList.add("show");
    }

    if (e.target.closest(".modal-close") || e.target === modal) {
        closeModal(modal);
    }
});

function closeModal(modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);
}

/* =====================================================
   FINAL INIT
===================================================== */
window.addEventListener("load", () => {
    initLocationsSlider();
    pv_initFounderMessage();
    pv_initDoctorsSlider();
    pv_initDoctorTalks();
});


// Navigation functionality for Praana Vaidya header
// Navigation functionality for Praana Vaidya header
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // DESKTOP NAVIGATION
    // ========================================
    // Desktop navigation hover effect with delayed close and immediate close for other menus
const navToggles = document.querySelectorAll('.nav-toggle');
const megaMenus = document.querySelectorAll('.mega-menu');
let currentOpenMenu = null;
let closeTimer = null;  // To hold the timeout ID

// Desktop dropdown hover handling
navToggles.forEach(toggle => {
    const menuName = toggle.getAttribute('data-menu');
    const targetMenu = document.getElementById(`menu-${menuName}`);
    const arrow = toggle.querySelector('.nav-arrow');

    toggle.addEventListener('mouseenter', function(e) {
        e.stopPropagation();
        
        // Clear any existing close timer
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }

        // Close any currently open menu immediately
        if (currentOpenMenu && currentOpenMenu !== targetMenu) {
            const currentArrow = document.querySelector(`[data-menu="${currentOpenMenu.id.replace('menu-', '')}"] .nav-arrow`);
            closeDesktopMenu(currentOpenMenu, currentArrow);
        }

        // Open the new menu immediately
        openDesktopMenu(targetMenu, arrow, toggle);
        currentOpenMenu = targetMenu; // Set the current open menu to the new one
    });

    toggle.addEventListener('mouseleave', function(e) {
        const relatedTarget = e.relatedTarget;

        // Start a timeout to close the menu after 1 seconds if the mouse leaves
        closeTimer = setTimeout(() => {
            if (!targetMenu.contains(relatedTarget)) {
                closeDesktopMenu(targetMenu, arrow);
                currentOpenMenu = null;
            }
        }, 500);  // 1000 milliseconds = 1 seconds
    });

    // Ensure the menu stays open when hovering over the menu itself
    targetMenu.addEventListener('mouseenter', function() {
        // Clear any pending timeout to close the menu
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }
    });

    // Close the menu after 1 seconds if mouse leaves both the toggle and the menu
    targetMenu.addEventListener('mouseleave', function(e) {
        const relatedTarget = e.relatedTarget;

        // Start a timeout to close the menu after 2 seconds if the mouse leaves the menu
        closeTimer = setTimeout(() => {
            if (!toggle.contains(relatedTarget)) {
                closeDesktopMenu(targetMenu, arrow);
                currentOpenMenu = null;
            }
        }, 500);  // 1000 milliseconds = 1 seconds
    });
});

// Close desktop menus when clicking outside
document.addEventListener('click', function(e) {
    if (currentOpenMenu && !e.target.closest('.nav-item') && !e.target.closest('.mega-menu') && !e.target.closest('.dropdown-menu')) {
        const currentArrow = document.querySelector(`[data-menu="${currentOpenMenu.id.replace('menu-', '')}"] .nav-arrow`);
        closeDesktopMenu(currentOpenMenu, currentArrow);
        currentOpenMenu = null;
    }
});

function openDesktopMenu(menu, arrow, toggleElement) {
    // Position dropdown menus relative to their toggle button
    if (menu.classList.contains('dropdown-menu') && toggleElement) {
        const toggleRect = toggleElement.getBoundingClientRect();
        const parentLi = toggleElement.closest('li');
        
        if (parentLi) {
            const liRect = parentLi.getBoundingClientRect();
            // Position the dropdown under the parent li element
            menu.style.left = liRect.left + 'px';
            menu.style.top = liRect.bottom + 'px';
        }
    }
    
    menu.classList.remove('opacity-0', 'invisible');
    menu.classList.add('opacity-100', 'visible');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
}

function closeDesktopMenu(menu, arrow) {
    menu.classList.add('opacity-0', 'invisible');
    menu.classList.remove('opacity-100', 'visible');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
}

    
    // ========================================
    // MOBILE NAVIGATION
    // ========================================
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const topLine = document.querySelector('.top-line');
    const bottomLine = document.querySelector('.bottom-line');
    
    let mobileMenuOpen = false;
    
    // Mobile menu toggle (hamburger)
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuOpen = !mobileMenuOpen;
        
        if (mobileMenuOpen) {
            // Open mobile menu
            mobileMenu.style.maxHeight = '100vh';
            mobileMenu.style.opacity = '1';
            
            // Animate hamburger to X
            topLine.style.transform = 'translateY(6px) rotate(45deg)';
            bottomLine.style.transform = 'translateY(-6px) rotate(-45deg)';
        } else {
            // Close mobile menu
            mobileMenu.style.maxHeight = '0';
            mobileMenu.style.opacity = '0';
            
            // Animate X back to hamburger
            topLine.style.transform = 'translateY(0) rotate(0)';
            bottomLine.style.transform = 'translateY(0) rotate(0)';
            
            // Close all submenus when closing main menu
            closeAllMobileSubmenus();
        }
    });
    
    // Mobile submenu toggles
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');
    
    mobileNavToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const menuName = this.getAttribute('data-mobile-menu');
            const targetSubmenu = document.getElementById(`mobile-menu-${menuName}`);
            const arrow = this.querySelector('.mobile-nav-arrow');
            
            // Check if this submenu is currently open
            const isOpen = targetSubmenu.style.maxHeight && targetSubmenu.style.maxHeight !== '0px';
            
            if (isOpen) {
                // Close this submenu
                closeMobileSubmenu(targetSubmenu, arrow);
            } else {
                // Close all other submenus first
                closeAllMobileSubmenus();
                
                // Open this submenu
                openMobileSubmenu(targetSubmenu, arrow);
            }
        });
    });
    
    function openMobileSubmenu(submenu, arrow) {
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
    
    function closeMobileSubmenu(submenu, arrow) {
        submenu.style.maxHeight = '0';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
    
    function closeAllMobileSubmenus() {
        const allSubmenus = document.querySelectorAll('.mobile-submenu');
        const allArrows = document.querySelectorAll('.mobile-nav-arrow');
        
        allSubmenus.forEach(submenu => {
            submenu.style.maxHeight = '0';
        });
        
        allArrows.forEach(arrow => {
            arrow.style.transform = 'rotate(0deg)';
        });
    }
    
    // ========================================
    // RESPONSIVE HANDLING
    // ========================================
    
    // Close mobile menu on window resize if going to desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 1024 && mobileMenuOpen) {
                // Reset mobile menu
                mobileMenuOpen = false;
                mobileMenu.style.maxHeight = '0';
                mobileMenu.style.opacity = '0';
                topLine.style.transform = 'translateY(0) rotate(0)';
                bottomLine.style.transform = 'translateY(0) rotate(0)';
                closeAllMobileSubmenus();
            }
            
            // Close desktop menus if going to mobile
            if (window.innerWidth < 1024 && currentOpenMenu) {
                const currentArrow = document.querySelector(`[data-menu="${currentOpenMenu.id.replace('menu-', '')}"] .nav-arrow`);
                closeDesktopMenu(currentOpenMenu, currentArrow);
                currentOpenMenu = null;
            }
        }, 250);
    });
    
});





document.addEventListener("DOMContentLoaded", function () {

    const track = document.getElementById("sliderTrack");
    const wrapper = document.getElementById("sliderWrapper");
    const slides = track.children;
    const totalSlides = slides.length;

    const video = document.getElementById("carouselVideo");
    const progressContainer = document.getElementById("videoProgressContainer");
    const progressBar = document.getElementById("videoProgressBar");

    let index = 0;
    let interval = null;
    let startX = 0;
    const slideDelay = 6000; // 👈 change speed here

    function goToSlide(i) {
        track.style.transform = `translateX(-${i * 100}%)`;
    }

    function startAutoSlide() {
        stopAutoSlide();
        interval = setInterval(() => {
            if (!isVideoSlide()) {
                nextSlide();
            }
        }, slideDelay);
    }

    function stopAutoSlide() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    function isVideoSlide() {
        return video && slides[index].contains(video);
    }

    function nextSlide() {

        index++;
        goToSlide(index);

        // Infinite reset
        if (index === totalSlides - 1) {
            setTimeout(() => {
                track.style.transition = "none";
                goToSlide(0);
                index = 0;
                setTimeout(() => {
                    track.style.transition = "transform 0.7s ease-in-out";
                }, 50);
            }, 700);
        }

        handleSlideChange();
    }

    function handleSlideChange() {

        if (isVideoSlide()) {

            stopAutoSlide();
            video.currentTime = 0;
            video.play();

        } else {

            if (video) {
                video.pause();
                video.currentTime = 0;
                progressBar.style.width = "0%";
            }

            startAutoSlide();
        }
    }

    // 🎬 When video ends
    if (video) {

        video.addEventListener("ended", function () {
            nextSlide();
        });

        // Progress bar update
        video.addEventListener("timeupdate", function () {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = percent + "%";
        });

        // Click to seek
        progressContainer.addEventListener("click", function (e) {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const seekTime = (clickX / width) * video.duration;
            video.currentTime = seekTime;
        });
    }

    // Pause on hover (desktop)
    wrapper.addEventListener("mouseenter", stopAutoSlide);
    wrapper.addEventListener("mouseleave", function () {
        if (!isVideoSlide()) {
            startAutoSlide();
        }
    });

    // Swipe Support
    wrapper.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        stopAutoSlide();
    });

    wrapper.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;

        if (startX - endX > 50) {
            nextSlide();
        } else if (endX - startX > 50) {
            index = Math.max(index - 1, 0);
            goToSlide(index);
            handleSlideChange();
        }

        if (!isVideoSlide()) {
            startAutoSlide();
        }
    });

    // Start slider initially
    handleSlideChange();
});
//to prevent text and image copy from site code starts here
// (function() {

//   // Disable Right Click
//   document.addEventListener("contextmenu", function(e){
//     e.preventDefault();
//   }, false);

//   // Disable Copy, Cut, Paste
//   document.addEventListener("copy", function(e){
//     e.preventDefault();
//   });
//   document.addEventListener("cut", function(e){
//     e.preventDefault();
//   });
//   document.addEventListener("paste", function(e){
//     e.preventDefault();
//   });

//   // Disable Text Selection
//   document.addEventListener("selectstart", function(e){
//     e.preventDefault();
//   });

//   // Disable Dragging Images
//   document.addEventListener("dragstart", function(e){
//     if (e.target.tagName === "IMG") {
//       e.preventDefault();
//     }
//   });

//   // Disable Keyboard Shortcuts
//   document.addEventListener("keydown", function(e){

//     // Block Ctrl combinations
//     if (e.ctrlKey && (
//         e.key === "c" || 
//         e.key === "u" || 
//         e.key === "s" || 
//         e.key === "a" || 
//         e.key === "p"
//     )) {
//         e.preventDefault();
//     }

//     // Block F12
//     if (e.key === "F12") {
//         e.preventDefault();
//     }

//   });

// })();

(function () {
  function init() {
    var codeEl    = document.getElementById('pvCaptchaCode');
    var inputEl   = document.getElementById('pv_captcha_input');
    var errorEl   = document.getElementById('pvCaptchaError');
    var refreshEl = document.getElementById('pvCaptchaRefresh');
    var form      = document.getElementById('pvApplicationForm');
    if (!form || !codeEl) return; // elements not on page yet

    var current = '';

    function generate() {
      var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
      var out = '';
      for (var i = 0; i < 6; i++) {
        out += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      current = out;
      codeEl.innerHTML = '';
      out.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.textContent = ch;
        var rot = (Math.random() * 24 - 12).toFixed(1);
        s.style.display = 'inline-block';
        s.style.transform = 'rotate(' + rot + 'deg)';
        codeEl.appendChild(s);
      });
      errorEl.textContent = '';
      inputEl.value = '';
    }

    refreshEl.addEventListener('click', generate);

    form.addEventListener('submit', function (e) {
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value.trim() !== '') { e.preventDefault(); return; }

      if (inputEl.value.trim().toUpperCase() !== current) {
        e.preventDefault();
        errorEl.textContent = 'The code does not match. Please try again.';
        inputEl.focus();
        generate();
      }
    });

    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

