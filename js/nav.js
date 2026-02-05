/* ============================================
   Navigation - Shared across all pages
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
});

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.main-nav');

    if (!navToggle || !navLinks) return;

    // Mobile menu toggle
    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for in-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Nav shadow on scroll
    if (nav) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                nav.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
            } else {
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // Highlight current page in nav
    highlightCurrentPage();
}

function highlightCurrentPage() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a[data-page]');

    links.forEach(link => {
        const page = link.getAttribute('data-page');
        if (path.endsWith(page) || (page === 'index.html' && (path.endsWith('/') || path === ''))) {
            link.classList.add('active');
        }
    });
}
