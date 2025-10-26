// Variables
let audioPlayer = document.getElementById('audioPlayer');
let playPauseBtn = document.getElementById('playPauseBtn');
let volumeControl = document.getElementById('volumeControl');
let searchInput = document.getElementById('searchInput');
let uploadArea = document.getElementById('uploadArea');
let fileInput = document.getElementById('fileInput');
let fileList = document.getElementById('fileList');
let musicGrid = document.getElementById('musicGrid');
let musicCount = document.getElementById('musicCount');

let musicLibrary = [];
let currentMusicIndex = -1;
let isPlaying = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadMusicFromStorage();
});

// Event Listeners
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    volumeControl.addEventListener('input', changeVolume);
    searchInput.addEventListener('input', filterMusic);
    
    // Upload Area
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    fileInput.addEventListener('change', handleFileUpload);
    audioPlayer.addEventListener('ended', playNextMusic);
    audioPlayer.addEventListener('play', updatePlayButton);
    audioPlayer.addEventListener('pause', updatePlayButton);
}

// Play/Pause
function togglePlayPause() {
    if (musicLibrary.length === 0) {
        alert('Adicione músicas primeiro!');
        return;
    }
    
    if (audioPlayer.src === '') {
        playMusic(0);
    } else if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
}

function updatePlayButton() {
    isPlaying = !audioPlayer.paused;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
}

// Volume Control
function changeVolume() {
    audioPlayer.volume = volumeControl.value / 100;
}

// File Upload
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave() {
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
}

function handleFileUpload(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const music = {
                    id: Date.now() + Math.random(),
                    name: file.name.replace('.mp3', ''),
                    artist: 'Artista Desconhecido',
                    url: e.target.result,
                    size: formatFileSize(file.size)
                };
                
                musicLibrary.push(music);
                saveMusicToStorage();
                displayMusic();
                updateMusicCount();
                displayFileItem(file.name, music.size);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// Display Music
function displayMusic(library = musicLibrary) {
    musicGrid.innerHTML = '';
    
    if (library.length === 0) {
        musicGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">Nenhuma música encontrada</p>';
        return;
    }
    
    library.forEach((music, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <div class="music-cover">
                <div class="cover-placeholder">🎶</div>
            </div>
            <div class="music-info">
                <h3 class="music-title">${music.name}</h3>
                <p class="music-artist">${music.artist}</p>
            </div>
            <div class="player-controls">
                <button class="play-btn">▶</button>
            </div>
        `;
        
        card.querySelector('.play-btn').addEventListener('click', () => {
            currentMusicIndex = musicLibrary.indexOf(music);
            playMusic(currentMusicIndex);
        });
        
        musicGrid.appendChild(card);
    });
}

function displayFileItem(name, size) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
        <span class="file-item-name">📁 ${name}</span>
        <span class="file-item-size">${size}</span>
    `;
    fileList.appendChild(item);
    
    setTimeout(() => {
        item.remove();
    }, 5000);
}

// Music Controls
function playMusic(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    currentMusicIndex = index;
    const music = musicLibrary[index];
    
    audioPlayer.src = music.url;
    audioPlayer.play();
    
    updatePlayerInfo(music);
}

function playNextMusic() {
    currentMusicIndex++;
    if (currentMusicIndex < musicLibrary.length) {
        playMusic(currentMusicIndex);
    }
}

function updatePlayerInfo(music) {
    document.querySelector('.player-title').textContent = music.name;
    document.querySelector('.player-artist').textContent = music.artist;
}

// Search
function filterMusic() {
    const query = searchInput.value.toLowerCase();
    const filtered = musicLibrary.filter(music => 
        music.name.toLowerCase().includes(query) ||
        music.artist.toLowerCase().includes(query)
    );
    displayMusic(filtered);
}

// Utilities
function updateMusicCount() {
    const count = musicLibrary.length;
    musicCount.textContent = `${count} ${count === 1 ? 'música' : 'músicas'}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Local Storage
function saveMusicToStorage() {
    const data = musicLibrary.map(music => ({
        id: music.id,
        name: music.name,
        artist: music.artist,
        url: music.url,
        size: music.size
    }));
    localStorage.setItem('musicLibrary', JSON.stringify(data));
}

function loadMusicFromStorage() {
    const data = localStorage.getItem('musicLibrary');
    if (data) {
        musicLibrary = JSON.parse(data);
        displayMusic();
        updateMusicCount();
    }
}
// Spotify API (consulta pública)
const SPOTIFY_TOKEN = 'BQC6r1rd4Q-5kqUhqUKulCUuVOl3xNxcoJ-2CwLbxlZIAKyZDXqgyTaAl6IFDrcZyrxNbYB570uY_aZ0o35TmRkvPrPTXYpq2Qw4R-zH-S8KsX0moaOCTo-8glCUPQqgcWLoxcaOiXkhe5NKkVPzVBuQ_XLHUjE5WssmSclFVbKwkOUB7hLodr6ncQGnr-ldNI5vMdmhb2g0tt9tiwvh4lPduxAsb0HtAiKDVdVhtosel_RV17zXYbsCUo0quKrrB1Rz5CNmi1AaIDodHdhtbKQ-wicCxSLNeLY1vG-6jx4C25sbzBX5T0BH0yTlXZLODA_XN_9b'; // Troque por seu token válido obtido no painel Spotify Developer

const spotifySearchInput = document.getElementById('spotifySearchInput');
const spotifyGrid = document.getElementById('spotifyGrid');

if (spotifySearchInput && spotifyGrid) {
    spotifySearchInput.addEventListener('input', () => {
        const query = spotifySearchInput.value.trim();
        if (query.length > 2) buscaMusicasSpotify(query);
        else spotifyGrid.innerHTML = '';
    });
}

// Busca faixas do Spotify
async function buscaMusicasSpotify(query) {
    spotifyGrid.innerHTML = '<p>Carregando...</p>';
    try {
        const resp = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=6`, {
            headers: { Authorization: 'Bearer ' + SPOTIFY_TOKEN }
        });
        const data = await resp.json();
        if (!data.tracks || !data.tracks.items.length) {
            spotifyGrid.innerHTML = '<p>Nenhuma música encontrada no Spotify.</p>';
            return;
        }
        renderSpotifyTracks(data.tracks.items);
    } catch (e) {
        spotifyGrid.innerHTML = '<p>Erro ao buscar músicas do Spotify.</p>';
    }
}

function renderSpotifyTracks(tracks) {
    spotifyGrid.innerHTML = '';
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'spotify-card';
        card.innerHTML = `
            <img src="${track.album.images[1]?.url || track.album.images[0]?.url}" alt="${track.name}">
            <div class="spotify-title">${track.name}</div>
            <div class="spotify-artist">${track.artists.map(a => a.name).join(', ')}</div>
            <button class="spotify-play" onclick="window.open('${track.external_urls.spotify}', '_blank')">Ouvir no Spotify</button>
        `;
        spotifyGrid.appendChild(card);
    });
}

