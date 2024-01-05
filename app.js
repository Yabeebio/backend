var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
require('dotenv').config();

// var path = require('path');
//Connexion mongodb :
var mongoose = require('mongoose');
const url = process.env.DATABASE_URL;

mongoose.connect(url)
    .then(console.log("Mongodb connected"))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');

// Accès aux données du host:5000
const cors = require('cors');
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

//Method put et delete pour express
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//bcrypt : hashage de mot de passe
const bcrypt = require('bcrypt');

// Cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// import JWT
const { createTokens, validateToken } = require("./JWT");

// Multer
const multer = require('multer');
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // DESTINATION DES IMAGES
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // CHANGER LE NOM DES IMAGES
    }
});

const upload = multer({ storage })

//Models :
var Contact = require('./models/Contact');

app.post("/imageupload", upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json("No file uploaded");
    }
    else {
        res.json("File uploaded");
    }
})

app.post('/multipleuploads', upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).send("No files uploaded")
    }
    else {
        res.json("File Uploaded")
    }
});


//Contact
app.get('/', function (req, res) {
    // res.sendFile(path.resolve('index.html'));
    Contact.find()
        .then((data) => {
            console.log(data);
            // res.render('Home', {data: data});
            res.json(data);
        })
        .catch(err => console.log(err));
});

app.get('/newContact', function (req, res) {
    res.render('NewContact');
});

app.get('/contact/:id', function (req, res) {
    Contact.findOne({
        _id: req.params.id
    })
        .then((data) => {
            /* res.render('Edit', {data: data}); */
            res.json(data);
        })
        .catch(err => console.log(err));
});

app.post('/submit-data', function (req, res) {
    var name = req.body.firstname + ' ' + req.body.lastname;
    res.send(name + ' Submitted successfully');
})

app.post('/submit-contact', function (req, res) {
    const Data = new Contact({
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        message: req.body.message
    })

    Data.save()
        .then(() => {
            console.log("Data saved successfully");
            res.redirect(process.env.FRONTEND_URL);
        })
        .catch(err => {
            console.log(err);
        });
});

app.put('/edit/:id', function (req, res) {
    const Data = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        message: req.body.message
    }
    Contact.updateOne({ _id: req.params.id }, { $set: Data })
        .then(() => {
            console.log("Data updated successfully");
            res.redirect('/');
        })
        .catch(err => { console.log(err); });
})

app.delete('/delete/:id', function (req, res) {
    Contact.findOneAndDelete({
        _id: req.params.id
    })
        .then(() => {
            console.log("Data deleted successfully");
            res.redirect('/');
        })
        .catch(err => { console.log(err); });
})

//Blog
var Blog = require('./models/Blog');
//affichage formulaire nouveau blog
app.get('/newblog', function (req, res) {
    res.render('NewBlog')
});

//Ajout d'un blog
app.post('/addblog', upload.single('image'), function (req, res) {
    const Data = new Blog({
        titre: req.body.titre,
        sousTitre: req.body.sousTitre,
        auteur: req.body.auteur,
        description: req.body.description,
        /* imageName: req.body.imageName */
    })

    //Image obligatoire pour l'enregistrement d'un blog
    /* if (!req.file) {
        res.status(400).json("No file uploaded")
    }
    else { */
        Data.save()
            .then(() => {
                console.log("Blog saved");
                res.status(201).json({"result" : "Blog saved successfully"})
                // res.redirect('process.env.FRONTEND_URLallblogs')
            })
            .catch(err => console.error(err));
    /* } */
});

//recuperation de les blogs
app.get('/allblogs', function (req, res) {
    Blog.find()
        .then((data) => {
            res.json(data);
        })
});
//page qui affiche le formulaire d'edition
app.get('/blog/:id', function (req, res) {
    Blog.findOne({
        _id: req.params.id
    })
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.status(404).json({error:error});
        })
});

//Update
app.put('/editblog/:id', function (req, res) {
    const Data = {
        titre: req.body.titre,
        sousTitre: req.body.sousTitre,
        auteur: req.body.auteur,
        description: req.body.description
    }

    Blog.updateOne({
        _id: req.params.id
    }, { $set: Data })
        .then(() => {
            res.redirect(process.env.FRONTEND_URL + '/allblogs')
        })
        .catch((err) => {
            console.log(err);
        });
});

app.delete('/deleteblog/:id', function (req, res) {
    Blog.findOneAndDelete({ _id: req.params.id })
        .then(() => {
            console.log("Blog deleted");
            res.redirect(process.env.FRONTEND_URL + "/allblogs")
        })
        .catch((err) => { console.log(err); })
});

//User
const User = require('./models/User');
const { jwtDecode } = require('jwt-decode');

//Inscription 
app.post('/api/inscription', function (req, res) {
    const Data = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        admin: req.body.admin
    })

    Data.save()
        .then(() => {
            console.log("User saved !");
            res.redirect(process.env.FRONTEND_URL + '/connexion');
        })
        .catch(err => { console.log(err); });
})

app.get('/signup', function (req, res) {
    res.render('Inscription');
})
app.get('/signin', function (req, res) {
    res.render('Connexion');
})

app.post('/api/connexion', function (req, res) {
    User.findOne({
        username: req.body.username
    }).then(user => {
        if (!user) {
            return res.status(404).send("No user found");
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(404).send("Invalid password");
        }

        const accessToken = createTokens(user)
        res.cookie("access-token", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours en ms
            httpOnly: true
        });
        res.redirect(process.env.FRONTEND_URL)

        // res.json("LOGGED IN")
        // res.render('UserPage', {data : user})
    })
        .catch(err => { console.log(err); });

});

app.get("/logout", (req, res) => {
    res.clearCookie("access-token");
    res.redirect(process.env.FRONTEND_URL)
})

app.get('/getJwt', validateToken, (req, res) => {
    res.json(jwtDecode(req.cookies['access-token']));
})

var server = app.listen(5000, function () {
    console.log("Server listening on port 5000");
});

module.exports = app