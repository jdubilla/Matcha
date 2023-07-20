const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const argon2 = require('argon2');

const app = express();

const connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'rootpass',
	database: 'flirtopia',
});

connection.connect((err) => {
	if (err) {
		console.error('Erreur de connexion à la base de données:', err);
	} else {
		console.log('Connecté à la base de données MySQL !');
	}
});

app.use(cors());
app.use(express.json());

const acceptJsonOnly = (req, res, next) => {
	if (req.is('json')) {
	  next();
	} else {
	  res.status(400).json({ error: 'Requête accepte uniquement le format JSON.' });
	}
};

app.get('/users', (req, res) => {
	const query = 'SELECT * FROM user';

	connection.query(query, (err, results) => {
		if (err) {
			console.error('Erreur lors de l\'exécution de la requête:', err);
			res.status(500).json({ error: 'Erreur lors de la récupération des éléments.' });
		} else {
			// console.log(results);
			res.json(results);
		}
	});
});

app.post('/signup', acceptJsonOnly, async (req, res) => {
	try {
		const { email, username, firstName, lastName, password } = req.body;

		if (!email || !username || !firstName || !lastName || !password) {
			throw new Error('Tous les champs sont obligatoires.');
		}

		const hashedPassword = await argon2.hash(password);

		const sql = 'INSERT INTO user (email, username, firstName, lastName, password) VALUES (?, ?, ?, ?, ?);';
		const values = [email, username, firstName, lastName, hashedPassword];

		connection.query(sql, values, (err, result) => {
			if (err) {
				console.error('Erreur lors de l\'ajout de l\'utilisateur :', err);
				return res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de l\'utilisateur.' });
			}
			console.log('Nouvel utilisateur ajouté avec l\'ID :', result.insertId);
			res.json({ success: true });
		});
	} catch (error) {
		// console.error('Erreur lors de l\'ajout de l\'utilisateur :', error.message);
		res.status(400).json({ error: error.message }); // Répondre avec un JSON d'erreur plus explicite
	}
});

// app.post('/signin', acceptJsonOnly, async (req, res) => {
// 	try {
// 		const { username, password } = req.body;

// 		if (!username || !password) {
// 			throw new Error('Tous les champs sont obligatoires.');
// 		}

// 		const sql = 'SELECT username, password FROM user WHERE username = ?;';
// 		const values = [username];

// 		connection.query(sql, values, (err, results) => {
// 			if (err) {
// 				console.error('Erreur lors de la récupération des informations d\'utilisateur :', err);
// 				return;
// 			}

// 			if (results.length === 0) {
// 				// Aucun utilisateur avec ce nom d'utilisateur n'a été trouvé dans la base de données.
// 				// Vous pouvez renvoyer un message d'erreur ou gérer l'authentification en conséquence.
// 				console.log('Utilisateur non trouvé');
// 			} else {
// 				const user = results[0];
// 				const storedUsername = user.username;
// 				const storedPassword = user.password;
// 				try {
// 					const isMatch = await argon2.verify(storedPassword, password);
// 					// Ici, vous pouvez comparer le mot de passe haché stocké dans la base de données (storedPassword)
// 					// avec le mot de passe fourni par l'utilisateur lors de la tentative de connexion pour valider l'authentification.
// 					console.log('Nom d\'utilisateur trouvé :', storedUsername);
// 					console.log('Mot de passe haché :', storedPassword);
// 				} catch (error) {
// 					console.error('Erreur lors de la vérification du mot de passe :', error);
// 					throw error; // Propager l'erreur pour qu'elle soit gérée par le bloc catch externe
// 				}
// 			}
// 		});
// 	} catch (error) {
// 		// console.error('Erreur lors de l\'ajout de l\'utilisateur :', error.message);
// 		res.status(400).json({ error: error.message }); // Répondre avec un JSON d'erreur plus explicite
// 	}
// });

app.post('/signin', acceptJsonOnly, async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			throw new Error('Tous les champs sont obligatoires.');
		}

		const sql = 'SELECT username, password FROM user WHERE username = ?;';
		const values = [username];

		// Convertir la fonction de rappel en une promesse
		const queryAsync = () => {
			return new Promise((resolve, reject) => {
				connection.query(sql, values, (err, results) => {
					if (err) {
						reject(err);
					} else {
						resolve(results);
					}
				});
			});
		};

		// Appeler la nouvelle fonction asynchrone pour obtenir les résultats de la requête
		const results = await queryAsync();

		if (results.length === 0) {
			console.log('Utilisateur non trouvé');
			res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
		} else {
			const user = results[0];
			const storedUsername = user.username;
			const storedPassword = user.password;
				const isMatch = await argon2.verify(storedPassword, password);
				if (isMatch) {
					console.log('Authentification réussie pour l\'utilisateur :', storedUsername);
					res.json({ success: true });
				} else {
					console.log('Mot de passe incorrect pour l\'utilisateur :', storedUsername);
					res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
				}
		}
	} catch (error) {
		console.error('Erreur lors de la récupération des informations d\'utilisateur :', error);
		res.status(400).json({ error: error.message });
	}
});



const port = 3000;
app.listen(port, () => {
	console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});

// CREATE TABLE user (
// 	id INT AUTO_INCREMENT PRIMARY KEY,
// 	email VARCHAR(50) NOT NULL,
// 	username VARCHAR(50) NOT NULL,
// 	firstName VARCHAR(50) NOT NULL,
// 	lastName VARCHAR(50) NOT NULL,
// 	password VARCHAR(200) NOT NULL
// );


	// {
	// 	"email": "test@jb.com",
	// 	"username": "jdubilla",
	// 	"firstName": "jb",
	// 	"lastName": "Dubi",
	// 	"password": "Jbdpass"
	// }