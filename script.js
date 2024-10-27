document.addEventListener('DOMContentLoaded', () => {
    const animeInput = document.getElementById('animeInput');
    const seasonInput = document.getElementById('seasonInput');
    const episodeInput = document.getElementById('episodeInput');
    const ongoingList = document.getElementById('ongoingList');
    const finishedList = document.getElementById('finishedList');
    const addAnimeButton = document.getElementById('addAnime');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const errorDiv = document.getElementById('error');
    const tabs = document.querySelectorAll('.tab');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const fileInput = document.getElementById('fileInput');
    const popup = document.getElementById('popup');

    let animes = JSON.parse(localStorage.getItem('animes')) || [];

    // Afficher le popup si c'est la première visite
    if (!localStorage.getItem('hasVisited')) {
        popup.style.display = 'flex';
        localStorage.setItem('hasVisited', 'true');
    }

    // Fermer le popup
    document.querySelector('.close-popup').addEventListener('click', () => {
        popup.style.display = 'none';
    });

    function renderAnime() {
        ongoingList.innerHTML = '';
        finishedList.innerHTML = '';

        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        const filteredAnimes = animes.filter(anime =>
            anime.name.toLowerCase().includes(searchTerm)
        );

        filteredAnimes.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'season') return a.season - b.season;
            if (sortBy === 'episode') return a.episode - b.episode;
        });

        filteredAnimes.forEach((anime, index) => {
            const card = document.createElement('div');
            card.classList.add('anime-card');
            card.innerHTML = `
                        <div class="anime-info">
                            <div class="anime-title">${anime.name}</div>
                            <div class="anime-details">Saison: ${anime.season}, Épisode: ${anime.episode}</div>
                        </div>
                        <div class="button-group">
                            <button class="finish-btn">${anime.finished ? 'Reprendre' : 'Terminer'}</button>
                            <button class="edit-btn">Modifier</button>
                            <button class="delete-btn">Supprimer</button>
                        </div>
                    `;

            const finishButton = card.querySelector('.finish-btn');
            finishButton.onclick = () => {
                anime.finished = !anime.finished;
                saveAnimes();
                renderAnime();
            };

            const editButton = card.querySelector('.edit-btn');
            editButton.onclick = () => {
                animeInput.value = anime.name;
                seasonInput.value = anime.season;
                episodeInput.value = anime.episode;
                animes.splice(index, 1);
                saveAnimes();
                renderAnime();
            };

            const deleteButton = card.querySelector('.delete-btn');
            deleteButton.onclick = () => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer "${anime.name}" ?`)) {
                    animes.splice(index, 1);
                    saveAnimes();
                    renderAnime();
                }
            };

            if (anime.finished) {
                finishedList.appendChild(card);
            } else {
                ongoingList.appendChild(card);
            }
        });
    }

    function saveAnimes() {
        localStorage.setItem('animes', JSON.stringify(animes));
    }

    addAnimeButton.addEventListener('click', () => {
        const name = animeInput.value.trim();
        const season = seasonInput.value.trim();
        const episode = episodeInput.value.trim();
        if (name && season && episode) {
            animes.push({ name, season: parseInt(season), episode: parseInt(episode), finished: false });
            saveAnimes();
            renderAnime();
            animeInput.value = '';
            seasonInput.value = '';
            episodeInput.value = '';
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = 'Veuillez remplir tous les champs.';
        }
    });

    searchInput.addEventListener('input', renderAnime);
    sortSelect.addEventListener('change', renderAnime);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'ongoing') {
                ongoingList.style.display = 'grid';
                finishedList.style.display = 'none';
            } else {
                ongoingList.style.display = 'none';
                finishedList.style.display = 'grid';
            }
        });
    });

    // Fonction pour exporter la liste
    exportButton.addEventListener('click', () => {
        const dataStr = JSON.stringify(animes);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'anime_list.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });

    // Fonction pour importer la liste
    importButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedAnimes = JSON.parse(e.target.result);
                    if (Array.isArray(importedAnimes)) {

                        animes = importedAnimes;
                        saveAnimes();
                        renderAnime();
                        alert('Liste importée avec succès !');
                    } else {
                        throw new Error('Format de fichier invalide');
                    }
                } catch (error) {
                    alert('Erreur lors de l\'importation : ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    renderAnime();
});