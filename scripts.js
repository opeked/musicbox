// SPOTIFY - busque músicas pelo nome/artista
const SPOTIFY_TOKEN = 'COLE_SEU_ACCESS_TOKEN_AQUI'; // Substitua pelo token real do Spotify

const spotifySearchInput = document.getElementById('spotifySearchInput');
const spotifyGrid = document.getElementById('spotifyGrid');

if (spotifySearchInput && spotifyGrid) {
    spotifySearchInput.addEventListener('input', () => {
        const query = spotifySearchInput.value.trim();
        if (query.length > 2) buscaMusicasSpotify(query);
        else spotifyGrid.innerHTML = '';
    });
}

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

// UPLOAD DE MP3 PERSONALIZADO
const mp3Form = document.getElementById('mp3Form');
const fileInput = document.getElementById('fileInput');
const mp3Title = document.getElementById('mp3Title');
const mp3Author = document.getElementById('mp3Author');
const musicGrid = document.getElementById('musicGrid');
const musicCount = document.getElementById('musicCount');
let musicLibrary = [];

document.addEventListener('DOMContentLoaded', function() {
    loadMusicFromStorage();
});

if (mp3Form) {
    mp3Form.addEventListener('submit', function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        const title = mp3Title.value.trim();
        const author = mp3Author.value.trim();

        if (!file || !title || !author) {
            alert('Preencha todos os campos e selecione um arquivo!');
            return;
        }
        if (!(file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))) {
            alert('Selecione um arquivo MP3!');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(ev) {
            const music = {
                id: Date.now() + Math.random(),
                name: title,
                artist: author,
                url: ev.target.result,
                size: formatFileSize(file.size)
            };
            musicLibrary.push(music);
            saveMusicToStorage();
            displayMusic();
            updateMusicCount();
            mp3Form.reset();
        };
        reader.readAsDataURL(file);
    });
}

function displayMusic(library = musicLibrary) {
    musicGrid.innerHTML = '';
    if (!library.length) {
        musicGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">Nenhuma música enviada</p>';
        return;
    }
    library.forEach((music, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <div class="music-cover"><div class="cover-placeholder">🎶</div></div>
            <div class="music-info">
                <h3 class="music-title">${music.name}</h3>
                <p class="music-artist">${music.artist}</p>
            </div>
            <div class="player-controls">
                <button class="play-btn">▶</button>
            </div>
        `;
        card.querySelector('.play-btn').addEventListener('click', () => {
            playMusic(index);
        });
        musicGrid.appendChild(card);
    });
}

// PLAYER e STORAGE (deixe igual ao seu script.js atual)
let audioPlayer = document.getElementById('audioPlayer');
let playPauseBtn = document.getElementById('playPauseBtn');
let volumeControl = document.getElementById('volumeControl');
let currentMusicIndex = -1;
let isPlaying = false;

if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
}
if (volumeControl) {
    volumeControl.addEventListener('input', changeVolume);
}
if (audioPlayer) {
    audioPlayer.addEventListener('ended', playNextMusic);
    audioPlayer.addEventListener('play', updatePlayButton);
    audioPlayer.addEventListener('pause', updatePlayButton);
}

function togglePlayPause() {
    if (!musicLibrary.length) return;
    if (audioPlayer.src === '' && musicLibrary.length) {
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
function changeVolume() {
    audioPlayer.volume = volumeControl.value / 100;
}
function playMusic(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    currentMusicIndex = index;
    const music = musicLibrary[index];
    audioPlayer.src = music.url;
    audioPlayer.play();
    document.querySelector('.player-title').textContent = music.name;
    document.querySelector('.player-artist').textContent = music.artist;
}
function playNextMusic() {
    currentMusicIndex++;
    if (currentMusicIndex < musicLibrary.length) playMusic(currentMusicIndex);
}
function updateMusicCount() {
    const count = musicLibrary.length;
    musicCount.textContent = `${count} ${count === 1 ? 'música' : 'músicas'}`;
}
function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
function saveMusicToStorage() {
    const data = musicLibrary.map(m => ({
        id: m.id, name: m.name, artist: m.artist, url: m.url, size: m.size
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
