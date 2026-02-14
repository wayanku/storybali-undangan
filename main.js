// [OPTIMASI] Fungsi Debounce untuk menunda eksekusi fungsi hingga user berhenti mengetik
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
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

// [BARU] Muat Wishlist dari localStorage
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

// --- KONFIGURASI GLOBAL & DATA ---

// [BARU] Konfigurasi Paginasi Katalog
const CATALOG_PAGE_SIZE = 6;
let currentCatalogPage = 1;
let currentCatalogItems = [];

const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxb3dmmUNQx194aXNdhnw14tcPpbovfSzCoUGbuR2QHawRD8UbuRC5zr8cXA3lzdL2Mkg/exec';
let allOrdersCache = []; // Cache untuk data pesanan

// [BARU] Data Master Layanan (Default)
const SERVICES_DATA = [
    { id: 'Buat Undangan Mandiri', label: 'Buat Undangan', icon: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />', color: '#FF5722', bg: '#FFF3E0' },
    { id: 'Fotografer', label: 'Fotografer', icon: '<path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />', color: '#2196F3', bg: '#E3F2FD' },
    { id: 'MUA & Busana', label: 'MUA & Rias', icon: '<path d="M12,2C13.11,2 14,2.89 14,4V8H10V4C10,2.89 10.89,2 12,2M13.53,10H10.47C8.5,10 6.79,11.37 6.34,13.29L6.12,14.23C5.89,15.21 6.63,16.13 7.63,16.13H16.37C17.37,16.13 18.11,15.21 17.88,14.23L17.66,13.29C17.21,11.37 15.5,10 13.53,10M19,18H5V22H19V18Z" />', color: '#E91E63', bg: '#FCE4EC' },
    { id: 'Edit Tamu', label: 'Edit Tamu', icon: '<path d="M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C19.86,11.09 20.21,11.09 20.42,11.3L21.7,12.58C21.91,12.79 21.91,13.14 21.7,13.35M12,18.94L18.06,12.88L20.11,14.93L14.06,21H12V18.94M12,14C7.58,14 4,15.79 4,18V20H10V18.1L12,16.12V14M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6Z" />', color: '#4CAF50', bg: '#E8F5E9' },
    { id: 'Dekorasi', label: 'Dekorasi', icon: '<path d="M12,2L14.5,8.5L21,9.8L16.5,14.5L17.3,21L12,17.8L6.7,21L7.5,14.5L3,9.8L9.5,8.5L12,2M12,5.8L10.4,10L6.1,10.6L9.3,13.6L8.4,17.8L12,15.7L15.6,17.8L14.7,13.6L17.9,10.6L13.6,10L12,5.8Z" />', color: '#9C27B0', bg: '#F3E5F5' },
    { id: 'Catering', label: 'Catering', icon: '<path d="M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" />', color: '#FF9800', bg: '#FFF3E0' },
    { id: 'Sewa Mobil', label: 'Sewa Mobil', icon: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01M6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16M17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16M5 11L6.5 6.5H17.5L19 11H5Z" />', color: '#607D8B', bg: '#ECEFF1' },
    { id: 'Lainnya', label: 'Lainnya', icon: '<path d="M4,4H8V8H4V4M10,4H14V8H10V4M16,4H20V8H16V4M4,10H8V14H4V10M10,10H14V14H10V10M16,10H20V14H16V10M4,16H8V20H4V16M10,16H14V20H10V16M16,16H20V20H16V16Z" />', color: '#795548', bg: '#EFEBE9' }
];

// --- Fungsi untuk Mengambil Data dari Google Sheets ---
function fetchCatalogFromGoogleSheet() {
    if (!GOOGLE_SHEET_API_URL) return;

    console.log("Fetching data from:", GOOGLE_SHEET_API_URL);
    // [UPDATE] Tambahkan timestamp agar tidak dicache oleh browser
    fetch(`${GOOGLE_SHEET_API_URL}?v=${new Date().getTime()}&action=read`)
        .then(response => {
            // [PERBAIKAN] Cek status HTTP terlebih dahulu
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || (Array.isArray(data) && data.length === 0) || data.status === 'error') {
                console.warn("Data kosong atau error dari Sheet:", data);
                
                // [PERBAIKAN] Fallback: Render layanan default jika sheet kosong agar menu tidak hilang
                renderServices([]); 

                // [PERBAIKAN] Beri notifikasi jika admin sedang login agar tahu masalahnya
                if (localStorage.getItem('adminPassword')) {
                    // Tunggu sebentar agar fungsi showToast siap
                    setTimeout(() => {
                        if (typeof showToast === 'function') showToast("Data Sheet Kosong. Silakan Sync dari Admin.");
                    }, 2000);
                }
                return;
            }
            console.log("Data berhasil dimuat dari Sheet:", data.length, "baris");
            
            // [DEBUG] Log kategori yang ditemukan untuk memastikan semua sheet terbaca
            const categoriesFound = [...new Set(data.map(item => item.category))];
            console.log("Kategori ditemukan:", categoriesFound);

            // [PERBAIKAN] Hapus penyimpanan cache katalog agar selalu real-time
            // localStorage.setItem('catalogCache', JSON.stringify(data));
            processCatalogData(data);
        })
        .catch(error => {
            console.error("Gagal memuat data dari Google Sheets (Cek Deployment/CORS):", error);
            // [PERBAIKAN] Beri notifikasi visual jika gagal fetch (biasanya masalah CORS atau Offline)
            if (typeof window.showToast === 'function') {
                window.showToast("Gagal koneksi ke server data (Cek Izin Script/CORS).");
            }
        });
}

// Fungsi helper untuk memproses data katalog
function processCatalogData(data) {
    // [PERBAIKAN] Validasi ketat: Data harus Array dan tidak kosong
    if (!Array.isArray(data) || data.length === 0) {
        console.log("Database online kosong atau format salah. Menggunakan data katalog bawaan.");
        return;
    }

    // [BARU] Deteksi Header Hilang di Halaman Depan
    // Mencegah aplikasi crash atau blank jika sheet rusak
    if (data.length > 0 && !data[0].hasOwnProperty('category') && !data[0].hasOwnProperty('themeName')) {
        console.error("Header Sheet Hilang! Mengabaikan data sheet dan menggunakan data bawaan.");
        if (typeof showToast === 'function') showToast("Gangguan Data Server (Header Hilang).");
        return; // Keluar agar data bawaan tidak tertimpa data rusak
    }

    const newCatalogData = {};
    let visitorMessageData = null;
    let servicesConfig = []; // [BARU] Konfigurasi layanan dari admin
    allOrdersCache = [];
    
    // [BARU] Set untuk melacak kategori yang ditemukan di Sheet
    const sheetCategories = new Set();

    data.forEach(row => {
        if (row.category === 'ORDERS') {
            allOrdersCache.push(row);
        } else if (row.category === 'ADMIN_SERVICES') { // [BARU] Ambil config layanan
            servicesConfig.push(row);
        } else if (row.category === 'ADMIN_CONFIG' && row.type === 'VISITOR_MESSAGE') {
            visitorMessageData = row;
        }
    });

    data.forEach(row => {
        // [PERBAIKAN] Skip kategori internal agar tidak muncul di halaman depan
        if (['ORDERS', 'ADMIN_CONFIG', 'ADMIN_SERVICES'].includes(row.category)) {
            return;
        }

        // [PERBAIKAN] Skip jika data tidak memiliki kategori (baris kosong/rusak)
        if (!row.category) return;

        // [BARU] Catat kategori
        sheetCategories.add(row.category);

        if (!newCatalogData[row.category]) {
            newCatalogData[row.category] = [
                { type: 'withPhoto', themes: [] },
                { type: 'withoutPhoto', themes: [] }
            ];
        }

        const typeIndex = row.type === 'withoutPhoto' ? 1 : 0;
        // Pastikan array themes ada sebelum push (safety check)
        if (newCatalogData[row.category][typeIndex]) {
            const themesList = newCatalogData[row.category][typeIndex].themes;
            
            // [PERBAIKAN] Logika Deduplikasi: Prioritaskan data terbaru (baris bawah di Sheet)
            // Cari index tema yang sudah ada dengan nama yang sama
            const existingIndex = themesList.findIndex(t => t.themeName === row.themeName);
            
            if (existingIndex !== -1) {
                // Jika ada, TIMPA dengan data baru (karena data sheet dibaca top-to-bottom, yang bawah adalah update terbaru)
                themesList[existingIndex] = row;
            } else {
                // Jika belum ada, tambahkan
                themesList.push(row);
            }
        }
    });

    // [PERBAIKAN] Cek apakah data baru memiliki tema. Jika tidak (hanya config), jangan timpa data bawaan.
    let hasThemes = false;
    for (const cat in newCatalogData) {
        if (newCatalogData[cat].some(type => type.themes.length > 0)) {
            hasThemes = true;
            break;
        }
    }

    if (hasThemes) {
        catalogData = newCatalogData;
    } else {
        console.log("Sheet tidak memiliki data tema. Mempertahankan data katalog bawaan.");
    }
    
    // [BARU] Sinkronisasi Kategori Homepage dengan Data Sheet
    let categoriesUpdated = false;
    sheetCategories.forEach(catName => {
        // Cek apakah kategori ini sudah ada di categoryData bawaan
        const exists = categoryData.some(c => c.name === catName);
        if (!exists) {
            // Jika kategori baru, tambahkan ke categoryData
            // Ambil gambar dari tema pertama di kategori tersebut sebagai cover
            let catImage = 'https://via.placeholder.com/400x400?text=New+Category';
            if (newCatalogData[catName]) {
                const withPhoto = newCatalogData[catName][0].themes;
                if (withPhoto.length > 0 && withPhoto[0].image) catImage = withPhoto[0].image;
            }

            categoryData.push({ name: catName, image: catImage });
            categoriesUpdated = true;
        }
    });
    // Jika ada kategori baru, render ulang grid kategori di homepage
    if (categoriesUpdated) { loadCategories(); }
    
    // [BARU] Render Menu Layanan berdasarkan config
    renderServices(servicesConfig);
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

// [PERBAIKAN] Fungsi loadCategories dipindahkan ke global scope agar bisa diakses processCatalogData
function loadCategories() {
    const categoryGrid = document.getElementById('category-grid');
    if (!categoryGrid) return;

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
        
        if (window.observeElements) window.observeElements([card]);
    });
}

