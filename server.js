const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid')
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.listen(port, () => {
  console.log(`running at port ${port}`)
})
