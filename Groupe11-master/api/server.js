const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const usersFilePath = path.resolve(__dirname, 'data/user.json');
const dbPath = path.resolve(__dirname, 'data/coiffeurs.db');
let isLoggedIn = false;
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // Utilisation de bodyParser pour traiter les données JSON
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serveur des fichiers statiques



// Route pour récupérer tous les coiffeurs
app.get('/api/allCoiffeurs', (req, res) => {
    const searchTerm = req.query.searchTerm.toLowerCase(); // Récupérer le terme de recherche depuis la requête

    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Erreur de connexion à la base de données' });
            return;
        }
        console.log('Connected to the SQLite database.');
    });

    let query = 'SELECT nom, numero, voie, code_postal, ville, latitude, longitude FROM coiffeurs';

    if (searchTerm) {
        query += ' WHERE';
        query += ' LOWER(nom) LIKE ?';
        query += ' OR LOWER(numero) LIKE ?';
        query += ' OR LOWER(voie) LIKE ?';
        query += ' OR LOWER(code_postal) LIKE ?';
        query += ' OR LOWER(ville) LIKE ?';
        query += ' OR LOWER(latitude) LIKE ?';
        query += ' OR LOWER(longitude) LIKE ?';
    }

    db.all(
        query,
        searchTerm ? Array(7).fill(`%${searchTerm}%`) : [], // Si un terme est fourni, ajouter-le en tant que paramètre de recherche pour chaque colonne
        (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Erreur de base de données' });
            } else {
                res.json({ coiffeurs: rows });
            }
        }
    );


    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Disconnected from the SQLite database.');
        }
    });
});
app.put('/api/coiffeurs/:name', (req, res) => {
    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Erreur de connexion à la base de données' });
        }
        console.log('Connected to the SQLite database.');
    });

    const query = 'UPDATE coiffeurs SET nom = ?, numero = ?, voie = ?, code_postal = ?, ville = ? WHERE nom = ?';
    const params = [req.body.nom, req.body.numero, req.body.voie, req.body.code_postal, req.body.ville, req.params.name];

    db.run(query, params, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Erreur lors de la mise à jour des données' });
        } else {
            res.json({ success: true });
            console.log('changes saved')
        }
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Disconnected from the SQLite database.');
        }
    });
});

// Route pour récupérer les coiffeurs paginés et triés par nom
app.get('/api/coiffeurs/:page', (req, res) => {
    const page = req.params.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Erreur de connexion à la base de données' });
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    db.all(
        'SELECT nom, numero, voie, code_postal, ville, latitude, longitude FROM coiffeurs ORDER BY nom ASC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Erreur de base de données' });
            } else {
                res.json({ coiffeurs: rows });
            }
        }
    );

    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Disconnected from the SQLite database.');
        }
    });
});

// Route pour récupérer la page de connexion
app.get('/login.html', (req, res) => {
    fs.readFile(path.join(__dirname, '..', 'public', 'login.html'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de la lecture de la page de connexion');
        } else {
            res.send(data);
        }
    });
});

// Route racine pour la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'main.html'));
    console.log(isLoggedIn);
});


// Route pour la connexion
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur de lecture du fichier des utilisateurs' });
            return;
        }

        try {
            const users = JSON.parse(data).users;

            const user = users.find(user => user.username === username && user.password === password);

            if (user) {
                isLoggedIn = true;
                res.status(200).json({ message: 'Connexion réussie' });
            } else {
                res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
            }
        } catch (parseError) {
            console.error(parseError);
            res.status(500).json({ error: 'Erreur de parsing du fichier des utilisateurs' });
        }
    });
});

// Route pour vérifier l'état de connexion
app.get('/api/isLoggedIn', (req, res) => {
    res.json({ isLoggedIn });
});

// Route pour la déconnexion
app.get('/api/logout', (req, res) => {
    isLoggedIn = false;
    console.log('L\'utilisateur a été déconnecté.');
    console.log(isLoggedIn);
    res.json({ success: true });
});

app.post('/api/addCoiffeur', (req, res) => {
    const { nom, numero, voie, code_postal, ville, latitude, longitude } = req.body;

    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Erreur de connexion à la base de données');
            return;
        }
        console.log('Connected to the SQLite database for adding a new coiffeur.');
    });

    const query = `INSERT INTO coiffeurs (nom, numero, voie, code_postal, ville, latitude, longitude) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [nom, numero, voie, code_postal, ville, latitude, longitude];

    db.run(query, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Erreur lors de l\'ajout du coiffeur');
        } else {
            res.json({ success: true, message: 'Nouveau coiffeur ajouté', id: this.lastID });
        }
    });

    db.close();
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
