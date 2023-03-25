const app = require('express')();
const http =  require('http').Server(app);
const path = require('path')
const fs = require('fs');
const morgan = require('morgan');


const io = require('socket.io')(http);
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

morgan.token('type', function(req, res){
    return req.headers['content-type']
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :date[web] :type', {stream: accessLogStream}));

app.get('/', function(req, res){
    const options = {
        root: path.join(__dirname)
    }
    const fileName = 'index.html';
    res.sendFile(fileName, options);
    // res.send("Home Page")
})

let users = 0;

app.get('/logs', function(req, res){
    const options = {
        root: path.join(__dirname)
    }
    const fileName = 'index.html';
    res.sendFile(fileName, options);
})

async function readlogFile(){
    return new Promise(function(resolve, reject){
        fs.readFile('./access.log', 'utf8', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }
            // console.log({data})
            resolve(data)
        })
    })
    
}

io.on('connection', async function(socket){
    console.log('A user connected')
    // users++;

    const logFileData = await readlogFile();
    // console.log({logFileData})
    io.sockets.emit('broadcast', {messsage: logFileData})

    socket.on('disconnect', function(){
        // users--;
        // io.sockets.emit('broadcast', {messsage: users + 'users connected!'})
        console.log('A user disconnected')
    })
})

http.listen(3000, function(){
    console.log("server listening on port 3000");
})
