const socket = io();
let username = '';
let userList = [];

//Pegando items do html
let loginPage = document.querySelector('#loginpage');
let chatPage = document.querySelector('#chatpage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

//Função para adiconar lista de usuário
function renderUserList () {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach( i => {
        ul.innerHTML += '<li>'+i+'</li>';
    });
}

//Função para adicionar menssagem
function addMessage (type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch(type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`;
            break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span> ${msg} </li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}</span> ${msg} </li>`;
            }
            break;
        
    }

    ul.scrollTop = ul.scrollHeight;
}

//Evento para o usuário entrar
loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name != '') {
            username = name;
            document.title = 'Chat ('+username+')';

            socket.emit('join-request', username);
        }
    }
});

//Evento para adicionar menssagem
textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if(txt != '') {
            socket.emit('send-msg', txt);
        }
    }
})

//Usuário conectado
socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = list;
    renderUserList();
});

//Menssagem para os outros usuários de entrada e saída de usuários
socket.on('list-update', (data => {
    if(data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat.')
    }

    if(data.left) {
        addMessage('status', null, data.left + ' saiu do chat.')
    }

    userList = data.list;
    renderUserList();
}));

//Adicionar menssagem
socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

//Ação de falha na conexão
socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!');
    userList = [];
    renderUserList();
});

//Ação para tentar conectar
socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar...');
});

//Ação de connect novamente
socket.on('connect', () => {

    if(username != ''){
        socket.emit('join-request', username);
    }
    
});