const express    = require('express');
const exphbs     = require('express-handlebars');
const app        = express();
const path       = require('path');
const db         = require('./db/connection');
const bodyParser = require('body-parser');
const Job        = require('./models/Job');
const Sequelize  = require('sequelize');
const Op         = Sequelize.Op;

const PORT = 3000;

const routes = require('./routes/users');

app.listen(PORT, function(){
    console.log(`O express esta a funcionar na porta ${PORT}`);
});

//body parser
app.use(bodyParser.urlencoded({extended: false}));

//handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');


// static folder
app.use(express.static(path.join(__dirname, 'public')));

//db connection
db
    .authenticate()
    .then(()=>{
        console.log('Conectado com sucesso');
    })
    .catch(err =>{
        console.log('Ocorreu um erro ao connectar', err);
    });

//form rota de envio
app.use('/', routes);

//jobs routes
app.use('/jobs', require('./routes/jobs'));
app.use('/users', require('./routes/users'));