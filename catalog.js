// Data Katalog Bawaan (Dipisahkan agar modular)
var catalogData = {
    "Pernikahan Bali": [
        {
            type: 'withPhoto', 
            themes: [
                { image: 'https://wayanku.github.io/storybali-undangan/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/foto%20pernikahann%20tema%201.webp', previewUrl: 'https://wayanku.github.io/pernikahan-tema-1/', label: 'Populer', rating: 4.9, reviews: 152 },
                { image: 'https://wayanku.github.io/storybali-undangan/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/pernikahan%20tama%202%20.webp', previewUrl: 'https://wayanku.github.io/pernikahan-tema-2/', rating: 4.2, reviews: 98 },
                { image: 'https://github.com/wayanku/storybali-undangan/blob/main/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/pernikahan%20tema%203.webp?raw=true', previewUrl: 'https://wayanku.github.io/pernikahan-tema-3/' },
                { image: 'https://picsum.photos/id/1045/400/400' }
            ]
        },
        {
            type: 'withoutPhoto',
            themes: [ 
                { image: 'https://picsum.photos/id/1048/400/400', label: 'Populer', rating: 4.9, reviews: 76 },
                { image: 'https://picsum.photos/id/1050/400/400' },
                { image: 'https://picsum.photos/id/1051/400/400' },
                { image: 'https://picsum.photos/id/1052/400/400' }
            ]
        }
    ],
    "Pernikahan Muslim": [
        { type: 'withPhoto', themes: [{ image: 'https://wayanku.github.io/storybali-undangan/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/pernikahan%20muslim%20tema%201.webp', previewUrl: 'https://wayanku.github.io/muslim-tema-1/', label: 'Populer', rating: 5.0, reviews: 88 }, { image: 'https://picsum.photos/id/1062/400/400' }, { image: 'https://picsum.photos/id/1063/400/400' }, { image: 'https://picsum.photos/id/1064/400/400' }] },
        { type: 'withoutPhoto', themes: [{ image: 'https://picsum.photos/id/1065/400/400', label: 'Populer', rating: 4.8, reviews: 45 }, { image: 'https://picsum.photos/id/1066/400/400' }, { image: 'https://picsum.photos/id/1067/400/400' }, { image: 'https://picsum.photos/id/1068/400/400' }] }
    ],
    "Metatah / Potong Gigi": [
        { type: 'withPhoto', themes: [{ image: 'https://wayanku.github.io/storybali-undangan/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/metatah%20tema%201.webp', previewUrl: 'https://wayanku.github.io/metatah-tema-1/', label: 'Populer', rating: 4.9, reviews: 112 }, { image: 'https://picsum.photos/id/212/400/400' }, { image: 'https://picsum.photos/id/214/400/400' }, { image: 'https://picsum.photos/id/215/400/400' }] },
        { type: 'withoutPhoto', themes: [{ image: 'https://picsum.photos/id/216/400/400', label: 'Populer', rating: 4.7, reviews: 65 }, { image: 'https://picsum.photos/id/218/400/400' }, { image: 'https://picsum.photos/id/219/400/400' }, { image: 'https://picsum.photos/id/220/400/400' }] }
    ],
    "3 Bulanan": [
        { type: 'withPhoto', themes: [{ image: 'https://picsum.photos/id/315/400/400', label: 'Populer', rating: 5.0, reviews: 43 }, { image: 'https://picsum.photos/id/316/400/400' }, { image: 'https://picsum.photos/id/317/400/400' }, { image: 'https://picsum.photos/id/318/400/400' }] },
        { type: 'withoutPhoto', themes: [{ image: 'https://picsum.photos/id/319/400/400', label: 'Populer', rating: 4.8, reviews: 21 }, { image: 'https://picsum.photos/id/320/400/400' }, { image: 'https://picsum.photos/id/321/400/400' }, { image: 'https://picsum.photos/id/322/400/400' }] }
    ],
    "Ulang Tahun": [
        { type: 'withPhoto', themes: [{ image: 'https://picsum.photos/id/431/400/400', label: 'Populer', rating: 4.9, reviews: 99 }, { image: 'https://picsum.photos/id/433/400/400' }, { image: 'https://picsum.photos/id/434/400/400' }, { image: 'https://picsum.photos/id/435/400/400' }] },
        { type: 'withoutPhoto', themes: [{ image: 'https://wayanku.github.io/storybali-undangan/foto%20nikah%202,foto%20nikah1,foto%20nikah%203/ulang%20tahun%20tema%201%20tanpa%20foto.webp', previewUrl: 'https://wayanku.github.io/ulang-tahun-tema-1-tanpa-foto/', label: 'Baru', rating: 4.8, reviews: 35 }, { image: 'https://picsum.photos/id/438/400/400' }, { image: 'https://picsum.photos/id/439/400/400' }, { image: 'https://picsum.photos/id/440/400/400' }] }
    ]
};

