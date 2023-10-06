const express = require("express");
const mysql = require("mysql");
const session = require('express-session');
const bcrypt = require('bcrypt');


const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "consolify"
});

const app = express();
app.use(express.static("public"));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
    cookie: {
        maxAge: 3600000 // expire après 1 heure (en millisecondes)
      }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//extraire les données du formulaire


connect.connect(function(err) {
    if (err) throw err;
    console.log("Connexion à la base de données établie.");
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
});



app.use((request, response, next) => {
    response.locals.pseudo = request.session.pseudo;
    response.locals.isAdmin = request.session.isAdmin
    next();
});

app.get('/', (request, response) => {
    const pseudo = request.session.pseudo;
    response.render('home', {pseudo}); 
});

app.get('/theme-quiz-front', (request, response) => {
    response.render('theme-quiz-front');
});
// Middleware pour vérifier si l'utilisateur est connecté
const checkAuthentication = (req, res, next) => {

    const pseudo = req.session.pseudo; 
  
    if (!pseudo) {
        res.redirect('/login'); 
      
    } else {
        next(); // L'utilisateur est connecté, passez à la prochaine étape de traitement.
    }
  };

app.get("/theme-quiz-back", (request, response) => {
    response.render("theme-quiz-back", { pseudo: request.session.pseudo });
});

app.get("/quiz-description/:id", (request, response) => {
    const id = parseInt(request.params.id);
    const isAdmin = request.session.isAdmin
    connect.query(`SELECT * FROM quizzes WHERE id=${id}`, (err, quizResult) => {
        if (err) throw err;
        
        // Requête pour récupérer tous les noms de quizzes
        connect.query(`SELECT * FROM quizzes`, (err, allQuizzesResult) => {
            if (err) throw err;
            response.render("quiz-description", { quiz: quizResult[0], allQuizzes: allQuizzesResult });
        });
    });
});

app.get("/admin-home", (request, response) => {
    response.render("admin-home");
});

app.get("/admin-reponses", (request, response) => {
    connect.query(`SELECT reponses.*, questions.question AS question_texte, questions.id_quizzes AS question_id_quizzes, quizzes.nom AS nom_quiz
                    FROM reponses
                    INNER JOIN questions ON reponses.id_questions = questions.id
                    INNER JOIN quizzes ON questions.id_quizzes = quizzes.id`, (err, result) => {
        if (err) throw err;
        //console.log(result);
        // RowDataPacket {
        //     id: 44,
        //     id_quizzes: 2,
        //     id_questions: 11,
        //     texte_reponse: 'let ma_variable;',
        //     est_correcte: 0,
        //     question_texte: 'Comment déclare-t-on une variable en PHP ?',
        //     question_id_quizzes: 2,
        //     nom_quiz: 'PHP'
        //   },
        response.render("admin-reponses", { reponses: result });
    })
});

app.get("/admin-quizz", (request, response) => {
    connect.query(`SELECT * FROM quizzes`, (err, result) => {
        if (err) throw err;
        response.render("admin-quizz", { quizzes: result });
    })
});


