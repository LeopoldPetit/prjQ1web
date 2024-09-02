// Déclaration des variables
const coiffeursList = document.getElementById('coiffeursList');
let coiffeurCounter = 1;
let isLoggedIn = false;
let loading = false;
const resultsPerPage = 10;
let displayedResults = 0;
let filteredCoiffeurs = [];
let coiffeurCounter2 = 1;
// Constants interacting with HTML
const contentWrapper = document.getElementById('contentWrapper');
const otherContent = document.getElementById('otherContent');
const searchBar= document.getElementById('searchBar')
const searchInput = document.getElementById('searchInput');
const fixedButton = document.getElementById('fixedButton');

function showSearchResultsCount() {
    const searchResultCount = document.createElement('span');
    searchResultCount.id = 'searchResultCount';
    searchBar.appendChild(searchResultCount)

}

// Déclaration des fonctions
function openLoginPage() {
    window.location.href = 'http://localhost:3000/login.html';
}

function checkLoginStatus() {
    fetch('http://localhost:3000/api/isLoggedIn')
        .then(response => response.json())
        .then(data => {
            isLoggedIn = data.isLoggedIn;

            if (isLoggedIn) {
                const loginButton = document.getElementById('loginButton');
                loginButton.remove();
                ShowLogoutAndAddButton()
            } else {
                console.log('L\'utilisateur n\'est pas connecté.');
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function ShowLogoutAndAddButton() {
    const navbar = document.querySelector('.navbar');
    const buttonContainer = document.createElement('div');  // Creating a button container
    const addButton = document.createElement('button');
    const addIcon = document.createElement('img');
    const logoutButton = document.createElement('button');
    const logoutIcon = document.createElement('img');
    logoutButton.id = 'logoutButton';
    addButton.id = 'addButton';

    logoutIcon.src = 'img/logout.png';
    logoutIcon.alt = 'Logout';
    addIcon.src = 'img/addIcon.png';
    addIcon.alt = 'add Button';


    logoutButton.appendChild(logoutIcon);
    addButton.appendChild(addIcon);
    addButton.style.backgroundColor = 'transparent';
    // Create your own event listner for add button
    addButton.addEventListener('click', () => {
        openAddPage();
    });

    logoutButton.addEventListener('click', () => {
        fetch('http://localhost:3000/api/logout')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        window.location.reload()
    });

    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(logoutButton);
    navbar.appendChild(buttonContainer);
}

function openAddPage() {
    displayAddCoiffeur();
}

function displayAddCoiffeur() {
    const coiffeurAddContainer = document.getElementById('coiffeurDetailsContainer');
    coiffeurAddContainer.innerHTML = renderAddCoiffeur();

    const secondColumn = document.getElementById('otherContent');
    secondColumn.innerHTML = '';
    secondColumn.appendChild(coiffeurAddContainer);

    openRightSection();
    return true;
}

function renderAddCoiffeur() {
    return `
           <div class="coiffeur-details">
            <div class="detail-row">
                <label class="detail-label" for="nom">Nom:</label>
                <input class="detail-value" type="text" id="nom" name="nom" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="numero">Numéro:</label>
                <input class="detail-value" type="text" id="numero" name="numero" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="voie">Voie:</label>
                <input class="detail-value" type="text" id="voie" name="voie" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="code_postal">Code postal:</label>
                <input class="detail-value" type="text" id="code_postal" name="code_postal" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="ville">Ville:</label>
                <input class="detail-value" type="text" id="ville" name="ville" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="latitude">Latitude:</label>
                <input class="detail-value" type="text" id="latitude" name="latitude" ">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="longitude">Longitude:</label>
                <input class="detail-value" type="text" id="longitude" name="longitude" ">
            </div>
           
            <button class="save-button" onclick="saveNewCoiffeur()" >Ajouter</button>
        </div>
`;
}

function saveNewCoiffeur() {
    const nom = document.getElementById('nom').value;
    const numero = document.getElementById('numero').value;
    const voie = document.getElementById('voie').value;
    const code_postal = document.getElementById('code_postal').value;
    const ville = document.getElementById('ville').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    fetch(`/api/addCoiffeur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, numero, voie, code_postal, ville, latitude, longitude })
    })
        .then((response) => {
            if (response.ok) {
                console.log("Mise à jour réussie");
                reloadCoiffeurs();
            } else {
                console.error('Erreur:', response.statusText);
            }
        })
        .catch((error) => console.error('Erreur:', error));
}



function fetchCoiffeurs(page) {
    fetch(`http://localhost:3000/api/coiffeurs/${page}`)
        .then(response => response.json())
        .then(data => {
            data.coiffeurs.forEach(coiffeur => {
                const div = createCoiffeurDiv(coiffeur, coiffeurCounter++);
                coiffeursList.appendChild(div);
            });
            loading = false;
        })
        .catch(error => console.error('Erreur:', error));
}

function createCoiffeurDiv(coiffeur, counter) {
    const div = document.createElement('div');
    div.innerHTML = `
        ${coiffeur.nom}<br>
        ${coiffeur.numero}<br>
        ${coiffeur.voie}<br>
        ${coiffeur.code_postal}<br>
        ${coiffeur.ville}
        <span class="coiffeurNumber">${counter}</span><br><br>
    `;
    div.classList.add('hover-background');
    div.addEventListener('click', () => {
        displayCoiffeurDetails(coiffeur);
        removeAllSelected();
        div.classList.add('selected');
    });
    div.addEventListener('mouseenter', () => {
        div.style.backgroundColor = '#e630da';
    });
    div.addEventListener('mouseleave', () => {
        div.style.backgroundColor = '';
    });
    return div;
}
function displayResults(startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        const coiffeur = filteredCoiffeurs[i];
        if (!coiffeur) return;

        const div = createCoiffeurDiv(coiffeur, coiffeurCounter2++);
        coiffeursList.appendChild(div);
        displayedResults++;
    }
}
function openRightSection() {
    const firstColumn = document.getElementById('contentWrapper');
    const secondColumn = document.getElementById('otherContent');

    firstColumn.style.width = '50%';
    secondColumn.style.width = '50%';
    firstColumn.style.transition = 'width 0.5s ease-in-out';
    secondColumn.style.transition = 'width 0.5s ease-in-out';
    firstColumn.classList.add('first-column');
    secondColumn.classList.add('second-column');

    const fixedButton = document.getElementById('fixedButton');
    fixedButton.classList.add('visible');
}
function removeAllSelected() {
    const divs = document.querySelectorAll('.selected');
    divs.forEach(div => {
        div.classList.remove('selected');
    });
}
function closeRightSection() {
    const firstColumn = document.getElementById('contentWrapper');
    const secondColumn = document.getElementById('otherContent');
    const fixedButton = document.getElementById('fixedButton');

    removeAllSelected();

    firstColumn.style.width = '100%';
    firstColumn.style.transition = 'width 0.5s ease-in-out';
    firstColumn.classList.remove('first-column');

    secondColumn.style.width = '0';
    secondColumn.style.transition = 'width 0.5s ease-in-out';
    secondColumn.classList.remove('second-column');

    fixedButton.classList.remove('visible');
}
function renderCoiffeurDetails(coiffeur) {
    if (isLoggedIn) {
        return `
           <div class="coiffeur-details">
            <div class="detail-row">
                <label class="detail-label" for="nom">Nom:</label>
                <input class="detail-value" type="text" id="nom" name="nom" value="${coiffeur.nom}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="numero">Numéro:</label>
                <input class="detail-value" type="text" id="numero" name="numero" value="${coiffeur.numero}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="voie">Voie:</label>
                <input class="detail-value" type="text" id="voie" name="voie" value="${coiffeur.voie}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="code_postal">Code postal:</label>
                <input class="detail-value" type="text" id="code_postal" name="code_postal" value="${coiffeur.code_postal}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="ville">Ville:</label>
                <input class="detail-value" type="text" id="ville" name="ville" value="${coiffeur.ville}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="latitude">Latitude:</label>
                <input class="detail-value" type="text" id="latitude" name="latitude" value="${coiffeur.latitude}">
            </div>
            <div class="detail-row">
                <label class="detail-label" for="longitude">Longitude:</label>
                <input class="detail-value" type="text" id="longitude" name="longitude" value="${coiffeur.longitude}">
            </div>
           
            <button class="save-button" onClick="saveChanges('${coiffeur.nom}')">Enregistrer</button>
        </div>
`;
    } else {
        return `
        <div class="coiffeur-details">
            <div class="detail-row">
                <strong class="detail-label">Nom:</strong>
                <span><strong>${coiffeur.nom}</strong></span>
            </div>
            <div class="detail-row">
                <strong class="detail-label">Numéro:</strong>
                <span>${coiffeur.numero}</span>
            </div>
            <div class="detail-row">
                <strong class="detail-label">Voie:</strong>
                <span>${coiffeur.voie}</span>
            </div>
            <div class="detail-row">
                <strong class="detail-label">Code postal:</strong>
                <span>${coiffeur.code_postal}</span>
            </div>
            <div class="detail-row">
                <strong class="detail-label">Ville:</strong>
                <span>${coiffeur.ville}</span>
            </div>
        </div>`;
    }
}
function saveChanges(NameBeforeChange) {
    const nom = document.getElementById('nom').value;
    console.log(NameBeforeChange);
    console.log(nom);
    const numero = document.getElementById('numero').value;
    const voie = document.getElementById('voie').value;
    const code_postal = document.getElementById('code_postal').value;
    const ville = document.getElementById('ville').value;

    fetch(`/api/coiffeurs/${NameBeforeChange}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, numero, voie, code_postal, ville })
    })
        .then((response) => {
            if (response.ok) {
                console.log("Mise à jour réussie");
                reloadCoiffeurs();
            } else {
                console.error('Erreur:', response.statusText);
            }
        })
        .catch((error) => console.error('Erreur:', error));
}
function createMapContainer() {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.margin = '0 20px';
    mapContainer.style.height = '400px';
    return mapContainer;
}
function addMap(coiffeur) {
    const map = L.map('map').setView([coiffeur.latitude, coiffeur.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([coiffeur.latitude, coiffeur.longitude]).addTo(map)
        .bindPopup(`<b>${coiffeur.nom}</b><br>${coiffeur.voie}, ${coiffeur.code_postal}, ${coiffeur.ville}`)
        .openPopup();
}

function displayCoiffeurDetails(coiffeur) {
    const coiffeurDetailsContainer = document.getElementById('coiffeurDetailsContainer');
    coiffeurDetailsContainer.innerHTML = renderCoiffeurDetails(coiffeur);
    const mapContainer = createMapContainer();

    const secondColumn = document.getElementById('otherContent');
    secondColumn.innerHTML = '';
    secondColumn.appendChild(coiffeurDetailsContainer);
    secondColumn.appendChild(mapContainer);

    // add map to the container
    addMap(coiffeur);

    openRightSection();
    return true;
}

function reloadCoiffeurs() {
    // Efface la liste actuelle des coiffeurs affichés
    coiffeursList.innerHTML = '';

    // Réinitialise les compteurs et les résultats affichés
    coiffeurCounter = 1;
    displayedResults = 0;

    // Recharge les coiffeurs
    fetchCoiffeurs(1);
}




contentWrapper.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = contentWrapper;
    if (scrollHeight - scrollTop === clientHeight && !loading) {
        loading = true;
        const currentPage = document.querySelectorAll('.hover-background').length / 5 + 1;
        fetchCoiffeurs(currentPage);
    }
});
window.addEventListener('scroll', () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight &&
        displayedResults < filteredCoiffeurs.length
    ) {
        const endIndex = displayedResults + resultsPerPage;
        displayResults(displayedResults, endIndex);
    }
});
otherContent.addEventListener('wheel', (event) => {
    event.preventDefault(); // Bloque le défilement
});

// Event listener for searchInput
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    fetch(`http://localhost:3000/api/allCoiffeurs?searchTerm=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            // Mettre à jour la liste de coiffeurs filtrés avec les données reçues du serveur
            filteredCoiffeurs = data.coiffeurs;

            // Effacer la liste actuelle de coiffeurs affichés
            coiffeursList.innerHTML = '';

            displayedResults = 0; // Réinitialiser le nombre de résultats affichés
            displayResults(0, resultsPerPage); // Afficher les 10 premiers résultats
        })
        .catch(error => console.error('Erreur:', error));
});
document.addEventListener('DOMContentLoaded', () => {

    const coiffeurDetailsContainer = document.createElement('div');
    coiffeurDetailsContainer.id = 'coiffeurDetailsContainer';
    document.body.appendChild(coiffeurDetailsContainer);

});
fixedButton.addEventListener('click', () => {closeRightSection()});


// Appels de fonctions


fetchCoiffeurs(1);
checkLoginStatus();





