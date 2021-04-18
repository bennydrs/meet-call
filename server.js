const express = require('express')
const app = express()
const server = require('http').createServer(app)
const shortId = require('shortid')
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const bodyParser = require('body-parser')
const peerServer = ExpressPeerServer(server, {
  debug: true
})
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')

// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/create-room', (req, res) => {
  const { name } = req.body
  const randomId = shortId.generate()
  const uid = shortId.generate()
  res.redirect(`/${randomId}?uid=${uid}&name=${name}`)
})

app.post('/join-room', (req, res) => {
  const { name, roomId } = req.body
  const uid = shortId.generate()
  res.redirect(`/${roomId}?uid=${uid}&name=${name}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, query: req.query })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    // message
    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message)
    })
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })

})

server.listen(port, () => {
  console.log(`running at port ${port}`)
})