app.get("/quiz/:id", checkAuthentication, (request, response) => {
    const id = parseInt(request.params.id);

    // Récupérez l'ID de l'utilisateur à partir du pseudo en session
    const pseudo = request.session.pseudo;
    const sqlFindUser = 'SELECT id FROM utilisateurs WHERE pseudo = ?';
    connect.query(sqlFindUser, [pseudo], (err, userResult) => {
        if (err) {
            console.error("Une erreur s'est produite :", err);
            throw err;
        }
        
        if (userResult.length > 0) {
            const userId = userResult[0].id;

            // Utilisation d'une seule requête SQL avec une jointure pour récupérer toutes les données
            connect.query(`
                SELECT questions.*, 
                    reponses.texte_reponse, 
                    reponses.est_correcte, 
                    quizzes.nom AS nomQuiz
                FROM questions
                INNER JOIN reponses ON questions.id = reponses.id_questions
                INNER JOIN quizzes ON questions.id_quizzes = quizzes.id
                WHERE questions.id_quizzes = ${id}
            `, (err, result) => {
                if (err) {
                    console.error("Une erreur s'est produite :", err);
                    throw err;
                }

                //console.log(result)
                // [
                //     RowDataPacket {
                //       id: 11,
                //       id_quizzes: 2,
                //       question: 'test q1',
                //       texte_reponse: 'teeeeeeeest',
                //       est_correcte: 0,
                //       nomQuiz: 'PHP'
                //     }, ...
                //   ]

                // Créez un objet pour organiser les données par question
                const questionsData = {};
                // const idQuestions = []; 

                result.forEach((row) => {
                    const questionId = row.id;
                    const quizId = row.id_quizzes;

                    if (!questionsData[questionId]) {
                        questionsData[questionId] = {
                            question: row.question,
                            reponses: [],
                            idQuestions : questionId
                        };
                    }

                    questionsData[questionId].reponses.push({
                        texte_reponse: row.texte_reponse,
                        est_correcte: row.est_correcte,
                    });

                    // Questions.push(questionId);
                });

                // Organisez les données pour afficher dans le modèle EJS
                const quizData = {
                    nomQuiz: result[0].nomQuiz, // Le nom du quiz est le même pour toutes les questions
                    idQuiz: result[0].id_quizzes,
                    questions: Object.values(questionsData), // Convertissez l'objet en tableau d'objets pour l'affichage.
                    // idQuestions: idQuestions,
                };

                response.render("quiz", {
                    pseudo: request.session.pseudo,
                    userId: userId, // Ajoutez l'ID de l'utilisateur ici
                    quizData,
                    currentQuestionIndex: 0,
                });
            });
        } else {
            console.error('Utilisateur introuvable dans la base de données');
            // Gérer l'erreur si l'utilisateur n'est pas trouvé
        }
    });
});


app.post('/form-quiz', async (req, res) => {
    const quizData = req.body; // Les données du formulaire
    const pseudo = req.session.pseudo;
    const id = parseInt(req.params.id);
  
    // Calcul du score final
    let scoreFinal = 0;

    const promises = [];

    for (const key in quizData) {
        if (key.startsWith('reponse')) {
            const reponseUtilisateur = quizData[key];
            const questionIdKey = key.replace('reponse', 'questionId'); // Trouver la clé de la question correspondante
            const questionId = quizData[questionIdKey];

            const sql = 'SELECT est_correcte FROM reponses WHERE id_questions = ? AND texte_reponse = ?';
            
            // Créer une promesse pour chaque requête SQL
            const promise = new Promise((resolve, reject) => {
                connect.query(sql, [questionId, reponseUtilisateur], (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    if (result.length > 0 && result[0].est_correcte == 1) {
                        scoreFinal++;
                        console.log(scoreFinal)
                    }
                    resolve();
                });
            });

            promises.push(promise);
        }
    }

    // Attendre que toutes les promesses se terminent
    await Promise.all(promises);

    // Recherche de l'ID de l'utilisateur en utilisant le pseudo
    const sqlFindUser = 'SELECT id FROM utilisateurs WHERE pseudo = ?';
    connect.query(sqlFindUser, [pseudo], (err, userResult) => {
        if (err) {
            throw err;
        }
        
        if (userResult.length > 0) {
            const userId = userResult[0].id;

            // Insérer les données dans la table resultats_utilisateurs
            const date = new Date();
            const dataInsert = {
                id_quizzes: quizData.id_quizzes,
                id_utilisateur: userId,
                date: date,
                score: scoreFinal
            };

            const sqlInsert = 'INSERT INTO resultats_utilisateurs SET ?';
            connect.query(sqlInsert, dataInsert, (err, result) => {
                if (err) {
                    throw err;
                }
                console.log('Score inséré avec succès dans la base de données');
                res.redirect(`/quiz/${quizData.id_quizzes}/result-user`);
            });
        } else {
            console.error('Utilisateur introuvable dans la base de données');
        }
    });
  
  
});


