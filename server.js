var express = require("express")
var Sequelize = require("sequelize")
var nodeadmin = require("nodeadmin")


//connect to mysql database
var sequelize = new Sequelize('calatorie', 'root', '', {
    dialect:'mysql',
    host:'localhost'
})

sequelize.authenticate().then(function(){
    console.log('Success')
})

//define a new Model
var Tourists = sequelize.define('tourists', {
    name: Sequelize.STRING,
    description: Sequelize.STRING
})

var Locations = sequelize.define('locations', {
    name: Sequelize.STRING,
    tourist_id: Sequelize.INTEGER,
    description: Sequelize.STRING,
    temperature: Sequelize.INTEGER,
    image: Sequelize.STRING
})

Locations.belongsTo(Tourists, {foreignKey: 'tourist_id', targetKey: 'id'})
//Tourists.hasMany(Locations)

var app = express()

app.use('/nodeamin', nodeadmin(app))

//access static files
app.use(express.static('public'))
app.use('/admin', express.static('admin'))

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// get a list of tourists
app.get('/tourists', function(request, response) {
    Tourists.findAll().then(function(tourists){
        response.status(200).send(tourists)
    })
        
})

// get one tourist by id
app.get('/tourists/:id', function(request, response) {
    Tourists.findOne({where: {id:request.params.id}}).then(function(tourist) {
        if(tourist) {
            response.status(200).send(tourist)
        } else {
            response.status(404).send()
        }
    })
})

//create a new tourists
app.post('/tourists', function(request, response) {
    Tourists.create(request.body).then(function(tourist) {
        response.status(201).send(tourist)
    })
})

app.put('/tourists/:id', function(request, response) {
    Tourists.findById(request.params.id).then(function(tourist) {
        if(tourist) {
            tourist.update(request.body).then(function(tourist){
                response.status(201).send(tourist)
            }).catch(function(error) {
                response.status(200).send(error)
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.delete('/tourists/:id', function(request, response) {
    Tourists.findById(request.params.id).then(function(tourist) {
        if(tourist) {
            tourist.destroy().then(function(){
                response.status(204).send()
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.get('/locations', function(request, response) {
    Locations.findAll(
        {
            include: [{
                model: Tourists,
                where: { id: Sequelize.col('locations.tourist_id') }
            }]
        }
        
        ).then(
            function(locations) {
                response.status(200).send(locations)
            }
        )
})

app.get('/locations/:id', function(request, response) {
    Locations.findById(request.params.id).then(
            function(location) {
                response.status(200).send(location)
            }
        )
})

app.post('/locations', function(request, response) {
    Locations.create(request.body).then(function(location) {
        response.status(201).send(location)
    })
})

app.put('/locations/:id', function(request, response) {
    Locations.findById(request.params.id).then(function(location) {
        if(location) {
            location.update(request.body).then(function(location){
                response.status(201).send(location)
            }).catch(function(error) {
                response.status(200).send(error)
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.delete('/locations/:id', function(request, response) {
    Locations.findById(request.params.id).then(function(location) {
        if(location) {
            location.destroy().then(function(){
                response.status(204).send()
            })
        } else {
            response.status(404).send('Not found')
        }
    })
})

app.get('/tourists/:id/locations', function(request, response) {
    Locations.findAll({where:{tourist_id: request.params.id}}).then(
            function(locations) {
                response.status(200).send(locations)
            }
        )
})

app.listen(8080)