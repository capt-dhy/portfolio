
// Anime List Configuration
const animeList = [
    'Naruto',
    'Demon Slayer: Kimetsu no Yaiba',
    'Bleach',
    'Jujutsu Kaisen',
    'Sword Art Online',
    'Black Clover',
    'Hunter x Hunter',
    'Solo Leveling',
    'Hell\'s Paradise', // Jigokuraku
    'Fire Force',
    'The Eminence in Shadow',
    'Cyberpunk: Edgerunners',
    'Death Note',
    'Blue Lock',
    'Tsukimichi: Moonlit Fantasy', // Corrected title for better match
    'Classroom of the Elite',
    'The Misfit of Demon King Academy',
    'The Devil is a Part-Timer!',
    'Attack on Titan',
    'Dandadan',
    'The God of High School',
    'My Hero Academia', // Corrected title
    'Kaiju No. 8',
    'Record of Ragnarok',
    'Arcane' // Note: Arcane might not be in Jikan (MAL) as it's not "anime" by strict MAL standards, but we'll try. If not, it won't show or we can handle it.
];

const animeContainer = document.querySelector('#anime .hobby-grid');

// Jikan API Base URL
const API_BASE = 'https://api.jikan.moe/v4/anime';

// Function to create card HTML
const createAnimeCard = (anime) => {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    
    // Use the large image if available, fallback to default
    const imageUrl = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
    const title = anime.title_english || anime.title;
    const genre = anime.genres[0] ? anime.genres[0].name : 'Anime';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${title}" class="anime-bg">
        <div class="anime-content">
            <h3 class="anime-title">${title}</h3>
            <p>${genre}</p>
        </div>
    `;
    
    // Event Listener for Modal (instead of direct link)
    card.addEventListener('click', () => {
        openModal(anime);
    });
    
    return card;
};

// Modal Elements
const modal = document.getElementById('anime-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalSynopsis = document.getElementById('modal-synopsis');
const modalWatchLink = document.getElementById('modal-watch-link');
const modalMalLink = document.getElementById('modal-mal-link');
const closeModalBtn = document.querySelector('.close-modal');

// Open Modal Function (Generic for Anime & Games)
const openModal = (item, type = 'anime') => {
    // Common Data
    modalTitle.textContent = item.title_english || item.title;
    
    if (type === 'anime') {
        // Anime Specifics
        modalImg.src = item.images.jpg.large_image_url || item.images.jpg.image_url;
        modalSynopsis.textContent = item.synopsis || "No synopsis available.";
        
        modalMeta.innerHTML = `
            <span><i class="fas fa-star" style="color: gold;"></i> ${item.score || 'N/A'}</span>
            <span><i class="fas fa-tv"></i> ${item.episodes || '?'} eps</span>
            <span><i class="fas fa-calendar"></i> ${item.year || 'Unknown'}</span>
        `;

        const searchQuery = encodeURIComponent(item.title_english || item.title);
        modalWatchLink.href = `https://www.crunchyroll.com/search?q=${searchQuery}`;
        modalWatchLink.innerHTML = '<i class="fas fa-play" style="margin-right: 8px;"></i> Watch Now';
        
        modalMalLink.style.display = 'inline-block';
        modalMalLink.href = item.url;
        modalMalLink.innerText = 'More Info';

    } else if (type === 'game') {
        // Game Specifics
        modalImg.src = item.image;
        modalSynopsis.textContent = item.description || "No description available.";
        
        modalMeta.innerHTML = `
            <span><i class="fas fa-gamepad" style="color: var(--secondary);"></i> ${item.genre}</span>
            <span><i class="fas fa-calendar"></i> ${item.year || '202X'}</span>
        `;

        modalWatchLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' gameplay')}`;
        modalWatchLink.innerHTML = '<i class="fab fa-youtube" style="margin-right: 8px;"></i> Gameplay';
        
        modalMalLink.style.display = 'inline-block';
        modalMalLink.href = `https://www.google.com/search?q=${encodeURIComponent(item.title + ' wiki')}`;
        modalMalLink.innerText = 'Wiki';
    }

    // Show Modal
    modal.classList.add('active');
    if(typeof lenis !== 'undefined') lenis.stop();
};

// Close Modal Function
const closeModal = () => {
    modal.classList.remove('active');
    if(typeof lenis !== 'undefined') lenis.start();
};

// Close Events
if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});


