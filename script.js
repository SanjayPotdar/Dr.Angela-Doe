document.addEventListener('DOMContentLoaded', function () {
    // Initialize components after DOM is fully loaded
    initializeComponents();

    // Smooth scroll for navigation links with hash targets
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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
        { value: 1050, suffix: '' },
        { value: 12, suffix: '' },
        { value: 95, suffix: '%' }
    ];

    // Initialize counters to 0
    statNumbers.forEach((statNumber, index) => {
        statNumber.textContent = '0' + (targetValues[index].suffix || '');
        statNumber.dataset.target = targetValues[index].value;
        statNumber.dataset.suffix = targetValues[index].suffix || '';
    });

    // Add a check for mobile devices to use a lower threshold
    const isMobile = window.innerWidth < 768;
    const threshold = isMobile ? 0.1 : 0.5; // Lower threshold for mobile

    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // Check if element is already visible on page load
    if (isInViewport(statSection)) {
        startAllCounters();
    }

    // Use IntersectionObserver with appropriate threshold
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAllCounters();
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: threshold
    });

    observer.observe(statSection);

    // Add scroll event as fallback
    window.addEventListener('scroll', function scrollHandler() {
        if (isInViewport(statSection)) {
            startAllCounters();
            window.removeEventListener('scroll', scrollHandler);
        }
    });
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

// Replace the entire initCarousel function with this updated version
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

    // Determine cards per slide based on screen width
    function getCardsPerSlide() {
        if (window.innerWidth < 768) {
            return 1; // Show 1 card on mobile
        } else if (window.innerWidth < 992) {
            return 2; // Show 2 cards on tablet
        } else {
            return 3; // Show 3 cards on desktop
        }
    }

    let cardsPerSlide = getCardsPerSlide();

    // Update slide layout based on viewport
    function updateSlideLayout() {
        cardsPerSlide = getCardsPerSlide();

        // Re-organize cards into slides
        reorganizeSlides();

        // Update dimensions after reorganization
        slideWidth = slides[0].getBoundingClientRect().width;
        updateTrack();
    }

    // Reorganize cards into slides based on viewport size
    function reorganizeSlides() {
        // Clear all slides first
        slides.forEach(slide => {
            slide.innerHTML = '';
        });

        // Calculate how many slides we need
        const totalSlides = Math.ceil(totalCards / cardsPerSlide);

        // Make sure we have enough slide containers
        while (carouselTrack.children.length < totalSlides) {
            const newSlide = document.createElement('div');
            newSlide.className = 'carousel-slide';
            carouselTrack.appendChild(newSlide);
        }

        // Remove extra slides if needed
        while (carouselTrack.children.length > totalSlides) {
            carouselTrack.removeChild(carouselTrack.lastChild);
        }

        // Update indicators
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator' + (i === 0 ? ' active' : '');
            indicator.dataset.index = i;
            indicator.addEventListener('click', () => {
                currentSlideIndex = i;
                updateTrack();
                activateCard(i * cardsPerSlide);
            });
            indicatorsContainer.appendChild(indicator);
        }

        // Distribute cards into slides
        cards.forEach((card, idx) => {
            const slideIndex = Math.floor(idx / cardsPerSlide);
            if (carouselTrack.children[slideIndex]) {
                carouselTrack.children[slideIndex].appendChild(card);
            }
        });
    }

    function updateTrack() {
        carouselTrack.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
        updateIndicators();
    }

    function updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlideIndex);
        });
    }

    function activateCard(cardIndex) {
        // Ensure cardIndex is within valid range
        cardIndex = Math.min(Math.max(cardIndex, 0), totalCards - 1);

        // Deactivate all cards and reset progress bars
        cards.forEach(card => card.classList.remove('active'));
        progressBars.forEach(bar => bar.style.width = '0%');

        // Calculate which slide this card belongs to
        const slideIndex = Math.floor(cardIndex / cardsPerSlide);

        // Update slide if needed
        if (slideIndex !== currentSlideIndex) {
            currentSlideIndex = slideIndex;
            updateTrack();
        }

        currentCardIndex = cardIndex;

        // Activate the selected card
        if (cards[currentCardIndex]) {
            const activeCard = cards[currentCardIndex];
            activeCard.classList.add('active');

            if (progressBars[currentCardIndex]) {
                startProgress(progressBars[currentCardIndex]);
            }
        }
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

    // Listen for window resize and adjust layout
    window.addEventListener('resize', () => {
        const oldCardsPerSlide = cardsPerSlide;
        const newCardsPerSlide = getCardsPerSlide();

        if (oldCardsPerSlide !== newCardsPerSlide) {
            updateSlideLayout();

            // Adjust currentCardIndex if necessary to maintain visible state
            const visibleSlideFirstCard = currentSlideIndex * cardsPerSlide;
            if (currentCardIndex < visibleSlideFirstCard ||
                currentCardIndex >= visibleSlideFirstCard + cardsPerSlide) {
                currentCardIndex = visibleSlideFirstCard;
            }

            activateCard(currentCardIndex);
        } else {
            // Just update dimensions
            slideWidth = slides[0].getBoundingClientRect().width;
            updateTrack();
        }
    });

    // Allow clicking on individual cards to activate them
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            activateCard(index);
        });
    });

    // Set up touch swipe capability - FIXED
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const totalSlides = Math.ceil(totalCards / cardsPerSlide);

        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next slide
            if (currentSlideIndex < totalSlides - 1) {
                currentSlideIndex++;
                const newCardIndex = currentSlideIndex * cardsPerSlide;
                updateTrack();
                // Choose the first card in the new slide
                activateCard(Math.min(newCardIndex, totalCards - 1));
            }
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - previous slide
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                const newCardIndex = currentSlideIndex * cardsPerSlide;
                updateTrack();
                // Choose the first card in the new slide
                activateCard(newCardIndex);
            }
        }
    }

    // Initial setup
    updateSlideLayout();
    activateCard(0);
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