app.get("/quiz/:id/result-user", (request, response) => {
    const quizId = parseInt(request.params.id);
    const pseudo = request.session.pseudo;

    // Obtenir l'ID de l'utilisateur à partir de son pseudo
    const sqlFindUser = 'SELECT id FROM utilisateurs WHERE pseudo = ?';
    connect.query(sqlFindUser, [pseudo], (err, userResult) => {
        if (err) {
            throw err;
        }

        if (userResult.length > 0) {
            const userId = userResult[0].id;

            // Maintenant, vous pouvez exécuter une requête SQL pour récupérer des informations depuis la table "quizzes"
            const sqlGetQuizInfo = "SELECT * FROM quizzes WHERE id = ?";
            connect.query(sqlGetQuizInfo, [quizId], (err, quizResult) => {
                if (err) {
                    throw err;
                }

                if (quizResult.length > 0) {
                    // quizResult contient les informations sur le quiz avec l'ID spécifié
                    const quizInfo = quizResult[0];

                    const sqlDisplayScore = "SELECT * FROM resultats_utilisateurs WHERE id_quizzes = ? AND id_utilisateur = ? ORDER BY date DESC LIMIT 1";
                    connect.query(sqlDisplayScore, [quizId, userId], (err, result) => {
                        if (err) {
                            throw err;
                        }

                        // Passer les résultats de la requête à la vue EJS
                        response.render("result-user", { scores: result, pseudo, quizInfo });
                    });
                } else {
                    console.error('Quiz introuvable dans la base de données');
                    response.status(404).send('Quiz introuvable');
                }
            });
        } else {
            console.error('Utilisateur introuvable dans la base de données');
            response.status(404).send('Utilisateur introuvable');
        }
    });
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.get("/test", (request, response) => {
    response.render("test");
});


app.post('/auth', function(request, response) {
    let pseudo = request.body.pseudo;
    let password = request.body.password;

    if (pseudo && password) {
        connect.query('SELECT * FROM utilisateurs WHERE pseudo = ?', [pseudo], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                const hashedPassword = results[0].password;
                const isAdmin = results[0].admin === 'oui';
                bcrypt.compare(password, hashedPassword, function(err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        request.session.loggedin = true;
                        request.session.pseudo = pseudo;
                        request.session.isAdmin = isAdmin;
                        response.redirect('/');
                    } else {
                        response.redirect('/login?error=4');
                    }
                });
            } else {
                response.redirect('/login?error=4');
            }
        });
    } else {
        response.redirect('/login?error=2');
    }
});



app.get("/register", (request, response) => {
    response.render("register");
});

app.post('/register', function(request, response) {
    let pseudo = request.body.pseudo;
    let password = request.body.password;
    let confirmPassword = request.body.confirmPassword;

    if (pseudo && password && confirmPassword) {
        if (password !== confirmPassword) {
            response.redirect('/register?error=1');
        } else {
            // Vérifier si le pseudo existe déjà
            connect.query('SELECT * FROM utilisateurs WHERE pseudo = ?', [pseudo], (error, results, fields) => {
                if (error) throw error;

                if (results.length > 0) {
                    response.redirect('/register?error=3');
                } else {
                    // Hasher le mot de passe
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) throw err;
                        const adminDefaultValue = 'non';
                        connect.query('INSERT INTO utilisateurs (pseudo, password, admin) VALUES (?, ?, ?)', [pseudo, hashedPassword, adminDefaultValue], (error, results, fields) => {
                            if (error) throw error;
                            response.redirect('/login');
                        });
                    });
                }
            });
        }
    } else {
        response.redirect('/register?error=2');
    }
});



app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion :', err);
      } else {
        res.redirect('/');
      }
    });
  });



app.use((req, res) => {
    res.status(404).render("404");
});