// Fetch and Render Anime
// Fetch and Render Anime (with LocalStorage Caching)
const fetchAnime = async () => {
    if(animeContainer) animeContainer.innerHTML = '';
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const name of animeList) {
        // Check Cache First
        const cacheKey = `animeData_${name}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            // Use Cached Data (Instant)
            try {
                const anime = JSON.parse(cachedData);
                const card = createAnimeCard(anime);
                // Attach generic modal opener
                card.removeEventListener('click', () => {}); 
                card.addEventListener('click', () => openModal(anime, 'anime'));
                animeContainer.appendChild(card);
                continue; // Skip fetch
            } catch (e) {
                console.error('Error parsing cache for', name, e);
                localStorage.removeItem(cacheKey);
            }
        }

        // Fetch from API if not cached
        try {
            const response = await fetch(`${API_BASE}?q=${encodeURIComponent(name)}&limit=1`);
            
            if (response.status === 429) {
                console.warn(`Rate limit hit for ${name}. Waiting 4s...`);
                await delay(4000); 
                // Skip this iteration to avoid breaking loop, user can refresh later
                continue; 
            }

            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const anime = data.data[0];
                
                // Save to Cache
                localStorage.setItem(cacheKey, JSON.stringify(anime));

                const card = createAnimeCard(anime);
                card.removeEventListener('click', () => {}); 
                card.addEventListener('click', () => openModal(anime, 'anime'));
                animeContainer.appendChild(card);
            }
        } catch (error) {
            console.error(`Error fetching ${name}:`, error);
        }
        
        // Delay for API (only if we actually fetched)
        await delay(1000); 
    }
};

// Games List Configuration (Simulated API)
const gamesList = [
    { 
        title: 'Free Fire', 
        genre: 'Battle Royale', 
        year: '2017',
        description: 'A world-famous survival shooter game available on mobile. Each 10-minute game places you on a remote island where you are pit against 49 other players, all seeking survival.',
        image: 'https://placehold.co/400x600/1a1a1a/bc13fe?text=Free+Fire&font=montserrat' 
    },
    { 
        title: 'Blood Strike', 
        genre: 'FPS', 
        year: '2023',
        description: 'Blood Strike is a fast-paced battle royale FPS optimized for low-end devices. Experience unlimited respawns and tactical combat.',
        image: 'https://placehold.co/400x600/1a1a1a/bc13fe?text=Blood+Strike&font=montserrat' 
    },
    { 
        title: 'Need for Speed: Unbound', 
        genre: 'Racing', 
        year: '2022',
        description: 'Race against time, outsmart the cops, and take on weekly qualifiers to reach The Grand, Lakeshore\'s ultimate street racing challenge.',
        image: 'https://placehold.co/400x600/1a1a1a/bc13fe?text=NFS+Unbound&font=montserrat' 
    }
];

const gamesContainer = document.querySelector('#games .hobby-grid');

// Render Games Function
const renderGames = () => {
    if(!gamesContainer) return;
    gamesContainer.innerHTML = '';

    gamesList.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('anime-card');
        
        card.innerHTML = `
            <img src="${game.image}" alt="${game.title}" class="anime-bg">
            <div class="anime-content">
                <h3 class="anime-title">${game.title}</h3>
                <p>${game.genre}</p>
            </div>
        `;
        
        // Modal Event for Games
        card.addEventListener('click', () => {
             openModal(game, 'game');
        });

        gamesContainer.appendChild(card);
    });
};

// Video Modal Logic
const initVideoModal = () => {
    const trigger = document.getElementById('hakari-trigger');
    const videoModal = document.getElementById('video-modal');
    const closeVideoBtn = document.getElementById('close-video');
    const videoElement = document.getElementById('hakari-video');

    if (!trigger || !videoModal || !videoElement) return;

    const openVideo = () => {
        videoModal.classList.add('active');
        videoElement.currentTime = 0;
        videoElement.play().catch(e => console.log("Autoplay blocked:", e));
        if(typeof lenis !== 'undefined') lenis.stop();
    };

    const closeVideo = () => {
        videoModal.classList.remove('active');
        videoElement.pause();
        if(typeof lenis !== 'undefined') lenis.start();
    };

    trigger.addEventListener('click', openVideo);
    
    if(closeVideoBtn) closeVideoBtn.addEventListener('click', closeVideo);
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideo();
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideo();
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAnime();
    renderGames();
    initVideoModal();
});
