const express = require('express')
const app = express()
const server = require('http').createServer(app)
const { v4: uuidv4 } = require('uuid')
const io = require('socket.io')(server)
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    socket.broadcast.emit('user-connected')
  })
})

server.listen(port, () => {
  console.log(`running at port ${port}`)
})
