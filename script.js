document.addEventListener('DOMContentLoaded', function () {
    // Initialize components after DOM is fully loaded
    initializeComponents();

    // Smooth scroll for navigation links with hash targets
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Smooth scroll for Call-To-Action button (e.g., "Get Started Today")
    document.querySelectorAll('button[data-target]').forEach(button => {
        button.addEventListener('click', function () {
            const targetSelector = this.getAttribute('data-target');
            const targetElement = document.querySelector(targetSelector);
    
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

function initializeComponents() {
    // Initialize AOS (Animate On Scroll) library for scroll-triggered animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 50
    });

    // Delay additional initializations to ensure AOS animations finish first
    setTimeout(() => {
        if (document.querySelector('.step-item')) {
            startStepAnimation(); // Step-by-step highlighting animation
        }

        initCarousel();            // Card carousel
        initReviewsCarousel();     // Testimonials/reviews slider
        setupNewsletterHandling(); // Newsletter sign-up button logic
        initStatCounters();        // Animated stats counter (when in view)
    }, 2000);
}

function initStatCounters() {
    const statSection = document.querySelector('.stats-section');
    if (!statSection) return;

    const statNumbers = document.querySelectorAll('.stat-number');

    // Define target values and suffixes (like %)
    const targetValues = [
        { value: 25356, suffix: '' },
        { value: 1050,  suffix: '' },
        { value: 12,    suffix: '' },
        { value: 95,    suffix: '%' }
    ];

    // Initialize counters to 0
    statNumbers.forEach((statNumber, index) => {
        statNumber.textContent = '0' + (targetValues[index].suffix || '');
        statNumber.dataset.target = targetValues[index].value;
        statNumber.dataset.suffix = targetValues[index].suffix || '';
    });

    // Only trigger counters when stats section becomes visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAllCounters();
                observer.unobserve(entry.target); // Only trigger once
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.8
    });

    observer.observe(statSection);
}

// Animate each stat counter from 0 to target value
function startAllCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const duration = 1000;

    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.dataset.target);
        const suffix = statNumber.dataset.suffix;
        const increment = target / (duration / 16);
        let current = 0;
        const startTime = Date.now();

        function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - (1 - progress) * (1 - progress); // easeOutQuad

            current = Math.floor(target * easedProgress);
            statNumber.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                statNumber.textContent = target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

// Cycles through "step items" like progress or tutorial steps
function startStepAnimation() {
    const steps = document.querySelectorAll('.step-item');
    if (!steps.length) return;

    const animationDuration = 3000;
    let currentStep = 0;

    steps[0].classList.add('active');

    setInterval(() => {
        steps[currentStep].classList.remove('active');
        currentStep = (currentStep + 1) % steps.length;
        steps[currentStep].classList.add('active');
    }, animationDuration);
}

function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const cards = document.querySelectorAll('.card');
    const progressBars = document.querySelectorAll('.progress-bar');

    let currentSlideIndex = 0;
    let currentCardIndex = 0;
    let slideWidth = slides[0].getBoundingClientRect().width;
    let progressInterval;
    const autoPlayDuration = 5000;
    const totalCards = cards.length;
    const cardsPerSlide = slides[0].querySelectorAll('.card').length;

    function updateTrack() {
        carouselTrack.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
        updateIndicators();
    }

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlideIndex);
        });
    }

    function activateCard(cardIndex) {
        cards.forEach(card => card.classList.remove('active'));
        progressBars.forEach(bar => bar.style.width = '0%');

        const slideIndex = Math.floor(cardIndex / cardsPerSlide);
        if (slideIndex !== currentSlideIndex) {
            currentSlideIndex = slideIndex;
            updateTrack();
        }

        currentCardIndex = cardIndex;
        const activeCard = cards[currentCardIndex];
        activeCard.classList.add('active');

        startProgress(progressBars[currentCardIndex]);
    }

    function startProgress(progressBar) {
        let startTime = Date.now();
        progressBar.style.width = '0%';

        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            let elapsedTime = Date.now() - startTime;
            let progress = (elapsedTime / autoPlayDuration) * 100;

            if (progress >= 100) {
                clearInterval(progressInterval);
                nextCard();
                return;
            }

            progressBar.style.width = `${progress}%`;
        }, 16);
    }

    function nextCard() {
        let nextCardIndex = (currentCardIndex + 1) % totalCards;
        activateCard(nextCardIndex);
    }

    function handleResize() {
        slideWidth = slides[0].getBoundingClientRect().width;
        updateTrack();
    }

    // Allow user to click indicators to change slides
    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const slideIndex = parseInt(indicator.dataset.index);
            currentSlideIndex = slideIndex;
            updateTrack();
            activateCard(slideIndex * cardsPerSlide);
        });
    });

    // Allow clicking on individual cards to activate them
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardIndex = parseInt(card.dataset.cardIndex);
            activateCard(cardIndex);
        });
    });

    // Initial setup
    updateTrack();
    activateCard(0);
    window.addEventListener('resize', handleResize);
}

function initReviewsCarousel() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    const prevButton = document.querySelector('.reviews-section .prev-button');
    const nextButton = document.querySelector('.reviews-section .next-button');
    const cards = document.querySelectorAll('.review-card');

    let currentIndex = 0;
    const visibleCards = getVisibleCardsCount();
    let maxIndex = Math.max(0, cards.length - visibleCards);

    // Get number of visible review cards based on screen size
    function getVisibleCardsCount() {
        return window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3;
    }

    function updateCarousel() {
        const cardWidth = cards[0].offsetWidth;
        const gapWidth = 30; // Match CSS gap
        const offset = -currentIndex * (cardWidth + gapWidth);
        container.style.transform = `translateX(${offset}px)`;

        if (prevButton) prevButton.disabled = currentIndex <= 0;
        if (nextButton) nextButton.disabled = currentIndex >= maxIndex;
    }

    // Button controls
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
    }

    // Recalculate positions and limits on window resize
    window.addEventListener('resize', function () {
        const newVisibleCards = getVisibleCardsCount();
        const newMaxIndex = Math.max(0, cards.length - newVisibleCards);
        if (currentIndex > newMaxIndex) {
            currentIndex = newMaxIndex;
        }
        maxIndex = newMaxIndex;
        updateCarousel();
    });

    updateCarousel();
}

function setupNewsletterHandling() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            alert('Thank you for your interest in our newsletter!');
        });
    }
}
