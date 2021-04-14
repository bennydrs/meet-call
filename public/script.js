const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

if (username === '' && uid === '') {
  window.location.replace('http://localhost:3000');
}

const peer = new Peer()

const peers = {}
let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream
  addVideoStream(myVideo, stream)
  // answer
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log(userVideoStream);
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream)
  })

  // input value for message
  let text = document.getElementById('chat_message')
  text.addEventListener('keydown', e => {
    let value = e.target.value
    if (e.key == "Enter" && value.length !== 0) {
      socket.emit('message', { value, username, uid })
      text.value = ''
    }
  })
  // show message to dom
  socket.on('createMessage', message => {
    let messages = document.querySelector('.messages')
    messages.innerHTML += `
      <div class="messageLine" style="justify-content: ${message.uid === uid ? 'flex-end' : 'flex-start'}">
      <div class="message ${message.uid === uid ? 'green' : ''}" style="${message.uid === uid ? 'border-radius: 10px 10px 0px 10px;' : 'border-radius: 10px 10px 10px 0px;'}">
        <b>${message.username}</b>
        <div class="messageText">${message.value}</div>
      </div>
    </div>
    `
    scrollToBottom()
  })
})

// disconect user
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  console.log(userId);
})

// peer join room
peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
  // call
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  // close
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

// add video to dom
const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

// auto scroll to bottom at chat window
const scrollToBottom = () => {
  let d = document.querySelector('.main__chat_window')
  d.scrollTop = d.scrollHeight;
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>`
  document.querySelector('.main__mute_button').innerHTML = html
}

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>`
  document.querySelector('.main__mute_button').innerHTML = html
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>`
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>`
  document.querySelector('.main__video_button').innerHTML = html;
}
