const create = document.querySelector('.form_create')
const join = document.querySelector('.form_join')

const createRoom = () => {
  join.style = "display: none"
  create.style = "display: block"
}
const joinRoom = () => {
  create.style = "display: none"
  join.style = "display: contents"
}