// Data Kategori untuk Halaman Utama
var categoryData = [
    { name: 'Pernikahan Bali', image: 'https://wayanku.github.io/storybali-undangan/foto%20katalog%20pernikahan%20.jpg' },
    { name: 'Pernikahan Muslim', image: 'https://wayanku.github.io/storybali-undangan/foto%20katalog%20pernikahan%20.jpg' },
    { name: 'Metatah / Potong Gigi', image: 'https://wayanku.github.io/storybali-undangan/foto%20katalog%20metatah.jpg' },
    { name: '3 Bulanan', image: 'https://picsum.photos/id/164/400/400' },
    { name: 'Ulang Tahun', image: 'https://wayanku.github.io/storybali-undangan/foto%20katalog%20ulang%20tahun.jpg' }
];

// Data Fitur Unggulan
var featuresData = [
    { name: 'Smart Dashboard', svg: '<path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M11,15.5V13H7V15.5L9,14.25L11,15.5M17,15.5V13H13V15.5L15,14.25L17,15.5Z"/>' },
    { name: 'Unlimited Share', svg: '<path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L16.04,7.15C16.56,7.62 17.24,7.92 18,7.92C19.66,7.92 21,6.58 21,5C21,3.42 19.66,2 18,2C16.34,2 15,3.42 15,5C15,5.24 15.04,5.47 15.09,5.7L7.96,9.85C7.44,9.38 6.76,9.08 6,9.08C4.34,9.08 3,10.42 3,12C3,13.58 4.34,14.92 6,14.92C6.76,14.92 7.44,14.62 7.96,14.15L15.09,18.3C15.04,18.53 15,18.76 15,19C15,20.58 16.34,22 18,22C19.66,22 21,20.58 21,19C21,17.42 19.66,16.08 18,16.08Z"/>' },
    { name: 'Buku Tamu', svg: '<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20M12 13.5C12.8 13.5 13.5 12.8 13.5 12C13.5 11.2 12.8 10.5 12 10.5S10.5 11.2 10.5 12C10.5 12.8 11.2 13.5 12 13.5M16 17H8V18H16V17M16 15H8V16H16V15Z"/>' },
    { name: 'Custom Tamu', svg: '<path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12M5,13.28L1,10.78L5,8.28V13.28M6,18V20H1V18C1,15.33 4.33,14 7,14C6.5,14 6,14.08 6,14.24V18Z"/>' },
    { name: 'Free Ubah Tema', svg: '<path d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.2 13.3,19 13,19C10.2,19 8,16.8 8,14C8,11.2 10.2,9 13,9C13.3,9 13.5,8.8 13.5,8.5A1.5,1.5 0 0,0 12,7C9.2,7 7,9.2 7,12C7,14.8 9.2,17 12,17C14.8,17 17,14.8 17,12A5,5 0 0,0 12,7Z"/>' },
    { name: 'Musik Autoplay', svg: '<path d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12Z"/>' },
    { name: 'QR Code Check-in', svg: '<path d="M4,4H10V10H4V4M20,4H14V10H20V4M4,20H10V14H4V20M14,14H16V16H14V14M16,16H18V18H16V16M18,14H20V16H18V14M14,18H16V20H14V18M18,18H20V20H18V18M12,12H14V14H12V12M14,12H16V10H14V12M10,12H12V14H10V12M12,10H14V8H12V10M8,12H10V10H8V12M12,6H10V4H12V6M6,12H8V14H6V12M12,14H10V16H12V14M16,12H18V14H16V12Z"/>' },
    { name: 'Layar Sapa', svg: '<path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/>' },
    { name: 'Our Story', svg: '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>' },
    { name: 'Amplop Digital', svg: '<path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>' },
    { name: 'Galeri Foto', svg: '<path d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6H2Z"/>' },
    { name: 'Live Streaming', svg: '<path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>' },
];

// Data Testimoni
var testimonialsData = [
    { name: 'Gungde & Ayu', avatar: 'https://i.pravatar.cc/150?img=1', quote: 'Prosesnya cepat dan hasilnya memuaskan banget! Tim Storybali sangat membantu dan responsif. Undangannya jadi pusat perhatian di hari H.' },
    { name: 'Budi & Santi', avatar: 'https://i.pravatar.cc/150?img=32', quote: 'Desainnya modern dan elegan, persis seperti yang kami mau. Fitur amplop digital juga sangat memudahkan tamu. Recommended!' },
    { name: 'Eka & Putri', avatar: 'https://i.pravatar.cc/150?img=5', quote: 'Suka banget sama semua fiturnya, lengkap dan mudah digunakan. Adminnya juga sabar banget jawabin semua pertanyaan. Mantap!' },
    { name: 'Komang & Dewi', avatar: 'https://i.pravatar.cc/150?img=47', quote: 'Terima kasih Storybali! Undangannya keren dan beda dari yang lain. Banyak teman yang nanya bikin di mana. Sukses selalu!' }
];