// [BARU] Fungsi Render Menu Layanan
function renderServices(adminConfig) {
    const container = document.getElementById('service-menu-container');
    if (!container) return;
    container.innerHTML = '';

    SERVICES_DATA.forEach(service => {
        // Cek apakah ada config dari admin, jika tidak ada default TRUE (tampil)
        const config = adminConfig.find(row => row.themeName === service.id);
        const isVisible = config ? (String(config.visible) !== 'false') : true;

        if (isVisible) {
            const item = document.createElement('div');
            item.className = 'service-item';
            item.setAttribute('data-id', service.id);
            item.onclick = () => handleServiceClick(service.id);
            item.innerHTML = `
                <div class="service-icon-box" style="color: ${service.color}; background-color: ${service.bg};">
                    <svg viewBox="0 0 24 24">${service.icon}</svg>
                </div>
                <span class="service-label">${service.label}</span>
            `;
            container.appendChild(item);
        }
    });
    
    // Jika semua layanan disembunyikan, sembunyikan container agar rapi
    if (container.children.length === 0) {
        container.style.display = 'none';
    } else {
        container.style.display = 'grid';
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
    const loadMoreBtn = document.getElementById('load-more-btn'); // [BARU]
    const featuresWrapper = document.querySelector('.features-full-width-wrapper');
    const testimonialsSection = document.querySelector('.testimonials-section');
    const paymentMethodsSection = document.querySelector('.payment-methods-section');
    const footerContainer = document.querySelector('.footer').parentElement;
    const themeTitle = document.getElementById('theme-title'); 
    const backButton = document.querySelector('.back-button');
    const btnWithoutPhoto = document.getElementById('btn-without-photo');
    const btnFavorites = document.getElementById('btn-favorites'); // [BARU]
    const themeToggleButtons = document.querySelectorAll('.theme-toggle button');
    const catalogGrid = document.getElementById('catalog-grid');
    const categoryGrid = document.getElementById('category-grid');
    const socialFloat = document.querySelector('.social-float');
    const socialToggleBtn = document.getElementById('social-toggle-btn');
    const customModal = document.getElementById('custom-modal');
    const notificationModal = document.getElementById('notification-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartModal = document.getElementById('cart-modal');
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
    
    // [BARU] Setup Intersection Observer untuk Scroll Reveal
    // [OPTIMASI] Pasang event listener untuk aksi katalog & kategori sekali saja di parent
    categoryGrid.addEventListener('click', handleCategoryClick);
    // [OPTIMASI] Pasang event listener untuk aksi katalog sekali saja di parent
    catalogGrid.addEventListener('click', handleCatalogAction);

    const revealObserverOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Hanya animasi sekali
            }
        });
    }, revealObserverOptions);
    
    // Fungsi helper untuk observe elemen baru
    window.observeElements = function(elements) {
        elements.forEach(el => {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        });
    };

    const orderSound = new Audio('https://github.com/wayanku/storybali-undangan/raw/main/apple-pay-sound-effect_43nu5Zaa.mp3');
    orderSound.load();

    let lastFocusedElement;
    const navCartBadge = document.getElementById('nav-cart-badge');
    
    let shoppingCart = window.shoppingCart || [];

    function saveCart() {
        try {
            localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
        } catch (e) { console.error("Gagal menyimpan keranjang ke localStorage:", e); }
    }

    const animationDuration = 400;

    // Fungsi loadCategories telah dipindahkan ke global scope

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
                
                // [BARU] Tambahkan ke observer
                window.observeElements([item]);
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
                
                // [BARU] Tambahkan ke observer
                window.observeElements([card]);
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
    // [BARU] Inisialisasi Dots
    const dotsContainer = document.getElementById('slider-dots-container');
    if (dotsContainer && coverSlides.length > 0) {
        coverSlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }

    function changeSlide() {
        if (coverSlides.length === 0) return;
        
        // Hapus active dari slide & dot lama
        coverSlides[currentSlideIndex].classList.remove('active-slide');
        const dots = document.querySelectorAll('.slider-dot');
        if(dots.length > 0) dots[currentSlideIndex].classList.remove('active');

        currentSlideIndex = (currentSlideIndex + 1) % coverSlides.length;
        
        // Tambah active ke slide & dot baru
        coverSlides[currentSlideIndex].classList.add('active-slide');
        if(dots.length > 0) dots[currentSlideIndex].classList.add('active');
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
                currentCatalogPage = 1; // Reset halaman saat buka kategori baru
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
        const isFavorites = btnFavorites && btnFavorites.classList.contains('active'); // [BARU]
        
        // [DIUBAH] Hanya tampilkan skeleton saat halaman pertama
        if (currentCatalogPage === 1) {
            generateSkeletonCatalog(CATALOG_PAGE_SIZE);
        }

        setTimeout(() => {
            generateItems(isWithoutPhoto, isFavorites);
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

    function generateItems(isWithoutPhoto, isFavorites) {
        const categoryName = themeTitle.textContent.replace('Pilihan Tema ', '');
        const categoryThemeData = catalogData[categoryName] || [];
        const themeType = isWithoutPhoto ? 'withoutPhoto' : 'withPhoto';
        const themeSet = categoryThemeData.find(set => set.type === themeType);
        const themes = themeSet ? themeSet.themes : [];
        
        const itemsWithId = themes.map((theme, index) => {
            return {
                ...theme,
                id: `${categoryName.replace(/\s/g, '-')}-${themeType}-${index}`,
                themeName: theme.themeName || `${isWithoutPhoto ? 'Tanpa Foto' : 'Tema'} ${index + 1}`,
                categoryName: categoryName,
            };
        });

        const searchTerm = searchInput.value.toLowerCase();
        currentCatalogItems = itemsWithId.filter(item => {
            const isHidden = item.visible === false || String(item.visible).trim().toLowerCase() === 'false';
            const matchesSearch = item.themeName.toLowerCase().includes(searchTerm);
            
            // [BARU] Filter Favorit
            if (isFavorites) {
                return matchesSearch && !isHidden && wishlist.includes(item.id);
            }
            return matchesSearch && !isHidden;
        });

        // [DIUBAH] Logika paginasi
        const itemsToRender = currentCatalogItems.slice(0, currentCatalogPage * CATALOG_PAGE_SIZE);

        if (currentCatalogPage === 1) {
            catalogGrid.innerHTML = ''; // Bersihkan hanya di halaman pertama
            
            // [BARU] Tampilan jika tidak ada hasil pencarian
            if (currentCatalogItems.length === 0) {
                catalogGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--secondary-text);">
                        <div style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;">🔍</div>
                        <h3 style="margin: 0 0 10px 0; color: var(--primary-text);">Tidak ada tema ditemukan</h3>
                        <p style="margin: 0;">Coba kata kunci lain atau ubah filter kategori.</p>
                    </div>
                `;
                loadMoreBtn.classList.add('hidden');
                return;
            }
        }

        // Tampilkan/sembunyikan tombol "Load More"
        if (itemsToRender.length < currentCatalogItems.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }

        // Render item untuk halaman saat ini
        const startIndex = (currentCatalogPage - 1) * CATALOG_PAGE_SIZE;
        const newItems = itemsToRender.slice(startIndex);

        newItems.forEach((theme, index) => {
            const { id, themeName } = theme;
            const price = theme.price ? `Rp ${parseInt(theme.price).toLocaleString('id-ID')}` : 'Rp 50.000';
            const originalPriceDisplay = theme.originalPrice ? `Rp ${parseInt(theme.originalPrice).toLocaleString('id-ID')}` : 'Rp 100.000';
            let discount = theme.discount || '50%';
            // [PERBAIKAN] Konversi desimal (0.5) ke persen (50%)
            if (!isNaN(discount) && Number(discount) <= 1 && Number(discount) > 0) {
                discount = Math.round(Number(discount) * 100) + "%";
            }

            const labelHtml = theme.label ? `<span class="catalog-item-label">${theme.label}</span>` : '';
            const previewTagHtml = theme.previewUrl ? `<span class="catalog-item-preview-tag">Tersedia</span>` : `<span class="catalog-item-preview-tag coming-soon-tag">Coming Soon</span>`;

            // [BARU] Cek status Wishlist
            const isWishlisted = wishlist.includes(id);
            const heartClass = isWishlisted ? 'wishlist-btn active' : 'wishlist-btn';
            const heartIcon = isWishlisted ? '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.28 2,8.5C2,5.42 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.09C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5C22,12.28 18.6,15.36 13.45,20.04L12,21.35Z" />' : '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.09C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.42 2,8.5C2,12.28 5.4,15.36 10.55,20.04L12,21.35L13.45,20.03C18.6,15.36 22,12.28 22,8.5C22,5.42 19.58,3 16.5,3Z" />';

            // [BARU] Cek status di keranjang
            const isInCart = shoppingCart.some(cartItem => cartItem.id === id);

            const orderBtnClass = isInCart ? 'btn-primary add-to-cart-btn added' : 'btn-primary add-to-cart-btn';
            const orderBtnText = isInCart ? 'Ditambahkan ✓' : 'Order';
            const orderBtnDisabled = isInCart ? 'disabled' : '';
            const orderBtnSvg = isInCart ? '' : '<svg viewBox="0 0 24 24"><path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75L7.2,14.64L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2H1Z" /></svg>';

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
            item.dataset.itemId = id; // [BARU] Tambahkan ID ke elemen untuk referensi

            item.innerHTML = `
                <div class="catalog-image-wrapper">
                    ${labelHtml}
                    <img src="${theme.image}" alt="${themeName}" class="catalog-item-image" loading="lazy" decoding="async">
                    ${previewTagHtml}
                    <button class="${heartClass}" data-id="${id}" onclick="toggleWishlist('${id}', this)" style="position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); border-radius:50%; width:30px; height:30px; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                        <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:${isWishlisted ? '#e53e3e' : '#94a3b8'}; transition:fill 0.3s;">${heartIcon}</svg>
                    </button>
                    <button onclick="shareTheme('${themeName}', '${theme.previewUrl || window.location.href}')" style="position:absolute; top:50px; right:10px; background:rgba(255,255,255,0.9); border-radius:50%; width:30px; height:30px; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:5; box-shadow:0 2px 5px rgba(0,0,0,0.1);" title="Bagikan">
                        <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:#4a5568;"><path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L16.04,7.15C16.56,7.62 17.24,7.92 18,7.92C19.66,7.92 21,6.58 21,5C21,3.42 19.66,2 18,2C16.34,2 15,3.42 15,5C15,5.24 15.04,5.47 15.09,5.7L7.96,9.85C7.44,9.38 6.76,9.08 6,9.08C4.34,9.08 3,10.42 3,12C3,13.58 4.34,14.92 6,14.92C6.76,14.92 7.44,14.62 7.96,14.15L15.09,18.3C15.04,18.53 15,18.76 15,19C15,20.58 16.34,22 18,22C19.66,22 21,20.58 21,19C21,17.42 19.66,16.08 18,16.08Z" /></svg>
                    </button>
                </div>
                <div class="catalog-item-details">
                    <div class="catalog-item-header">
                        <h4 class="catalog-item-title">
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
                        <button class="${orderBtnClass}" data-item-id="${id}" ${orderBtnDisabled}>${orderBtnSvg}${orderBtnText}</button>
                    </div>
                </div>
            `;
            catalogGrid.appendChild(item);
            
            // [BARU] Tambahkan ke observer
            window.observeElements([item]);
            
            setTimeout(() => item.style.opacity = '1', 50);
        });

        // [OPTIMASI] Event listener untuk .view-theme-btn dipindahkan ke handleCatalogAction
    }

    // [BARU] Fungsi Toggle Wishlist Global
    window.toggleWishlist = function(id, btn) {
        const index = wishlist.indexOf(id);
        const svg = btn.querySelector('svg');
        
        if (index === -1) {
            wishlist.push(id);
            btn.classList.add('active');
            svg.style.fill = '#e53e3e';
            svg.innerHTML = '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.28 2,8.5C2,5.42 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.09C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5C22,12.28 18.6,15.36 13.45,20.04L12,21.35Z" />';
            showToast('Ditambahkan ke Favorit');
        } else {
            wishlist.splice(index, 1);
            btn.classList.remove('active');
            svg.style.fill = '#94a3b8';
            svg.innerHTML = '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.09C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.42 2,8.5C2,12.28 5.4,15.36 10.55,20.04L12,21.35L13.45,20.03C18.6,15.36 22,12.28 22,8.5C22,5.42 19.58,3 16.5,3Z" />';
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    };

    let isSharing = false;
    // [BARU] Fungsi Share Theme
    window.shareTheme = function(title, url) {
        if (navigator.share) {
            if (isSharing) return;
            isSharing = true;
            navigator.share({
                title: 'Storybali Undangan',
                text: `Cek tema undangan keren ini: ${title}`,
                url: url
            }).catch(err => {
                if (err.name !== 'AbortError') console.error(err);
            }).finally(() => {
                isSharing = false;
            });
        } else {
            navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
                showToast('Link berhasil disalin!');
            });
        }
    };

    // [BARU] Event delegation untuk tombol di katalog
    // [DIUBAH] Event delegation untuk tombol di katalog, sekarang dengan animasi
    function handleCatalogAction(event) {
        const target = event.target;
        const addToCartBtn = target.closest('.add-to-cart-btn');
        const viewThemeBtn = target.closest('.view-theme-btn'); // [OPTIMASI]

        if (addToCartBtn && !addToCartBtn.classList.contains('added')) {
            const itemId = addToCartBtn.dataset.itemId;
            const itemToAdd = currentCatalogItems.find(item => item.id === itemId);
            
            if (itemToAdd) {
                // [PINDAH] Logika animasi "fly to cart" dipindahkan ke sini agar lebih efisien
                const buttonRect = addToCartBtn.getBoundingClientRect();
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
                
                addToCart(itemToAdd);
            }
        } else if (viewThemeBtn && !viewThemeBtn.href.includes('http')) { // [OPTIMASI]
            // Hanya jalankan jika href BUKAN link eksternal
            event.preventDefault();
            lastFocusedElement = viewThemeBtn;
            showModal();
        }
    }
    
    function addToCart(item) {
        if (!item) return;
        orderSound.currentTime = 0;
        orderSound.play().catch(error => console.log("Autoplay diblokir oleh browser:", error));

        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        shoppingCart.push(item);
        updateCartUI();
        saveCart();

        // [BARU] Update tampilan tombol setelah ditambahkan
        const button = document.querySelector(`.add-to-cart-btn[data-item-id="${item.id}"]`);
        if (button) {
            button.classList.add('added');
            button.innerHTML = 'Ditambahkan ✓';
            button.disabled = true;
        }

        // Shake animation for cart icons, using the correctly defined variables
        if (headerCartIcon) {
            headerCartIcon.classList.add('shake');
            setTimeout(() => headerCartIcon.classList.remove('shake'), 400);
        }
        if (navCartIcon && window.getComputedStyle(navCartIcon).display !== 'none') {
            navCartIcon.classList.add('shake');
            setTimeout(() => navCartIcon.classList.remove('shake'), 400);
        }
    }

    function removeFromCart(itemId) {
        shoppingCart = shoppingCart.filter(item => item.id !== itemId);

        // [BARU] Update tampilan tombol setelah dihapus dari keranjang
        const button = document.querySelector(`.add-to-cart-btn[data-item-id="${itemId}"]`);
        if (button) {
            button.classList.remove('added');
            button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75L7.2,14.64L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2H1Z" /></svg>Order';
            button.disabled = false;
        }

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
        
        // [BARU] Tambahkan tombol Hapus Semua jika belum ada
        let clearBtn = document.getElementById('cart-clear-all-btn');
        if (!clearBtn && shoppingCart.length > 0) {
            clearBtn = document.createElement('button');
            clearBtn.id = 'cart-clear-all-btn';
            clearBtn.className = 'btn-secondary';
            clearBtn.style.cssText = 'width:100%; margin-top:10px; color:var(--danger-color); border-color:var(--danger-color); font-size:0.85em; padding:8px;';
            clearBtn.textContent = 'Hapus Semua Item';
            clearBtn.onclick = () => { if(confirm('Kosongkan keranjang?')) { shoppingCart = []; updateCartUI(); renderCartModal(); saveCart(); } };
            // Sisipkan sebelum tombol tutup
            document.getElementById('cart-close-btn').parentNode.insertBefore(clearBtn, document.getElementById('cart-close-btn'));
        } else if (shoppingCart.length === 0 && clearBtn) {
            clearBtn.remove();
        }

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

        // [BARU] Update URL dengan parameter tipe form agar bisa dibagikan langsung
        let urlType = 'general';
        if (activeFormType === 'wedding') urlType = 'pernikahan';
        else if (activeFormType === 'metatah') urlType = 'metatah';
        else if (activeFormType === 'birthday') urlType = 'ulangtahun';
        else if (activeFormType === '3 bulanan') urlType = '3bulanan';

        history.pushState({page: 'form'}, `Formulir Pesanan`, `#form?type=${urlType}`);
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

            // [BARU] Ambil harga dari tema yang sedang dipilih di keranjang
            const selectedEl = document.querySelector('.cart-item-full.selected');
            const selectedId = selectedEl ? selectedEl.dataset.itemId : (shoppingCart.length > 0 ? shoppingCart[0].id : null);
            const selectedItem = selectedId ? shoppingCart.find(item => item.id === selectedId) : null;
            // Bersihkan format harga (misal "Rp 50.000" -> 50000)
            const orderPrice = (selectedItem && selectedItem.price) ? (parseInt(String(selectedItem.price).replace(/[^0-9]/g, '')) || 0) : 0;

            const sheetPayload = {
                action: 'save',
                category: 'ORDERS',
                type: 'active',
                themeName: orderID,
                image: clientName,
                previewUrl: 'Menunggu Konfirmasi',
                price: 0, 
                originalPrice: orderPrice, // [PERBAIKAN] Kirim harga asli tema
                discount: '-', 
                label: orderTimestamp, 
                visible: false // [PERBAIKAN] Default 'false' (Belum Lunas) untuk pesanan baru
            };

            saveOrderToSheet(sheetPayload)
                .then(() => {
                    waMessage = `*ID PESANAN: ${orderID}*\n(Simpan ID ini untuk cek status)\n\n` + waMessage;
                    // [DIUBAH] Langsung arahkan ke WhatsApp tanpa menampilkan modal sukses
                    btn.textContent = originalText;
                    btn.disabled = false;
                    window.location.href = `https://wa.me/6285738517248?text=${encodeURIComponent(waMessage)}`;
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

    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', function() {
            if (trackInterval) clearInterval(trackInterval);
            const modal = document.getElementById('track-order-modal');
            if (modal) {
                modal.classList.add('active');
                const result = document.getElementById('track-result');
                if (result) result.classList.add('hidden');
                const linkSection = document.getElementById('track-link-section');
                if (linkSection) linkSection.classList.add('hidden'); // Reset link section
                const input = document.getElementById('track-order-id-input');
                if (input) input.value = '';
            }
        });
    }

    const trackModalCloseBtn = document.querySelector('#track-order-modal .btn-secondary');
    if (trackModalCloseBtn) {
        trackModalCloseBtn.addEventListener('click', () => {
            if (trackInterval) clearInterval(trackInterval);
        });
    }

    if (checkOrderBtn) {
        checkOrderBtn.addEventListener('click', function() {
            const inputEl = document.getElementById('track-order-id-input');
            const inputID = inputEl ? inputEl.value.trim() : '';
        if (!inputID) { alert("Masukkan ID Pesanan!"); return; }

        // [PERBAIKAN] Reset tampilan sebelum loading agar tidak muncul data lama
        document.getElementById('track-result').classList.add('hidden');
        document.getElementById('track-link-section').classList.add('hidden');
        document.getElementById('track-link-display').value = ''; 
        document.getElementById('track-open-link').href = '#';

        const btn = this;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<div class="loading-spinner" style="position:static; transform:none;"><div class="dot" style="background:white; width:6px; height:6px;"></div><div class="dot" style="background:white; width:6px; height:6px;"></div><div class="dot" style="background:white; width:6px; height:6px;"></div></div>';
        btn.disabled = true;

        if (trackInterval) clearInterval(trackInterval);

        function fetchAndUpdateStatus(orderID) {
            fetch(`${GOOGLE_SHEET_API_URL}?v=${new Date().getTime()}`)
                .then(res => {
                    if (!res.ok) throw new Error('Respon jaringan bermasalah.');
                    return res.json();
                })
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
                        
                        // [BARU] Update Warna Badge Status
                        const badge = document.getElementById('track-status-badge');
                        if (progress === 100) {
                            badge.textContent = "Selesai";
                            badge.style.background = "#dcfce7";
                            badge.style.color = "#166534";
                        } else if (progress > 50) {
                            badge.textContent = "Hampir Jadi";
                            badge.style.background = "#fef9c3";
                            badge.style.color = "#854d0e";
                        } else {
                            badge.textContent = "Diproses";
                            badge.style.background = "#e0f2fe";
                            badge.style.color = "#0369a1";
                        }
                        
                        // [BARU] Tampilkan Link Undangan jika ada
                        // [PERBAIKAN] Validasi ketat: Hanya tampilkan jika formatnya benar-benar LINK (http/https)
                        const linkSection = document.getElementById('track-link-section');
                        const linkUrl = order.discount ? order.discount.trim() : '';
                        
                        if (linkUrl && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
                            linkSection.classList.remove('hidden');
                            document.getElementById('track-link-display').value = linkUrl;
                            document.getElementById('track-open-link').href = linkUrl;
                        } else {
                            linkSection.classList.add('hidden');
                        }
                        
                    } else {
                        alert("ID Pesanan tidak ditemukan!");
                        resultDiv.classList.add('hidden');
                        if (trackInterval) clearInterval(trackInterval);
                    }
                })
                .catch(error => {
                    console.error("Gagal melacak pesanan:", error);
                    alert("Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
                    if (trackInterval) clearInterval(trackInterval); // Hentikan percobaan berulang
                    document.getElementById('track-result').classList.add('hidden');
                })
                .finally(() => { if(btn) { btn.innerHTML = originalContent; btn.disabled = false; } });
        }

        fetchAndUpdateStatus(inputID);
        trackInterval = setInterval(() => fetchAndUpdateStatus(inputID), 7000);
        });
    }
    
    // [BARU] Event Listener untuk tombol Salin Link di Lacak Pesanan
    const trackCopyLinkBtn = document.getElementById('track-copy-link');
    if (trackCopyLinkBtn) {
        trackCopyLinkBtn.addEventListener('click', function() {
            const linkText = document.getElementById('track-link-display').value;
            if(linkText) {
                navigator.clipboard.writeText(linkText).then(() => {
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '<svg style="width:16px;height:16px;fill:#10b981" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>';
                    setTimeout(() => { this.innerHTML = originalHTML; }, 2000);
                });
            }
        });
    }

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
        // [PERUBAHAN] Jika service adalah 'Edit Tamu', buka halaman baru
        if (serviceName === 'Edit Tamu') {
            window.location.href = 'edit-tamu.html';
            return;
        }
        
        if (serviceName === 'Buat Undangan Mandiri') {
            window.location.href = 'buat undangan/buat-undangan.html';
            return;
        }

        // Deskripsi untuk setiap layanan
        const descriptions = {
            'Wedding Organizer': "Wujudkan pernikahan impian tanpa stres! Tim WO kami siap membantu perencanaan dari A-Z agar momen spesialmu berjalan sempurna.",
            'Fotografer': "Abadikan setiap momen berharga dengan kualitas terbaik. Fotografer profesional kami siap menangkap senyuman dan emosi di hari bahagiamu.",
            'MUA & Busana': "Tampil memukau di hari istimewa dengan sentuhan MUA berpengalaman dan koleksi busana adat maupun modern yang elegan.",
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
        const clickedItem = document.querySelector(`.service-item[data-id="${serviceName}"] .service-icon-box`);
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

        // [PERBAIKAN] Handle jika keranjang kosong (akses langsung via link)
        const selectedId = (shoppingCart.length > 1) 
            ? document.querySelector('.cart-item-full.selected').dataset.itemId
            : (shoppingCart.length > 0 ? shoppingCart[0].id : null);
        
        const selectedItem = selectedId ? shoppingCart.find(item => item.id === selectedId) : null;
        message += `*TEMA YANG DIPESAN*\n`;
        if (selectedItem) {
            message += `- ${selectedItem.themeName} (${selectedItem.categoryName}) - ${selectedItem.price}`;
        } else {
            message += `- (Tema dipilih via Link/Admin)`;
        }
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

        // [PERBAIKAN] Handle jika keranjang kosong (akses langsung via link)
        const selectedId = (shoppingCart.length > 1)
            ? document.querySelector('.cart-item-full.selected').dataset.itemId
            : (shoppingCart.length > 0 ? shoppingCart[0].id : null);
        
        const selectedItem = selectedId ? shoppingCart.find(item => item.id === selectedId) : null;
        message += `*TEMA YANG DIPESAN*\n`;
        if (selectedItem) {
            message += `- ${selectedItem.themeName} (${selectedItem.categoryName}) - ${selectedItem.price}`;
        } else {
            message += `- (Tema dipilih via Link/Admin)`;
        }
        return message;
    }

    function handleCategoryClick(event) {
        // [OPTIMASI] Event delegation, 'this' sekarang adalah grid, jadi kita cari dari event.target
        const button = event.target.closest('.category-button');
        if (!button) return;

        const categoryCard = button.closest('.category-card');
        const categoryName = categoryCard.querySelector('h4.category-card-title').textContent;
        themeTitle.textContent = `Pilihan Tema ${categoryName}`;
        updateActiveNav(categoryName);
        history.pushState({page: 'catalog'}, `Katalog - ${categoryName}`, '#katalog');
        switchPage(mainMenu, themePage); 
        
        // [BARU] Refresh data dari server saat membuka kategori agar real-time
        fetchCatalogFromGoogleSheet();
    }

    backButton.addEventListener('click', function() {
        const currentPage = this.closest('.page');
        if (currentPage.id === 'cart-page') {
            switchPage(cartPage, mainMenu);
        } else {
            history.back();
        }
    });

    // [BARU] Event listener untuk tombol Load More
    loadMoreBtn.addEventListener('click', function() {
        currentCatalogPage++;
        generateCatalog();
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
        if (cartModal) {
            cartModal.classList.remove('active');
        }
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

    // [OPTIMASI] Debounce search input untuk mencegah pemanggilan fungsi yang berlebihan saat mengetik cepat
    const debouncedSearch = debounce(() => {
        if (!themePage.classList.contains('hidden')) {
            currentCatalogPage = 1; // Reset halaman ke 1 setiap kali ada pencarian baru
            generateCatalog();
        }
    }, 300); // Jeda 300ms setelah user berhenti mengetik
    searchInput.addEventListener('input', debouncedSearch);

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
            
            // [BARU] Refresh data dari server saat membuka kategori via nav
            fetchCatalogFromGoogleSheet();
        });
    });

    generateFeatureSkeletons();
    generateTestimonialSkeletons();
    
    // [PERBAIKAN] Panggil loadCategories dengan sedikit delay awal untuk efek animasi
    setTimeout(loadCategories, 500);
    loadFeatures();
    loadStaticTestimonials();
    loadPaymentMethods();
    updateCartUI();
    
    // [BARU] Observe elemen statis yang sudah ada di HTML
    const staticElements = document.querySelectorAll('.flash-sale-section, .shopee-vouchers-scroll, .service-menu-section, .order-guide-section');
    window.observeElements(staticElements);
    
    // [BARU] Fungsi Buka Form Langsung (untuk handleInitialRouting)
    function openFormDirectly(type) {
        // Sembunyikan semua form dulu
        weddingForm.classList.add('hidden');
        metatahForm.classList.add('hidden');
        birthdayForm.classList.add('hidden');

        // Reset activeFormType
        activeFormType = '';

        if (type === 'pernikahan') {
            weddingForm.classList.remove('hidden');
            activeFormType = 'wedding';
            document.getElementById('checkout-form-title').textContent = 'Lengkapi Data Pernikahan';
        } else if (type === 'metatah') {
            metatahForm.classList.remove('hidden');
            activeFormType = 'metatah';
            document.getElementById('checkout-form-title').textContent = 'Lengkapi Data Metatah';
        } else if (type === 'ulangtahun') {
            birthdayForm.classList.remove('hidden');
            activeFormType = 'birthday';
            document.getElementById('checkout-form-title').textContent = 'Lengkapi Data Ulang Tahun';
            document.querySelector('#birthday-data-form label[for="birthday-name"]').textContent = 'Nama (Yang Berulang Tahun)';
        } else if (type === '3bulanan') {
            birthdayForm.classList.remove('hidden');
            activeFormType = '3 bulanan';
            document.getElementById('checkout-form-title').textContent = 'Lengkapi Data 3 Bulanan';
            document.querySelector('#birthday-data-form label[for="birthday-name"]').textContent = 'Nama Bayi';
        }

        if (activeFormType) {
            // Buka halaman form langsung
            const currentPage = document.querySelector('.page:not(.hidden)') || mainMenu;
            switchPage(currentPage, checkoutFormPage);
        }
    }

    // [BARU] Fungsi untuk menangani routing berdasarkan hash URL saat halaman dimuat
    function handleInitialRouting() {
        const hash = window.location.hash;
        
        // Jika tidak ada hash, tidak melakukan apa-apa
        if (!hash) return;

        // Menunggu sebentar agar halaman utama selesai di-setup
        setTimeout(() => {
            if (hash === '#keranjang') {
                openCartPage();
            } else if (hash.startsWith('#form')) {
                // [BARU] Cek apakah ada parameter type di URL (misal: #form?type=metatah)
                const parts = hash.split('?');
                if (parts.length > 1) {
                    const params = new URLSearchParams(parts[1]);
                    const type = params.get('type');
                    if (type) {
                        openFormDirectly(type);
                        return; // Stop di sini, jangan cek keranjang
                    }
                }

                // Cek kondisi keranjang sebelum ke halaman form
                if (shoppingCart.length === 0) {
                    // Jika keranjang kosong, arahkan ke halaman keranjang dan beri notifikasi
                    openCartPage(); // Ini akan menampilkan 'Keranjang Kosong'
                    showNotification('Keranjang Kosong', 'Silakan tambahkan tema ke keranjang terlebih dahulu sebelum mengisi form.');
                } else {
                    // Jika ada item, buka halaman keranjang dulu
                    openCartPage();
                    
                    // Beri jeda agar halaman keranjang selesai render
                    setTimeout(() => {
                        const checkoutBtn = document.getElementById('checkout-full-btn');
                        if (checkoutBtn && !checkoutBtn.disabled) {
                            // Jika tombol checkout aktif (biasanya jika hanya 1 item), klik otomatis
                            checkoutBtn.click();
                        }
                    }, 400); // Jeda 400ms
                }
            }
        }, 500); // Jeda 500ms untuk memastikan semua data awal (termasuk dari cache) sudah dimuat
    }

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
    
    // [BARU] Fungsi Toast Global (bisa dipanggil dari mana saja)
    window.showToast = function(msg) {
        toastMessage.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    function startNotificationLoop() {
        setTimeout(showSocialProof, 45000); // Delay awal diperlama jadi 45 detik
        setInterval(showSocialProof, Math.floor(Math.random() * (150000 - 90000 + 1)) + 90000); // Interval diperlama jadi 1.5 - 2.5 menit
    }
    startNotificationLoop();

    // [BARU] Panggil fungsi routing setelah semua setup selesai
    handleInitialRouting();
    
    // [PERBAIKAN] Panggil fetch data DI DALAM DOMContentLoaded agar fungsi showToast sudah siap
    // dan tidak terjadi race condition
    fetchCatalogFromGoogleSheet();

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

    // [BARU] Inisialisasi Efek Ripple pada Tombol
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add("ripple-effect");

        const ripple = button.getElementsByClassName("ripple-effect")[0];
        if (ripple) ripple.remove();

        button.appendChild(circle);
    }

    // Pasang event listener ke semua tombol utama
    const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .voucher-btn, .category-button");
    buttons.forEach((btn) => btn.addEventListener("click", createRipple));
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

// [BARU] Pendaftaran Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
            .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
}

// [BARU] Logic Scroll to Top
const scrollTopBtn = document.getElementById('scroll-to-top-btn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
            scrollTopBtn.style.transform = 'translateY(0)';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
            scrollTopBtn.style.transform = 'translateY(20px)';
        }
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
