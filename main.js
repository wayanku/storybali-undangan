// Fungsi untuk Animasi Angka (Harga) dibuat global
function animatePrice(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Menggunakan easing function (easeOut) agar lebih natural
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easedProgress * (end - start) + start);
        
        // Format angka menjadi format mata uang Rupiah
        element.textContent = 'Rp ' + currentValue.toLocaleString('id-ID');
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Muat keranjang dari localStorage sebelum DOMContentLoaded
const savedCart = localStorage.getItem('shoppingCart');
if (savedCart && savedCart !== '[]') {
    window.shoppingCart = JSON.parse(savedCart);
}

// --- KONFIGURASI GLOBAL & DATA ---
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyPrxzjrltCuipal05wcAJbfUMOvg3sMn31m6IOBG8FFGpUdf2D2SJWF9bdlsmqpU9Y6Q/exec';
let allOrdersCache = []; // Cache untuk data pesanan

// --- Fungsi untuk Mengambil Data dari Google Sheets ---
function fetchCatalogFromGoogleSheet() {
    if (!GOOGLE_SHEET_API_URL) return;

    fetch(`${GOOGLE_SHEET_API_URL}?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) return;
            localStorage.setItem('catalogCache', JSON.stringify(data));
            processCatalogData(data);
        })
        .catch(error => console.error("Gagal memuat data dari Google Sheets:", error));
}

// Fungsi helper untuk memproses data katalog
function processCatalogData(data) {
    const newCatalogData = {};
    let visitorMessageData = null;
    allOrdersCache = [];

    data.forEach(row => {
        if (row.category === 'ORDERS') {
            allOrdersCache.push(row);
        }
    });

    data.forEach(row => {
        if (row.category === 'ADMIN_CONFIG' && row.type === 'VISITOR_MESSAGE') {
            visitorMessageData = row;
            return;
        }

        if (!newCatalogData[row.category]) {
            newCatalogData[row.category] = [
                { type: 'withPhoto', themes: [] },
                { type: 'withoutPhoto', themes: [] }
            ];
        }

        const typeIndex = row.type === 'withoutPhoto' ? 1 : 0;
        newCatalogData[row.category][typeIndex].themes.push(row);
    });

    catalogData = newCatalogData;
    console.log("Data katalog berhasil diperbarui.");

    const floatContainer = document.getElementById('draggable-info-container');
    const bubbleContent = document.getElementById('bubble-content-text');
    
    const isActive = visitorMessageData && String(visitorMessageData.label).toLowerCase() === 'true';

    if (isActive && floatContainer && bubbleContent) {
        bubbleContent.innerHTML = visitorMessageData.themeName;
        floatContainer.classList.remove('hidden');
    } else if (floatContainer) {
        floatContainer.classList.add('hidden');
    }

    const themePage = document.getElementById('theme-page');
    if (themePage && !themePage.classList.contains('hidden')) {
        if (typeof window.generateCatalog === 'function') {
            window.generateCatalog();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('Dilarang Mengintip!', 'Jangan intip-intip ya 😉');
    });

    const mainMenu = document.getElementById('main-menu');
    const topHeader = document.querySelector('.top-header');
    const themePage = document.getElementById('theme-page');
    const featuresWrapper = document.querySelector('.features-full-width-wrapper');
    const testimonialsSection = document.querySelector('.testimonials-section');
    const paymentMethodsSection = document.querySelector('.payment-methods-section');
    const footerContainer = document.querySelector('.footer').parentElement;
    const themeTitle = document.getElementById('theme-title'); 
    const backButton = document.querySelector('.back-button');
    const btnWithoutPhoto = document.getElementById('btn-without-photo');
    const themeToggleButtons = document.querySelectorAll('.theme-toggle button');
    const catalogGrid = document.getElementById('catalog-grid');
    const socialFloat = document.querySelector('.social-float');
    const socialToggleBtn = document.getElementById('social-toggle-btn');
    const customModal = document.getElementById('custom-modal');
    const notificationModal = document.getElementById('notification-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const checkoutFormPage = document.getElementById('checkout-form-page');
    const floatingNav = document.querySelector('.floating-nav');
    const cartPage = document.getElementById('cart-page');
    const headerCartIcon = document.getElementById('cart-icon');
    const navCartIcon = document.getElementById('nav-cart');
    const cartBadge = document.getElementById('cart-badge');
    const coverContainer = document.querySelector('.cover-image-container');
    const coverSlides = document.querySelectorAll('.cover-slide');
    const navHome = document.getElementById('nav-home');
    const navCategoryLinks = document.querySelectorAll('.nav-category-link');
    const searchInput = document.getElementById('search-input');
    const headerLogoLink = document.getElementById('header-logo-link');
    const weddingForm = document.getElementById('wedding-data-form');
    const metatahForm = document.getElementById('metatah-data-form');
    const birthdayForm = document.getElementById('birthday-data-form');
    const trackOrderBtn = document.getElementById('nav-track-order');
    const checkOrderBtn = document.getElementById('check-order-btn');
    let trackInterval = null;
    let activeFormType = '';

    const orderSound = new Audio('https://github.com/wayanku/storybali-undangan/raw/main/apple-pay-sound-effect_43nu5Zaa.mp3');
    orderSound.load();

    const categoryGrid = document.getElementById('category-grid');
    let lastFocusedElement;
    const navCartBadge = document.getElementById('nav-cart-badge');
    
    let shoppingCart = window.shoppingCart || [];

    function saveCart() {
        try {
            localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
        } catch (e) { console.error("Gagal menyimpan keranjang ke localStorage:", e); }
    }

    const animationDuration = 400;

    function loadCategories() {
        setTimeout(() => {
            categoryGrid.innerHTML = '';
            categoryData.forEach((cat, index) => {
                const card = document.createElement('div');
                card.className = 'category-card';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <picture class="category-card-image-wrapper">
                        <img src="${cat.image}" class="category-card-image" loading="lazy" decoding="async" alt="Kategori ${cat.name}" width="200" height="200">
                    </picture>
                    <div class="category-card-content">
                        <h4 class="category-card-title">${cat.name}</h4>
                        <button class="category-button">Lihat Jenis Tema</button>
                    </div>
                `;
                categoryGrid.appendChild(card);
            });

            document.querySelectorAll('.category-button').forEach(button => {
                button.addEventListener('click', handleCategoryClick);
            });

        }, 500);
    }

    function generateFeatureSkeletons() {
        const featuresGrid = document.querySelector('.features-grid');
        featuresGrid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'feature-item';
            skeletonItem.style.cssText = 'animation: none; background-color: transparent; box-shadow: none;';
            skeletonItem.innerHTML = `
                <div class="feature-icon skeleton-active" style="width: 36px; height: 36px; border-radius: 15px; margin-bottom: 8px;"></div>
                <div class="skeleton-active" style="height: 10px; width: 80%; border-radius: 4px;"></div>`;
            featuresGrid.appendChild(skeletonItem);
        }
    }

    function loadFeatures() {
        const featuresGrid = document.querySelector('.features-grid');
        setTimeout(() => {
            featuresGrid.innerHTML = '';
            featuresData.forEach((feature, index) => {
                const item = document.createElement('div');
                item.className = 'feature-item';
                item.style.animationDelay = `${0.7 + index * 0.05}s`;
                item.innerHTML = `
                    <div class="feature-icon"><svg viewBox="0 0 24 24">${feature.svg}</svg></div>
                    <span class="feature-name">${feature.name}</span>
                `;
                featuresGrid.appendChild(item);
            });
        }, 800);
    }

    function generateTestimonialSkeletons() {
        const testimonialsGrid = document.querySelector("#testimonials-scroller .testimonials-grid");
        testimonialsGrid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'testimonial-skeleton-card';
            skeletonCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="skeleton-active" style="width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0;"></div>
                    <div style="width: 100%;">
                        <div class="skeleton-active" style="height: 18px; width: 60%; margin-bottom: 8px;"></div>
                        <div class="skeleton-active" style="height: 16px; width: 40%;"></div>
                    </div>
                </div>
                <div class="skeleton-active" style="height: 16px; width: 100%; margin-top: 5px;"></div>
                <div class="skeleton-active" style="height: 16px; width: 80%;"></div>`;
            testimonialsGrid.appendChild(skeletonCard);
        }
    }

    function loadStaticTestimonials() {
        const testimonialsGrid = document.querySelector("#testimonials-scroller .testimonials-grid");
        setTimeout(() => {
            testimonialsGrid.innerHTML = '';
            testimonialsData.forEach(testimonial => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                card.innerHTML = `
                    <div class="quote-icon">“</div>
                    <div class="testimonial-header">
                        <img src="${testimonial.avatar}" alt="Avatar ${testimonial.name}" class="client-avatar" loading="lazy" decoding="async">
                        <div class="client-info">
                            <p class="client-name">${testimonial.name}</p>
                            <div class="rating-stars">${'<svg viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>'.repeat(5)}</div>
                        </div>
                    </div>
                    <p class="quote">${testimonial.quote}</p>
                `;
                testimonialsGrid.appendChild(card);
            });

            const originalCards = Array.from(testimonialsGrid.children);
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                testimonialsGrid.appendChild(clone);
            });

        }, 1200);
    }

    function loadPaymentMethods() {
        const paymentContainer = document.getElementById('payment-methods-container');
        setTimeout(() => {
            const img = paymentContainer.querySelector('img');
            if (img) {
                img.style.display = 'block';
            }
        }, 1500);
    }

    let currentSlideIndex = 0;
    function changeSlide() {
        if (coverSlides.length === 0) return;
        coverSlides[currentSlideIndex].classList.remove('active-slide');
        currentSlideIndex = (currentSlideIndex + 1) % coverSlides.length;
        coverSlides[currentSlideIndex].classList.add('active-slide');
    }
    setInterval(changeSlide, 5000);

    const firstSlide = document.querySelector('.cover-slide.active-slide');
    if (firstSlide.complete) {
        coverContainer.classList.remove('skeleton');
    } else {
        firstSlide.addEventListener('load', () => {
            coverContainer.classList.remove('skeleton');
        });
    }

    function switchPage(fromPage, toPage) {
        fromPage.classList.add('animating-out');
        
        setTimeout(() => {
            fromPage.classList.add('hidden');
            fromPage.classList.remove('animating-out');

            toPage.classList.remove('hidden');
            toPage.classList.add('animating-in');

            const isCartPage = toPage.id === 'cart-page';
            const isThemePage = toPage.id === 'theme-page';
            const isFormPage = toPage.id === 'checkout-form-page';

            document.body.classList.toggle('checkout-active', isCartPage || isFormPage);

            topHeader.classList.toggle('hidden', isCartPage || isFormPage);
            coverContainer.classList.toggle('hidden', isCartPage || isThemePage || isFormPage);
            document.querySelector('.header-content').classList.toggle('hidden', isCartPage || isThemePage || isFormPage);
            featuresWrapper.classList.toggle('hidden', isCartPage || isThemePage || isFormPage);
            testimonialsSection.classList.toggle('hidden', isCartPage || isThemePage || isFormPage);
            paymentMethodsSection.classList.toggle('hidden', isCartPage || isFormPage);
            footerContainer.classList.toggle('hidden', isCartPage || isFormPage);
            floatingNav.classList.toggle('hidden', isCartPage || isFormPage);
            socialFloat.classList.toggle('hidden', isCartPage || isFormPage);

            if (isThemePage) {
                generateCatalog();
            } else if (!isCartPage && !isThemePage) {
                featuresWrapper.classList.add('animating-in');
            }

            setTimeout(() => {
                toPage.classList.remove('animating-in');
            }, animationDuration);
            
        }, animationDuration);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function generateCatalog() {
        const isWithoutPhoto = btnWithoutPhoto.classList.contains('active');
        const defaultFinalPrice = isWithoutPhoto ? 'Rp 30.000' : 'Rp 50.000';
        const defaultOriginalPrice = isWithoutPhoto ? 'Rp 60.000' : 'Rp 100.000';
        const defaultDiscount = '50%';
        
        generateSkeletonCatalog(4);

        setTimeout(() => {
            generateItems(isWithoutPhoto, defaultFinalPrice, defaultOriginalPrice, defaultDiscount);
        }, 500);
    }
    
    window.generateCatalog = generateCatalog;
    
    function generateSkeletonCatalog(count) {
        catalogGrid.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'catalog-item';
            skeletonItem.style.animation = 'none';
            skeletonItem.innerHTML = `
                <div class="skeleton-active" style="width: 100%; aspect-ratio: 1 / 1; margin-bottom: 15px;"></div>
                <div class="catalog-item-details">
                    <div class="skeleton-active" style="height: 20px; width: 70%; margin-bottom: 10px;"></div>
                    <div class="skeleton-active" style="height: 16px; width: 50%; margin-bottom: 15px;"></div>
                    <div class="catalog-item-price-wrapper">
                        <div class="skeleton-active" style="height: 24px; width: 40%; margin-bottom: 10px;"></div>
                    </div>
                    <div class="catalog-item-actions">
                        <div class="skeleton-active" style="height: 40px; width: 100%;"></div>
                    </div>
                </div>
            `;
            catalogGrid.appendChild(skeletonItem);
        }
    }

    function generateItems(isWithoutPhoto, defaultFinalPrice, defaultOriginalPrice, defaultDiscount) {
        const categoryName = themeTitle.textContent.replace('Pilihan Tema ', '');
        const categoryThemeData = catalogData[categoryName] || [];
        const themeType = isWithoutPhoto ? 'withoutPhoto' : 'withPhoto';
        const themeSet = categoryThemeData.find(set => set.type === themeType);
        const themes = themeSet ? themeSet.themes : [];
        
        const itemsWithId = themes.map((theme, index) => {
            const itemPrice = theme.price 
                ? (typeof theme.price === 'number' ? `Rp ${theme.price.toLocaleString('id-ID')}` : theme.price) 
                : defaultFinalPrice;
            
            const itemOriginalPrice = theme.originalPrice 
                ? (typeof theme.originalPrice === 'number' ? `Rp ${theme.originalPrice.toLocaleString('id-ID')}` : theme.originalPrice) 
                : defaultOriginalPrice;

            let displayDiscount = theme.discount || defaultDiscount;
            if (!isNaN(displayDiscount) && Number(displayDiscount) <= 1 && Number(displayDiscount) > 0) {
                displayDiscount = Math.round(Number(displayDiscount) * 100) + "%";
            }

            return {
                ...theme,
                id: `${categoryName.replace(/\s/g, '-')}-${themeType}-${index}`,
                themeName: theme.themeName || `${isWithoutPhoto ? 'Tanpa Foto' : 'Tema'} ${index + 1}`,
                categoryName: categoryName,
                price: itemPrice,
                originalPriceDisplay: itemOriginalPrice,
                discount: displayDiscount
            };
        });

        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = itemsWithId.filter(item => {
            const isHidden = item.visible === false || String(item.visible).trim().toLowerCase() === 'false';
            return item.themeName.toLowerCase().includes(searchTerm) && !isHidden;
        });

        const skeletonItems = catalogGrid.querySelectorAll('.catalog-item');
        skeletonItems.forEach(item => {
            item.style.opacity = '0';
        });

        filteredItems.forEach((theme, index) => {
            const { id, themeName, price, originalPriceDisplay, discount } = theme;
            const labelHtml = theme.label ? `<span class="catalog-item-label">${theme.label}</span>` : '';
            const previewTagHtml = theme.previewUrl ? `<span class="catalog-item-preview-tag">Tersedia</span>` : `<span class="catalog-item-preview-tag coming-soon-tag">Coming Soon</span>`;

            let ratingHtml = '';
            if (theme.rating) {
                const ratingPercentage = (theme.rating / 5) * 100;
                const reviewCount = theme.reviews ? `(${theme.reviews})` : '';
                ratingHtml = `
                    <div class="catalog-item-rating">
                        <div class="star-rating-display">
                            <div class="star-rating-filled" style="--rating-width: ${ratingPercentage}%;"></div>
                        </div>
                        <span class="rating-count">${theme.rating.toFixed(1)} ${reviewCount}</span>
                    </div>`;
            }

            let viewButtonHtml;
            if (theme.previewUrl) {
                viewButtonHtml = `<a href="${theme.previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary"><svg viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>Lihat</a>`;
            } else {
                viewButtonHtml = `<a href="#" class="btn-secondary view-theme-btn"><svg viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>Lihat</a>`;
            }

            const item = document.createElement('div');
            item.className = 'catalog-item';
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.opacity = '0';

            item.innerHTML = `
                <div class="catalog-image-wrapper">
                    ${labelHtml}
                    <img src="${theme.image}" alt="${themeName}" class="catalog-item-image" loading="lazy" decoding="async">
                    ${previewTagHtml}
                </div>
                <div class="catalog-item-details">
                    <div class="catalog-item-header">
                        <h4 class="catalog-item-title">
                            <svg viewBox="0 0 24 24"><path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75L7.2,14.64L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2H1Z" /></svg>
                            <span>${themeName}</span>
                        </h4>
                    </div>
                    ${ratingHtml}
                    <div class="catalog-item-price-wrapper">
                        <p class="catalog-item-price">${price}</p>
                        <div class="discount-info">
                            <span class="discount-badge">${discount}</span>
                            <span class="original-price">${originalPriceDisplay}</span>
                        </div>
                    </div>
                    <div class="catalog-item-actions">
                        ${viewButtonHtml}
                        <button class="btn-primary add-to-cart-btn" data-item-id="${id}"><svg viewBox="0 0 24 24"><path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75L7.2,14.64L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2H1Z" /></svg>Order</button>
                    </div>
                </div>
            `;
            if (index < skeletonItems.length) {
                catalogGrid.replaceChild(item, skeletonItems[index]);
            } else {
                catalogGrid.appendChild(item);
            }
            setTimeout(() => item.style.opacity = '1', 50);

            const priceElement = item.querySelector('.catalog-item-price');
            const originalPriceNum = parseInt(originalPriceDisplay.replace(/[^0-9]/g, ''));
            const finalPriceNum = parseInt(price.replace(/[^0-9]/g, ''));
            priceElement.textContent = originalPriceDisplay;
            animatePrice(priceElement, originalPriceNum, finalPriceNum, 800);
        });

        document.querySelectorAll('.view-theme-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                lastFocusedElement = this;
                showModal();
            });
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.itemId;
                const itemToAdd = filteredItems.find(item => item.id === itemId);
                const orderButton = this;
                
                const existingItem = shoppingCart.find(cartItem => cartItem.id === itemToAdd.id);
                if (existingItem) {
                    showNotification(
                        'Sudah di Keranjang', 
                        'Tema ini sudah ada di dalam keranjang belanja Anda.',
                        { text: 'Lihat Keranjang', action: 'openCart' }
                    );
                    return;
                }

                if (orderButton) {
                    const buttonRect = orderButton.getBoundingClientRect();
                    const cartRect = (window.innerWidth < 768 && navCartIcon) ? navCartIcon.getBoundingClientRect() : headerCartIcon.getBoundingClientRect();

                    const clone = document.createElement('div');
                    clone.innerText = '1';
                    clone.classList.add('fly-to-cart-clone');
                    document.body.appendChild(clone);

                    clone.style.left = `${buttonRect.left + (buttonRect.width / 2) - 12}px`;
                    clone.style.top = `${buttonRect.top + (buttonRect.height / 2) - 12}px`;

                    requestAnimationFrame(() => {
                        clone.style.left = `${cartRect.left + (cartRect.width / 2) - 12}px`;
                        clone.style.top = `${cartRect.top + (cartRect.height / 2) - 12}px`;
                        clone.style.transform = 'scale(0.5)';
                        clone.style.opacity = '0.5';
                    });

                    setTimeout(() => {
                        clone.remove();
                    }, 900);
                }

                addToCart(itemToAdd);
            });
        });
    }
    
    function addToCart(item) {
        if (!item) return;
        orderSound.currentTime = 0;
        orderSound.play().catch(error => console.log("Autoplay diblokir oleh browser:", error));

        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        const existingItem = shoppingCart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            showNotification('Sudah di Keranjang', 'Tema ini sudah ada di dalam keranjang belanja Anda.');
            return;
        }
        shoppingCart.push(item);
        updateCartUI();
        saveCart();

        cartIcon.classList.add('shake');
        setTimeout(() => {
            cartIcon.classList.remove('shake');
        }, 400);
    }

    function removeFromCart(itemId) {
        shoppingCart = shoppingCart.filter(item => item.id !== itemId);
        updateCartUI();
        renderCartModal();
        saveCart();
    }
    
    function updateCartUI() {
        const count = shoppingCart.length;
        if(cartBadge) cartBadge.textContent = count;
        if(navCartBadge) navCartBadge.textContent = count;

        if (count > 0) {
            if(cartBadge) cartBadge.classList.remove('hidden');
            if(navCartBadge) navCartBadge.classList.remove('hidden');
        } else {
            if(cartBadge) cartBadge.classList.add('hidden');
            if(navCartBadge) navCartBadge.classList.add('hidden');
        }
    }

    function renderCartModal() {
        const cartItemsList = document.getElementById('cart-items-list');
        const cartEmptyMsg = document.getElementById('cart-empty-msg');
        const checkoutBtn = document.getElementById('cart-checkout-btn');

        cartItemsList.innerHTML = '';

        if (shoppingCart.length === 0) {
            cartItemsList.classList.add('hidden');
            cartEmptyMsg.classList.remove('hidden');
            checkoutBtn.classList.add('hidden');
        } else {
            cartEmptyMsg.classList.add('hidden');
            cartItemsList.classList.remove('hidden');
            shoppingCart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.themeName}" class="cart-item-img" decoding="async">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${item.themeName}</p>
                        <p class="cart-item-price">${item.price}</p>
                    </div>
                    <button class="cart-item-remove" data-item-id="${item.id}" title="Hapus item">
                        <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                    </button>
                `;
                cartItemsList.appendChild(cartItemEl);
            });
            checkoutBtn.classList.remove('hidden');

            let waMessage = 'Halo Storybali Undangan, saya tertarik untuk memesan tema berikut:\n';
            shoppingCart.forEach((item, index) => {
                waMessage += `${index + 1}. ${item.themeName} (${item.price})\n`;
            });
            checkoutBtn.href = `https://wa.me/6285738517248?text=${encodeURIComponent(waMessage)}`;

            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', function() {
                    removeFromCart(this.dataset.itemId);
                });
            });
        }
    }

    function renderCartPage() {
        const cartFullList = document.getElementById('cart-full-list');
        const checkoutView = document.getElementById('cart-checkout-view');
        const checkoutFullBtn = document.getElementById('checkout-full-btn');
        const emptyView = document.getElementById('cart-empty-view');
        const priceSummary = document.getElementById('checkout-price-summary');
        const backToShoppingBtn = document.getElementById('back-to-shopping-btn');
        const selectionGuideContainer = document.getElementById('selection-guide-container');

        cartFullList.innerHTML = '';
        selectionGuideContainer.innerHTML = '';

        if (shoppingCart.length === 0) {
            checkoutView.classList.add('hidden');
            emptyView.classList.remove('hidden');
            priceSummary.classList.add('hidden');
            backToShoppingBtn.onclick = () => {
                history.back();
            };
        } else {
            checkoutView.classList.remove('hidden');
            emptyView.classList.add('hidden');

            if (shoppingCart.length === 1) {
                checkoutFullBtn.disabled = false;
                priceSummary.classList.remove('hidden');
                updatePriceSummary(shoppingCart[0]);
            } else {
                checkoutFullBtn.disabled = true;
                selectionGuideContainer.innerHTML = '<p class="selection-guide">Silakan pilih satu tema untuk di-checkout.</p>';
                priceSummary.classList.add('hidden');
            }

            shoppingCart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item-full';
                cartItemEl.dataset.itemId = item.id;
                cartItemEl.innerHTML = `
                    <div class="cart-item-selector">
                        <div class="radio-indicator"></div>
                    </div>
                    <img src="${item.image}" alt="${item.themeName}" class="cart-item-img" decoding="async">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${item.themeName} <span style="display:block; font-size:0.8em; color:var(--secondary-text); font-weight:400;">${item.categoryName}</span></p>
                        <p class="cart-item-price">${item.price}</p>
                    </div>
                    <button class="cart-item-remove" data-item-id="${item.id}" title="Hapus item">
                        <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                    </button>
                `;
                cartFullList.appendChild(cartItemEl);
            });

            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeFromCart(this.dataset.itemId);
                    saveCart();
                    renderCartPage();
                });
            });

            if (shoppingCart.length > 1) {
                document.querySelectorAll('.cart-item-full').forEach(itemEl => {
                    const selector = itemEl.querySelector('.cart-item-selector');
                    if (selector) selector.style.display = 'block';

                    itemEl.style.cursor = 'pointer';
                    itemEl.addEventListener('click', function() {
                        document.querySelectorAll('.cart-item-full').forEach(el => el.classList.remove('selected'));
                        this.classList.add('selected');
                        checkoutFullBtn.disabled = false;
                        const selectedId = this.dataset.itemId;
                        const selectedItem = shoppingCart.find(item => item.id === selectedId);
                        updatePriceSummary(selectedItem);
                    });
                });
            } else {
                const singleItem = document.querySelector('.cart-item-full');
                if (singleItem) {
                    singleItem.classList.add('selected');
                }
            }
        }
    }

    function updatePriceSummary(item) {
        if (!item) return;
        const priceSummary = document.getElementById('checkout-price-summary');
        const isWithoutPhoto = item.id.includes('withoutPhoto');
        document.getElementById('checkout-final-price').textContent = isWithoutPhoto ? 'Rp 30.000' : 'Rp 50.000';
        document.getElementById('checkout-original-price').textContent = isWithoutPhoto ? 'Rp 60.000' : 'Rp 100.000';
        document.getElementById('checkout-discount-badge').textContent = '50%';
        priceSummary.classList.remove('hidden');
    }

    document.getElementById('checkout-full-btn').addEventListener('click', function() {
        let selectedItem;
        if (shoppingCart.length === 1) {
            selectedItem = shoppingCart[0];
        } else {
            const selectedEl = document.querySelector('.cart-item-full.selected');
            if (!selectedEl) {
                alert('Silakan pilih satu item untuk di-checkout.');
                return;
            }
            const selectedId = selectedEl.dataset.itemId;
            selectedItem = shoppingCart.find(item => item.id === selectedId);
        }

        if (!selectedItem) {
            alert('Item yang dipilih tidak ditemukan.');
            return;
        }

        weddingForm.classList.add('hidden');
        metatahForm.classList.add('hidden');
        birthdayForm.classList.add('hidden');

        const category = selectedItem.categoryName.toLowerCase();
        if (category.includes('pernikahan')) {
            weddingForm.classList.remove('hidden');
            activeFormType = 'wedding';
        } else if (category.includes('metatah')) {
            metatahForm.classList.remove('hidden');
            activeFormType = 'metatah';
        } else if (category.includes('ulang tahun') || category.includes('3 bulanan')) {
            birthdayForm.classList.remove('hidden');
            activeFormType = category.includes('3 bulanan') ? '3 bulanan' : 'birthday';
            document.querySelector('#birthday-data-form label[for="birthday-name"]').textContent = category.includes('3 bulanan') ? 'Nama Bayi' : 'Nama (Yang Berulang Tahun)';
        } else {
            alert(`Formulir untuk kategori "${selectedItem.categoryName}" sedang disiapkan. Silakan hubungi admin.`);
            return;
        }

        history.pushState({page: 'form'}, `Formulir Pesanan`, '#form');
        switchPage(cartPage, checkoutFormPage);
    });

    function generateOrderID() {
        const timestamp = new Date().getTime().toString().slice(-4);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}${random}`;
    }

    function saveOrderToSheet(orderData) {
        return fetch(GOOGLE_SHEET_API_URL, { method: 'POST', body: JSON.stringify(orderData) });
    }

    document.getElementById('submit-order-data-btn').addEventListener('click', function() {
        let waMessage = '';

        if (activeFormType === 'wedding') {
            const activeForm = document.querySelector('#checkout-form-page #wedding-data-form');
            const weddingData = {
                groomName: activeForm.querySelector('input[id="groom-name-page"]').value.trim(),
                groomFather: activeForm.querySelector('input[id="groom-father-page"]').value.trim(),
                groomMother: activeForm.querySelector('input[id="groom-mother-page"]').value.trim(),
                brideName: activeForm.querySelector('input[id="bride-name-page"]').value.trim(),
                brideFather: activeForm.querySelector('input[id="bride-father-page"]').value.trim(),
                brideMother: activeForm.querySelector('input[id="bride-mother-page"]').value.trim(),
                eventDetails: activeForm.querySelector('input[id="event-date-page"]').value.trim(),
            };
            if (!weddingData.groomName || !weddingData.brideName || !weddingData.eventDetails) {
                alert('Mohon lengkapi nama kedua mempelai dan detail acara.');
                return;
            }
            waMessage = createWeddingOrderMessage(weddingData);
        } else if (activeFormType === 'metatah') {
            const activeForm = document.querySelector('#checkout-form-page #metatah-data-form');
            const data = {
                name: activeForm.querySelector('input[id="metatah-name-page"]').value.trim(),
                parents: activeForm.querySelector('input[id="metatah-parents-page"]').value.trim(),
                details: activeForm.querySelector('input[id="metatah-details-page"]').value.trim(),
            };
            if (!data.name || !data.details) {
                alert('Mohon lengkapi Nama dan Detail Acara.');
                return;
            }
            waMessage = createGeneralOrderMessage('Metatah', data);
        } else if (activeFormType === 'birthday' || activeFormType === '3 bulanan') {
            const activeForm = document.querySelector('#checkout-form-page #birthday-data-form');
            const data = {
                name: activeForm.querySelector('input[id="birthday-name-page"]').value.trim(),
                date: activeForm.querySelector('input[id="birthday-date-page"]').value.trim(),
                time: activeForm.querySelector('input[id="birthday-time-page"]').value.trim(),
                location: activeForm.querySelector('input[id="birthday-location-page"]').value.trim(),
            };
            if (!data.name || !data.date || !data.location) {
                alert('Mohon lengkapi Nama, Tanggal, dan Alamat.');
                return;
            }
            const messageType = activeFormType.charAt(0).toUpperCase() + activeFormType.slice(1);
            waMessage = createGeneralOrderMessage(messageType, data);
        }

        if (waMessage) {
            const btn = document.getElementById('submit-order-data-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Memproses...';
            btn.disabled = true;

            const orderID = generateOrderID();
            
            let clientName = "Klien";
            if (activeFormType === 'wedding') clientName = document.querySelector('#checkout-form-page #groom-name-page').value + " & " + document.querySelector('#checkout-form-page #bride-name-page').value;
            else if (activeFormType === 'metatah') clientName = document.querySelector('#checkout-form-page #metatah-name-page').value;
            else clientName = document.querySelector('#checkout-form-page #birthday-name-page').value;

            const orderTimestamp = new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const sheetPayload = {
                action: 'save',
                category: 'ORDERS',
                type: 'active',
                themeName: orderID,
                image: clientName,
                previewUrl: 'Menunggu Konfirmasi',
                price: 0, 
                originalPrice: 0, discount: '-', label: orderTimestamp, visible: true
            };

            saveOrderToSheet(sheetPayload)
                .then(() => {
                    waMessage = `*ID PESANAN: ${orderID}*\n(Simpan ID ini untuk cek status)\n\n` + waMessage;
                    document.getElementById('generated-order-id').textContent = orderID;
                    document.getElementById('continue-to-wa-btn').href = `https://wa.me/6285738517248?text=${encodeURIComponent(waMessage)}`;
                    document.getElementById('order-success-modal').classList.add('active');
                    btn.textContent = originalText;
                    btn.disabled = false;
                })
                .catch(err => {
                    alert("Gagal menyimpan pesanan. Silakan coba lagi.");
                    btn.textContent = originalText;
                    btn.disabled = false;
                });
        }
    });

    document.getElementById('copy-id-btn').addEventListener('click', function() {
        const idText = document.getElementById('generated-order-id').textContent;
        navigator.clipboard.writeText(idText).then(() => {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<svg style="width:18px;height:18px;fill:#10b981;" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>';
            setTimeout(() => {
                this.innerHTML = originalHTML;
            }, 2000);
        });
    });

    document.getElementById('cancel-order-btn').addEventListener('click', function() {
        history.back();
    });

    trackOrderBtn.addEventListener('click', function() {
        if (trackInterval) clearInterval(trackInterval);
        document.getElementById('track-order-modal').classList.add('active');
        document.getElementById('track-result').classList.add('hidden');
        document.getElementById('track-order-id-input').value = '';
    });

    document.querySelector('#track-order-modal .btn-secondary').addEventListener('click', () => {
        if (trackInterval) clearInterval(trackInterval);
    });

    checkOrderBtn.addEventListener('click', function() {
        const inputID = document.getElementById('track-order-id-input').value.trim();
        if (!inputID) { alert("Masukkan ID Pesanan!"); return; }

        const btn = this;
        btn.textContent = "Mengecek...";
        btn.disabled = true;

        if (trackInterval) clearInterval(trackInterval);

        function fetchAndUpdateStatus(orderID) {
            fetch(`${GOOGLE_SHEET_API_URL}?v=${new Date().getTime()}`)
                .then(res => res.json())
                .then(data => {
                    const order = data.find(row => 
                        row.category === 'ORDERS' && 
                        String(row.themeName).trim().toLowerCase() === orderID.toLowerCase()
                    );
                    const resultDiv = document.getElementById('track-result');
                    if (order) {
                        resultDiv.classList.remove('hidden');
                        document.getElementById('track-status-text').textContent = order.previewUrl || "Diproses";
                        let progress = parseInt(String(order.price).replace(/[^0-9]/g, '')) || 0;
                        if (progress > 100) progress = 100;
                        document.getElementById('track-progress-bar').style.width = progress + "%";
                        document.getElementById('track-progress-text').textContent = progress + "%";
                    } else {
                        alert("ID Pesanan tidak ditemukan!");
                        resultDiv.classList.add('hidden');
                        if (trackInterval) clearInterval(trackInterval);
                    }
                })
                .finally(() => { if(btn) { btn.textContent = "Cek Sekarang"; btn.disabled = false; } });
        }

        fetchAndUpdateStatus(inputID);
        trackInterval = setInterval(() => fetchAndUpdateStatus(inputID), 7000);
    });

    function showModal() {
        customModal.classList.add('active');
        setTimeout(() => {
            modalCloseBtn.focus();
        }, 150);
    }

    function hideModal() {
        customModal.classList.remove('active');
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function showNotification(title, message, buttonConfig = null) {
        document.getElementById('notification-modal-title').textContent = title;
        document.getElementById('notification-modal-message').textContent = message;
        document.getElementById('notification-modal-icon').innerHTML = '<svg viewBox="0 0 24 24"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path></svg>';
        
        const closeBtn = document.getElementById('notification-modal-close-btn');
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);

        if (buttonConfig && buttonConfig.action === 'openCart') {
            newBtn.textContent = buttonConfig.text || 'Lihat Keranjang';
            newBtn.onclick = () => {
                notificationModal.classList.remove('active');
                (headerCartIcon || navCartIcon).click(); 
            };
        } else if (buttonConfig && buttonConfig.action === 'openWaService') {
            newBtn.textContent = buttonConfig.text || 'Chat Admin';
            newBtn.onclick = () => {
                const message = `Halo Storybali, saya tertarik untuk tanya-tanya tentang layanan *${buttonConfig.service}*. Bisa minta info pricelist?`;
                window.open(`https://wa.me/6285738517248?text=${encodeURIComponent(message)}`, '_blank');
                notificationModal.classList.remove('active');
            };
        } else {
            newBtn.textContent = 'Mengerti';
            newBtn.onclick = () => {
                notificationModal.classList.remove('active');
            };
        }

        notificationModal.classList.add('active');
        newBtn.focus();
    }

    // [BARU] Handler untuk menu layanan tambahan (Service Menu)
    window.handleServiceClick = function(serviceName) {
        // Deskripsi untuk setiap layanan
        const descriptions = {
            'Wedding Organizer': "Wujudkan pernikahan impian tanpa stres! Tim WO kami siap membantu perencanaan dari A-Z agar momen spesialmu berjalan sempurna.",
            'Fotografer': "Abadikan setiap momen berharga dengan kualitas terbaik. Fotografer profesional kami siap menangkap senyuman dan emosi di hari bahagiamu.",
            'MUA & Busana': "Tampil memukau di hari istimewa dengan sentuhan MUA berpengalaman dan koleksi busana adat maupun modern yang elegan.",
            'Sewa Tenda': "Tenda dekoratif berbagai ukuran untuk kenyamanan tamu undangan. Kokoh, bersih, dan estetik untuk segala cuaca.",
            'Dekorasi': "Sulap lokasi acaramu menjadi tempat yang magis. Dekorasi pelaminan, photobooth, dan area tamu dengan desain kekinian.",
            'Catering': "Manjakan lidah tamu undangan dengan hidangan lezat. Menu variatif, higienis, dan rasa yang tak terlupakan.",
            'Sewa Mobil': "Kendaraan pengantin mewah dan nyaman. Siap antar jemput dengan driver profesional dan ramah.",
            'Lainnya': "Punya kebutuhan khusus untuk acaramu? Diskusikan dengan kami, kami siap memberikan solusi terbaik!"
        };

        const modal = document.getElementById('service-modal');
        const titleEl = document.getElementById('service-modal-title');
        const descEl = document.getElementById('service-modal-desc');
        const iconContainer = document.getElementById('service-modal-icon');
        const chatBtn = document.getElementById('service-modal-chat-btn');
        const closeBtn = document.getElementById('service-modal-close');

        // Set Content
        titleEl.textContent = serviceName;
        descEl.textContent = descriptions[serviceName] || 'Tertarik dengan jasa ini? Hubungi kami untuk info lebih lanjut.';
        
        // Ambil icon dari elemen yang diklik (mencari elemen SVG yang sesuai di DOM)
        // Kita cari elemen service-item yang memiliki onclick berisi serviceName
        const clickedItem = document.querySelector(`.service-item[onclick*="${serviceName}"] .service-icon-box`);
        if (clickedItem) {
            iconContainer.innerHTML = clickedItem.innerHTML;
        }

        // Set Action Button
        chatBtn.onclick = () => {
            const message = `Halo Storybali, saya tertarik untuk tanya-tanya tentang layanan *${serviceName}*. Bisa minta info pricelist dan paketnya?`;
            window.open(`https://wa.me/6285738517248?text=${encodeURIComponent(message)}`, '_blank');
            modal.classList.remove('active');
        };

        closeBtn.onclick = () => modal.classList.remove('active');
        
        // Tampilkan Modal
        modal.classList.add('active');
    };

    notificationModal.addEventListener('click', (e) => {
        if (e.target === notificationModal) {
            notificationModal.classList.remove('active');
        }
    });

    function createWeddingOrderMessage(data) {
        let message = `Halo Storybali Undangan, saya ingin memesan undangan pernikahan dengan detail:\n\n`;
        message += `*DATA MEMPELAI PRIA*\n`;
        message += `Nama: ${data.groomName}\n`;
        message += `Nama Ayah: ${data.groomFather}\n`;
        message += `Nama Ibu: ${data.groomMother}\n\n`;
        message += `*DATA MEMPELAI WANITA*\n`;
        message += `Nama: ${data.brideName}\n`;
        message += `Nama Ayah: ${data.brideFather}\n`;
        message += `Nama Ibu: ${data.brideMother}\n\n`;
        message += `*DETAIL ACARA*\n`;
        message += `Tanggal & Lokasi: ${data.eventDetails}\n\n`;

        const selectedId = (shoppingCart.length > 1)
            ? document.querySelector('.cart-item-full.selected').dataset.itemId
            : shoppingCart[0].id;
        
        const selectedItem = shoppingCart.find(item => item.id === selectedId);
        message += `*TEMA YANG DIPESAN*\n`;
        message += `- ${selectedItem.themeName} (${selectedItem.categoryName}) - ${selectedItem.price}`;
        return message;
    }

    function createGeneralOrderMessage(type, data) {
        let message = `Halo Storybali Undangan, saya ingin memesan undangan ${type === 'Birthday' ? 'Ulang Tahun' : type} dengan detail:\n\n`;
        if (type === 'Metatah') {
            message += `*Nama Anak:* ${data.name || '-'}\n`;
            message += `*Nama Ortu:* ${data.parents || '-'}\n`;
            message += `*Detail Acara:* ${data.details || '-'}\n\n`;
        } else if (type === 'Birthday' || type === '3 bulanan') {
            const nameLabel = type === '3 Bulanan' ? '*Nama Bayi:*' : '*Nama:*';
            message += `${nameLabel} ${data.name || '-'}\n`;
            message += `*Tanggal:* ${data.date}\n`;
            message += `*Jam:* ${data.time}\n`;
            message += `*Lokasi:* ${data.location}\n\n`;
        }

        const selectedId = (shoppingCart.length > 1)
            ? document.querySelector('.cart-item-full.selected').dataset.itemId
            : shoppingCart[0].id;
        
        const selectedItem = shoppingCart.find(item => item.id === selectedId);
        message += `*TEMA YANG DIPESAN*\n`;
        message += `- ${selectedItem.themeName} (${selectedItem.categoryName}) - ${selectedItem.price}`;
        return message;
    }

    function handleCategoryClick(event) {
        const categoryCard = this.closest('.category-card');
        const categoryName = categoryCard.querySelector('h4.category-card-title').textContent;
        themeTitle.textContent = `Pilihan Tema ${categoryName}`;
        updateActiveNav(categoryName);
        history.pushState({page: 'catalog'}, `Katalog - ${categoryName}`, '#katalog');
        switchPage(mainMenu, themePage); 
    }

    document.querySelectorAll('.category-button').forEach(button => button.addEventListener('click', handleCategoryClick));

    backButton.addEventListener('click', function() {
        const currentPage = this.closest('.page');
        if (currentPage.id === 'cart-page') {
            switchPage(cartPage, mainMenu);
        } else {
            history.back();
        }
    });

    window.addEventListener('popstate', function(event) {
        if (!themePage.classList.contains('hidden')) {
            switchPage(themePage, mainMenu);
        } else if (!cartPage.classList.contains('hidden')) {
            switchPage(cartPage, mainMenu);
        } else if (!checkoutFormPage.classList.contains('hidden')) {
            switchPage(checkoutFormPage, cartPage);
        } else {
            updateActiveNav('home');
        }
    });

    themeToggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                themeToggleButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                generateCatalog();
            }
        });
    });

    socialToggleBtn.addEventListener('click', function() {
        socialFloat.classList.toggle('active');
    });

    modalCloseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        hideModal();
    });

    cartCloseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        cartModal.classList.remove('active');
    });

    function openCartPage(e) {
        if(e) e.preventDefault();
        renderCartPage();
        const currentPage = document.querySelector('.page:not(.hidden)');
        if (currentPage.id !== 'cart-page') {
            history.pushState({page: 'cart'}, `Keranjang Belanja`, '#keranjang');
            switchPage(currentPage, cartPage);
        }
    }

    if(headerCartIcon) headerCartIcon.addEventListener('click', openCartPage);
    if(navCartIcon) navCartIcon.addEventListener('click', openCartPage);

    searchInput.addEventListener('input', () => {
        if (!themePage.classList.contains('hidden')) generateCatalog();
    });

    headerLogoLink.addEventListener('click', function(e) {
        e.preventDefault();
        const currentPage = document.querySelector('.page:not(.hidden)');
        if (currentPage.id !== 'main-menu') {
            switchPage(currentPage, mainMenu);
        }
    });

    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        if (!themePage.classList.contains('hidden')) {
            history.back();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateActiveNav('home');
        }
    });

    function updateActiveNav(categoryName) {
        navHome.classList.remove('active');
        navCategoryLinks.forEach(link => {
            link.classList.remove('active'); 
        });

        if (categoryName === 'home') {
            navHome.classList.add('active');
            return;
        }

        const activeLink = Array.from(navCategoryLinks).find(link => link.dataset.category === categoryName);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    navCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryName = this.dataset.category;
            themeTitle.textContent = `Pilihan Tema ${categoryName}`;
            updateActiveNav(categoryName);
            history.pushState({page: 'catalog'}, `Katalog - ${categoryName}`, '#katalog');
            switchPage(mainMenu, themePage);
        });
    });

    generateFeatureSkeletons();
    generateTestimonialSkeletons();
    loadCategories();
    loadFeatures();
    loadStaticTestimonials();
    loadPaymentMethods();
    updateCartUI();
    
    const cachedData = localStorage.getItem('catalogCache');
    if (cachedData) {
        try {
            processCatalogData(JSON.parse(cachedData));
            console.log("Data dimuat dari cache lokal.");
        } catch (e) {
            console.error("Gagal membaca cache:", e);
        }
    }
    
    fetchCatalogFromGoogleSheet();

    // --- Social Proof Notification ---
    const toast = document.getElementById('social-proof-toast');
    const toastMessage = document.getElementById('toast-message');
    const locations = ["Denpasar", "Badung", "Gianyar", "Tabanan", "Jakarta", "Surabaya", "Singaraja"];
    const themes = ["Pernikahan Bali", "Metatah", "Ulang Tahun", "Pernikahan Muslim"];

    function showSocialProof() {
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        toastMessage.textContent = `Seseorang dari ${randomLocation} baru saja memesan tema ${randomTheme}.`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    function startNotificationLoop() {
        setTimeout(showSocialProof, 45000); // Delay awal diperlama jadi 45 detik
        setInterval(showSocialProof, Math.floor(Math.random() * (150000 - 90000 + 1)) + 90000); // Interval diperlama jadi 1.5 - 2.5 menit
    }
    startNotificationLoop();

    // --- Popup Diskon ---
    const popupOverlay = document.getElementById('discountPopup');
    const closeButton = document.getElementById('closePopup');
    const actionButton = document.getElementById('actionButton');
    const discountBanner = document.getElementById('claimed-discount-banner');
    const popupContainer = document.querySelector('.popup-container');
    let countdownFunction = null;
    let isClaimed = false;

    const countdownDuration = 24 * 60 * 60 * 1000; 
    const countDownDate = new Date().getTime() + countdownDuration;

    function startCountdown() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const formatTime = (time) => time < 10 ? `0${time}` : time;

        if (!popupOverlay.classList.contains('hidden')) {
            document.getElementById("hours").innerText = formatTime(hours);
            document.getElementById("minutes").innerText = formatTime(minutes);
            document.getElementById("seconds").innerText = formatTime(seconds);
        }

        if (!discountBanner.classList.contains('hidden')) {
            document.getElementById("banner-hours").innerText = formatTime(hours);
            document.getElementById("banner-minutes").innerText = formatTime(minutes);
            document.getElementById("banner-seconds").innerText = formatTime(seconds);
        }

        if (distance < 0) {
            clearInterval(countdownFunction);
            if (!popupOverlay.classList.contains('hidden')) {
                document.getElementById("discountOffer").innerHTML = "Waktu Habis!";
                document.getElementById("popupSubtitle").innerText = "Maaf, penawaran ini telah berakhir.";
                document.querySelector('.countdown-timer').style.display = 'none';
                actionButton.innerText = "Tawaran Berakhir";
                actionButton.disabled = true;
            }
            discountBanner.innerHTML = '<span>Penawaran Spesial Telah Berakhir</span>';
        }
    }

    function showPopup() {
        popupOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        const priceRows = document.querySelectorAll('.price-row-popup');
        priceRows.forEach(row => {
            const originalEl = row.querySelector('.original-price-popup');
            const finalEl = row.querySelector('.final-price-popup');
            const originalPrice = parseInt(originalEl.textContent.replace(/[^0-9]/g, ''));
            const finalPrice = parseInt(finalEl.textContent.replace(/[^0-9]/g, ''));
            animatePrice(finalEl, originalPrice, finalPrice, 1200);
            originalEl.style.textDecoration = 'line-through';
        });
    }

    function closePopup() {
        popupOverlay.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    function claimAndClose() {
        if (isClaimed) {
            closePopup();
            return;
        }
        isClaimed = true;
        closePopup();
        discountBanner.classList.remove('hidden');
        topHeader.style.paddingTop = '0';
    }

    if (!isClaimed) {
        setTimeout(showPopup, 7000);
    }
    countdownFunction = setInterval(startCountdown, 1000);

    closeButton.addEventListener('click', claimAndClose);
    popupOverlay.addEventListener('click', function(event) {
        if (event.target === popupOverlay) {
            closePopup();
        }
    });

    actionButton.addEventListener('click', function(event) {
        event.preventDefault();
        claimAndClose();
    });

    popupOverlay.addEventListener('mousemove', (e) => {
        if (!popupOverlay.classList.contains('show')) return;
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = popupContainer;
        const rect = popupContainer.getBoundingClientRect();
        const x = clientX - rect.left - offsetWidth / 2;
        const y = clientY - rect.top - offsetHeight / 2;
        const rotateY = (x / (offsetWidth / 2)) * 10;
        const rotateX = -(y / (offsetHeight / 2)) * 10;
        popupContainer.style.transform = `scale(1) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    popupOverlay.addEventListener('mouseleave', () => {
        popupContainer.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
    });

    // --- Draggable Float ---
    const container = document.getElementById('draggable-info-container');
    const btn = document.getElementById('info-float-btn');
    const bubble = document.getElementById('info-bubble');
    const closeBtn = document.getElementById('close-bubble-btn');
    const hint = document.getElementById('click-hint');
    const badge = document.getElementById('info-badge');

    let isDragging = false;
    let hasMoved = false;
    let startX, startY, initialLeft, initialTop;
    let hintTimeout;
    let hasInteracted = false;
    
    let isFlying = true;
    let flyVx = 0.6, flyVy = -0.6;
    let isFlyInitialized = false;
    let flyFrameId;

    function dragStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        if (isFlying) {
            isFlying = false;
            cancelAnimationFrame(flyFrameId);
        }

        const rect = container.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        startX = clientX;
        startY = clientY;
        isDragging = true;
        hasMoved = false;

        container.style.bottom = 'auto';
        container.style.right = 'auto';
        container.style.left = initialLeft + 'px';
        container.style.top = initialTop + 'px';

        stopAttentionSeeker();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
        }

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const maxLeft = window.innerWidth - container.offsetWidth;
        const maxTop = window.innerHeight - container.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';

        updateOrientation(newLeft, newTop);
        updateEmojiState(newLeft, newTop);
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;

        if (!hasMoved) {
            bubble.classList.toggle('active');
            if (bubble.classList.contains('active')) {
                badge.style.display = 'none';
                stopAttentionSeeker();
            }
        }

        const rect = container.getBoundingClientRect();
        updateOrientation(rect.left, rect.top);
    }

    btn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    btn.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        bubble.classList.remove('active');
    });

    function startAttentionSeeker() {
        hintTimeout = setTimeout(() => {
            if (!hasInteracted && !bubble.classList.contains('active')) {
                hint.classList.add('show');
                btn.classList.add('pulse-animation');
            }
        }, 4000);
    }

    function stopAttentionSeeker() {
        hasInteracted = true;
        hint.classList.remove('show');
        btn.classList.remove('pulse-animation');
        clearTimeout(hintTimeout);
    }

    startAttentionSeeker();

    function updateOrientation(left, top) {
        const centerX = left + container.offsetWidth / 2;
        const centerY = top + container.offsetHeight / 2;

        if (centerX < window.innerWidth / 2) {
            container.classList.add('left-side');
        } else {
            container.classList.remove('left-side');
        }

        if (centerY < window.innerHeight / 2) {
            container.classList.add('top-side');
        } else {
            container.classList.remove('top-side');
        }
    }

    function updateEmojiState(left, top) {
        const proximityThreshold = 80;
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;

        if (btn.classList.contains('state-hurt')) {
            return;
        }

        if (left <= proximityThreshold || left >= maxX - proximityThreshold ||
            top <= proximityThreshold || top >= maxY - proximityThreshold) {
            btn.classList.add('state-fear');
        } else {
            btn.classList.remove('state-fear');
        }
    }

    function triggerBounceEffect() {
        btn.classList.remove('state-fear');
        btn.classList.add('state-hurt');

        btn.classList.remove('bounce-active');
        void btn.offsetWidth;
        btn.classList.add('bounce-active');

        setTimeout(() => {
            btn.classList.remove('state-hurt');
        }, 500);
    }

    function animateFlying() {
        if (!isFlying) return;
        if (container.classList.contains('hidden')) {
            flyFrameId = requestAnimationFrame(animateFlying);
            return;
        }

        if (!isFlyInitialized) {
            const rect = container.getBoundingClientRect();
            if (rect.width === 0) {
                flyFrameId = requestAnimationFrame(animateFlying);
                return;
            }
            
            container.style.left = rect.left + 'px';
            container.style.top = rect.top + 'px';
            container.style.bottom = 'auto';
            container.style.right = 'auto';
            isFlyInitialized = true;
        }

        let currentLeft = parseFloat(container.style.left);
        let currentTop = parseFloat(container.style.top);

        currentLeft += flyVx;
        currentTop += flyVy;

        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;

        let bounced = false;

        if (currentLeft <= 0 || currentLeft >= maxX) {
            flyVx *= -1;
            currentLeft = Math.max(0, Math.min(currentLeft, maxX));
            bounced = true;
        }
        if (currentTop <= 0 || currentTop >= maxY) {
            flyVy *= -1;
            currentTop = Math.max(0, Math.min(currentTop, maxY));
            bounced = true;
        }

        if (bounced) {
            triggerBounceEffect();
        }

        container.style.left = currentLeft + 'px';
        container.style.top = currentTop + 'px';

        updateOrientation(currentLeft, currentTop);
        updateEmojiState(currentLeft, currentTop);

        flyFrameId = requestAnimationFrame(animateFlying);
    }

    flyFrameId = requestAnimationFrame(animateFlying);
});

// Timer Flash Sale
setInterval(() => {
    const boxes = document.querySelectorAll('.timer-box');
    if(boxes.length === 3) {
        let h = parseInt(boxes[0].innerText), m = parseInt(boxes[1].innerText), s = parseInt(boxes[2].innerText);
        s--; if(s < 0) { s = 59; m--; } if(m < 0) { m = 59; h--; } if(h < 0) { h = 2; m = 0; s = 0; }
        boxes[0].innerText = h < 10 ? '0'+h : h;
        boxes[1].innerText = m < 10 ? '0'+m : m;
        boxes[2].innerText = s < 10 ? '0'+s : s;
    }
}, 1000);
