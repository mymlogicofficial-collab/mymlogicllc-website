/* ============================================
   MYM LOGIC LLC — WEBSITE JAVASCRIPT
   ============================================ */

// ============================================
// Initialize on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
});

// ============================================
// Scroll Animations
// ============================================

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections for fade-in animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe lab items
    document.querySelectorAll('.lab-item').forEach(item => {
        observer.observe(item);
    });

    // Observe robotix items
    document.querySelectorAll('.robotix-item').forEach(item => {
        observer.observe(item);
    });

    // Observe studio cards
    document.querySelectorAll('.studio-card').forEach(card => {
        observer.observe(card);
    });
}

// ============================================
// Smooth Scroll for Navigation Links
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// Donate Button Handler
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const donateBtn = document.querySelector('.donate-btn');
    if (donateBtn) {
        donateBtn.addEventListener('click', function(e) {
            // e.preventDefault();
            // Add your donation logic here (Stripe, PayPal, etc.)
            console.log('Donate button clicked');
        });
    }
});

// ============================================
// Utility: Add New Lab Item
// ============================================

function addLabItem(title, description, imageSrc, status = "Active Build", demoUrl = "#") {
    const labSection = document.querySelector('.lab-section .container');
    const labNote = document.querySelector('.lab-note');
    
    const newItem = document.createElement('div');
    newItem.className = 'lab-item';
    newItem.innerHTML = `
        <div class="lab-content">
            <div class="lab-text">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="lab-meta">
                    <span class="status">Status: ${status}</span>
                    <a href="${demoUrl}" class="demo-link">Demo</a>
                </div>
            </div>
            <div class="lab-images">
                <img src="${imageSrc}" alt="${title}" class="lab-image">
            </div>
        </div>
    `;
    
    // Insert before lab-note
    labSection.insertBefore(newItem, labNote);
    
    // Trigger animation
    setTimeout(() => {
        newItem.classList.add('animate-in');
    }, 10);
}

// Example usage:
// addLabItem("New Project", "Description here", "image.jpg", "Active Build", "#");

// ============================================
// Utility: Add New Robotix Item
// ============================================

function addRobotixItem(title, description, imageSrc, status = "Active Development") {
    const robotixGrid = document.querySelector('.robotix-grid');
    
    const newItem = document.createElement('div');
    newItem.className = 'robotix-item';
    newItem.innerHTML = `
        <div class="robotix-image-wrapper">
            <img src="${imageSrc}" alt="${title}" class="robotix-image">
        </div>
        <div class="robotix-content">
            <h3>${title}</h3>
            <p>${description}</p>
            <span class="status">Status: ${status}</span>
        </div>
    `;
    
    robotixGrid.appendChild(newItem);
    
    // Trigger animation
    setTimeout(() => {
        newItem.classList.add('animate-in');
    }, 10);
}

// Example usage:
// addRobotixItem("New Robot", "Description here", "robot.jpg", "Active Development");
