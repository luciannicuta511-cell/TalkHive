const authScreen = document.getElementById('authScreen');
const appView = document.getElementById('appView');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmailInput = document.getElementById('loginEmailInput');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const registerNameInput = document.getElementById('registerNameInput');
const registerEmailInput = document.getElementById('registerEmailInput');
const registerPasswordInput = document.getElementById('registerPasswordInput');
const registerStatusSelect = document.getElementById('registerStatusSelect');
const registerRoleSelect = document.getElementById('registerRoleSelect');
const registerOwnerPassword = document.getElementById('registerOwnerPassword');
const googleAuthBtn = document.getElementById('googleAuthBtn');
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
const logoutBtn = document.getElementById('logoutBtn');
const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const joinBtn = document.getElementById('joinBtn');
const roomListEl = document.getElementById('roomList');
const roomHeading = document.getElementById('roomHeading');
const roomSubheading = document.getElementById('roomSubheading');
const activeRoomName = document.getElementById('activeRoomName');
const profileTitle = document.getElementById('profileTitle');
const profileStatus = document.getElementById('profileStatus');
const profileName = document.getElementById('profileName');
const profileSubtitle = document.getElementById('profileSubtitle');
const avatarCircle = document.getElementById('avatarCircle');
const userBadge = document.getElementById('userBadge');
const toastContainer = document.getElementById('toastContainer');
const ownerPanel = document.getElementById('ownerPanel');
const muteTargetInput = document.getElementById('muteTargetInput');
const muteDurationSelect = document.getElementById('muteDurationSelect');
const muteBtn = document.getElementById('muteBtn');
const unmuteBtn = document.getElementById('unmuteBtn');
const mutedList = document.getElementById('mutedList');
const announcementInput = document.getElementById('announcementInput');
const announceBtn = document.getElementById('announceBtn');
const roleTargetInput = document.getElementById('roleTargetInput');
const roleAssignSelect = document.getElementById('roleAssignSelect');
const assignRoleBtn = document.getElementById('assignRoleBtn');
const moderationUserList = document.getElementById('moderationUserList');
const blockInput = document.getElementById('blockInput');
const blockBtn = document.getElementById('blockBtn');
const unblockBtn = document.getElementById('unblockBtn');
const blockedList = document.getElementById('blockedList');
const imageInput = document.getElementById('imageInput');
const imageBtn = document.getElementById('imageBtn');

const ownerPasswordValue = 'lucii12331233*';

const roomConfig = [
  { id: 'general', label: 'General', accent: '#7c5cff' },
  { id: 'study', label: 'Study', accent: '#31d3c1' },
  { id: 'gaming', label: 'Gaming', accent: '#ff7f50' }
];

const initialRooms = {
  general: [
    { author: 'Mia', text: 'Salut! Ai intrat în camera General.', me: false },
    { author: 'Andrei', text: 'Să facem conversația mai interactivă.', me: false }
  ],
  study: [
    { author: 'Elena', text: 'Am nevoie de idei pentru proiectul meu.', me: false }
  ],
  gaming: [
    { author: 'Darius', text: 'Cine vrea să joace într-o rundă rapidă?', me: false }
  ]
};

const storageKeys = {
  user: 'talkhive-user',
  users: 'talkhive-users',
  rooms: 'talkhive-rooms',
  blocked: 'talkhive-blocked',
  muted: 'talkhive-muted',
  announcements: 'talkhive-announcements',
  appState: 'talkhive-app-state'
};

let pendingImage = null;
let dbPromise = null;

let state = {
  user: null,
  activeRoom: 'general',
  rooms: loadRooms(),
  blockedUsers: loadBlockedUsers(),
  mutedUsers: loadMutedUsers(),
  announcements: loadAnnouncements(),
  users: loadUsers()
};

function loadRooms() {
  const saved = localStorage.getItem(storageKeys.rooms);
  if (!saved) {
    localStorage.setItem(storageKeys.rooms, JSON.stringify(initialRooms));
    return initialRooms;
  }
  return JSON.parse(saved);
}

function saveRooms() {
  localStorage.setItem(storageKeys.rooms, JSON.stringify(state.rooms));
  persistAppState();
}

function loadBlockedUsers() {
  const saved = localStorage.getItem(storageKeys.blocked);
  return saved ? JSON.parse(saved) : [];
}

function saveBlockedUsers() {
  localStorage.setItem(storageKeys.blocked, JSON.stringify(state.blockedUsers));
  persistAppState();
}

function loadMutedUsers() {
  const saved = localStorage.getItem(storageKeys.muted);
  return saved ? JSON.parse(saved) : [];
}

function saveMutedUsers() {
  localStorage.setItem(storageKeys.muted, JSON.stringify(state.mutedUsers));
  persistAppState();
}

function loadAnnouncements() {
  const saved = localStorage.getItem(storageKeys.announcements);
  return saved ? JSON.parse(saved) : [];
}

function saveAnnouncements() {
  localStorage.setItem(storageKeys.announcements, JSON.stringify(state.announcements));
  persistAppState();
}

function loadUser() {
  const saved = localStorage.getItem(storageKeys.user);
  return saved ? JSON.parse(saved) : null;
}

function saveUser(user) {
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
  persistAppState();
}

function clearUser() {
  localStorage.removeItem(storageKeys.user);
  persistAppState();
}

function loadUsers() {
  const saved = localStorage.getItem(storageKeys.users);
  return saved ? JSON.parse(saved) : [];
}

function saveUsers(users) {
  state.users = users;
  localStorage.setItem(storageKeys.users, JSON.stringify(users));
  persistAppState();
}

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('talkhive-db', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function persistAppState() {
  const payload = {
    id: 'app',
    user: state.user,
    activeRoom: state.activeRoom,
    rooms: state.rooms,
    blockedUsers: state.blockedUsers,
    mutedUsers: state.mutedUsers,
    announcements: state.announcements,
    users: state.users || []
  };

  localStorage.setItem(storageKeys.appState, JSON.stringify(payload));
  openDatabase()
    .then((db) => {
      const tx = db.transaction('state', 'readwrite');
      tx.objectStore('state').put(payload);
    })
    .catch(() => {});
}

async function hydrateAppState() {
  const localState = localStorage.getItem(storageKeys.appState);
  if (localState) {
    const parsed = JSON.parse(localState);
    state.user = parsed.user || null;
    state.activeRoom = parsed.activeRoom || 'general';
    state.rooms = parsed.rooms || loadRooms();
    state.blockedUsers = parsed.blockedUsers || loadBlockedUsers();
    state.mutedUsers = parsed.mutedUsers || loadMutedUsers();
    state.announcements = parsed.announcements || loadAnnouncements();
    state.users = parsed.users || loadUsers();
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction('state', 'readonly');
    const request = tx.objectStore('state').get('app');
    request.onsuccess = () => {
      const dbState = request.result;
      if (dbState) {
        state.user = dbState.user || null;
        state.activeRoom = dbState.activeRoom || 'general';
        state.rooms = dbState.rooms || loadRooms();
        state.blockedUsers = dbState.blockedUsers || loadBlockedUsers();
        state.mutedUsers = dbState.mutedUsers || loadMutedUsers();
        state.announcements = dbState.announcements || loadAnnouncements();
        state.users = dbState.users || loadUsers();
        render();
      }
    };
  } catch (error) {
    console.warn('IndexedDB unavailable, using localStorage fallback.', error);
  }
}

function findUserByEmail(email) {
  return (state.users || []).find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function showToast(text) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = text;
  toastContainer.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}

function buildUser(name, role = 'user', status = 'online') {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  return {
    name: cleanName,
    status,
    role: role === 'owner' ? 'owner' : 'user'
  };
}

function containsRudeWords(text) {
  return /\b(urat|urat|idiot|prost|tampit|stupid|fuck|bitch)\b/i.test(text);
}

function playSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

function renderRooms() {
  roomListEl.innerHTML = '';
  roomConfig.forEach((room) => {
    const button = document.createElement('button');
    button.className = `room-btn${state.activeRoom === room.id ? ' active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<strong>${room.label}</strong><div>${(state.rooms[room.id] || []).length} mesaje</div>`;
    button.addEventListener('click', () => {
      state.activeRoom = room.id;
      render();
      showToast(`Ai trecut în ${room.label}`);
    });
    roomListEl.appendChild(button);
  });
}

function renderProfile() {
  if (!state.user) return;

  const room = roomConfig.find((item) => item.id === state.activeRoom);
  const initials = getInitials(state.user.name);

  profileTitle.textContent = state.user.name;
  profileStatus.textContent = state.user.status;
  profileName.textContent = state.user.name;
  profileSubtitle.textContent = state.user.status;
  userBadge.textContent = `${state.user.name} • ${state.user.status}`;
  avatarCircle.textContent = initials;
  roomHeading.textContent = room ? room.label : 'General';
  activeRoomName.textContent = room ? room.label : 'General';
  roomSubheading.textContent = `Conversație activă • ${roomConfig.length} camere disponibile`;
}

function renderModeration() {
  const canModerate = state.user && (state.user.role === 'owner' || state.user.role === 'admin' || state.user.role === 'helper');
  if (!canModerate) {
    ownerPanel.classList.add('hidden');
    return;
  }

  ownerPanel.classList.remove('hidden');

  const isOwner = state.user?.role === 'owner';
  if (!isOwner) {
    ownerPanel.querySelectorAll('.moderation-section').forEach((section, index) => {
      if (index === 0 || index === 1 || index === 2) {
        section.classList.add('hidden');
      }
    });
  } else {
    ownerPanel.querySelectorAll('.moderation-section').forEach((section) => section.classList.remove('hidden'));
  }

  blockedList.innerHTML = '';
  if (state.blockedUsers.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Niciun utilizator blocat încă.';
    blockedList.appendChild(emptyItem);
  } else {
    state.blockedUsers.forEach((name) => {
      const item = document.createElement('li');
      item.textContent = `• ${name}`;
      blockedList.appendChild(item);
    });
  }

  mutedList.innerHTML = '';
  if (state.mutedUsers.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Niciun utilizator mutat.';
    mutedList.appendChild(emptyItem);
  } else {
    state.mutedUsers.forEach((entry) => {
      const item = document.createElement('li');
      const expiresAt = entry.expiresAt ? new Date(entry.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'până la eliminare';
      item.textContent = `• ${entry.name} • până la ${expiresAt}`;
      mutedList.appendChild(item);
    });
  }

  moderationUserList.innerHTML = '';
  const users = state.users || [];
  if (users.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Nu există utilizatori încă.';
    moderationUserList.appendChild(emptyItem);
  } else {
    users.forEach((user) => {
      const item = document.createElement('li');
      item.textContent = `• ${user.name} (${user.role || 'user'})`;
      moderationUserList.appendChild(item);
    });
  }
}

function renderMessages() {
  messagesEl.innerHTML = '';
  const roomMessages = state.rooms[state.activeRoom] || [];
  const isMuted = state.user && state.mutedUsers.some((entry) => entry.name === state.user.name && Date.now() < entry.expiresAt);

  if (state.announcements?.length) {
    const latestAnnouncement = state.announcements[0];
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `
      <div class="meta">Anunț • ${new Date(latestAnnouncement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div>${latestAnnouncement.text}</div>
    `;
    messagesEl.appendChild(bubble);
  }

  roomMessages.forEach((message) => {
    if (state.blockedUsers.includes(message.author) && message.author !== state.user?.name) {
      return;
    }

    const bubble = document.createElement('div');
    bubble.className = `bubble${message.me ? ' me' : ''}`;
    bubble.innerHTML = `
      <div class="meta">${message.author} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div>${message.text || ''}</div>
      ${message.image ? `<img class="message-image" src="${message.image}" alt="Imagine trimisă" />` : ''}
    `;
    messagesEl.appendChild(bubble);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function render() {
  renderRooms();
  renderProfile();
  renderModeration();
  renderMessages();
}

function enterApp(user) {
  state.user = user;
  saveUser(user);
  authScreen.classList.add('hidden');
  appView.classList.remove('hidden');
  render();
  showToast(`Bun venit, ${user.name}!`);
  playSound();
}

function logout() {
  clearUser();
  state.user = null;
  pendingImage = null;
  imageInput.value = '';
  authScreen.classList.remove('hidden');
  appView.classList.add('hidden');
  loginEmailInput.value = '';
  loginPasswordInput.value = '';
  registerNameInput.value = '';
  registerEmailInput.value = '';
  registerPasswordInput.value = '';
  registerStatusSelect.value = 'online';
  registerRoleSelect.value = 'user';
  registerOwnerPassword.classList.add('hidden');
  registerOwnerPassword.value = '';
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;
  const foundUser = findUserByEmail(email);

  if (!foundUser || foundUser.password !== password) {
    showToast('Email sau parolă incorecte.');
    return;
  }

  const user = {
    name: foundUser.name,
    email: foundUser.email,
    status: foundUser.status,
    role: foundUser.role
  };

  enterApp(user);
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();
  const password = registerPasswordInput.value;
  const role = registerRoleSelect.value;

  if (!name || !email || !password) return;

  if (findUserByEmail(email)) {
    showToast('Există deja un cont cu acest email.');
    return;
  }

  if (role === 'owner' && registerOwnerPassword.value !== ownerPasswordValue) {
    showToast('Parola owner este incorectă.');
    return;
  }

  const users = state.users || [];
  users.push({
    name,
    email,
    password,
    status: registerStatusSelect.value,
    role
  });
  saveUsers(users);

  const user = {
    name,
    email,
    status: registerStatusSelect.value,
    role
  };

  enterApp(user);
});

registerRoleSelect.addEventListener('change', () => {
  registerOwnerPassword.classList.toggle('hidden', registerRoleSelect.value !== 'owner');
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    modeButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    loginForm.classList.toggle('hidden', mode !== 'login');
    registerForm.classList.toggle('hidden', mode !== 'register');
    loginForm.classList.toggle('active-form', mode === 'login');
    registerForm.classList.toggle('active-form', mode === 'register');
  });
});

logoutBtn.addEventListener('click', logout);

googleAuthBtn.addEventListener('click', () => {
  const email = window.prompt('Introdu adresa Google (demo):', 'utilizator@gmail.com');
  if (!email) return;

  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const user = buildUser(name, 'user', 'online');
  if (!user) return;

  const users = loadUsers();
  if (!users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
    users.push({ name, email, password: 'google-demo', status: 'online', role: 'user' });
    saveUsers(users);
  }

  enterApp({ ...user, email });
  showToast(`Te-ai conectat cu Google ca ${name}`);
});

imageBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
    showToast('Imagine pregătită pentru trimitere');
  };
  reader.readAsDataURL(file);
});

muteBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;
  const name = muteTargetInput.value.trim();
  const duration = Number(muteDurationSelect.value);
  if (!name || !duration) return;

  const existing = state.mutedUsers.find((entry) => entry.name === name);
  const expiresAt = Date.now() + duration;
  if (existing) {
    existing.expiresAt = expiresAt;
  } else {
    state.mutedUsers.push({ name, expiresAt });
  }
  saveMutedUsers();
  render();
  showToast(`${name} a fost mutat pentru ${muteDurationSelect.options[muteDurationSelect.selectedIndex].text}`);
  muteTargetInput.value = '';
});

unmuteBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;
  const name = muteTargetInput.value.trim();
  if (!name) return;
  state.mutedUsers = state.mutedUsers.filter((entry) => entry.name !== name);
  saveMutedUsers();
  render();
  showToast(`${name} a fost demutat.`);
  muteTargetInput.value = '';
});

announceBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;
  const text = announcementInput.value.trim();
  if (!text) return;
  state.announcements.unshift({ text, author: state.user.name, createdAt: new Date().toISOString() });
  saveAnnouncements();
  announcementInput.value = '';
  render();
  showToast('Anunțul a fost postat.');
});

assignRoleBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;
  const name = roleTargetInput.value.trim();
  const role = roleAssignSelect.value;
  if (!name) return;

  const users = state.users || [];
  const target = users.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (!target) {
    showToast('Utilizatorul nu a fost găsit.');
    return;
  }

  target.role = role;
  saveUsers(users);
  roleTargetInput.value = '';
  render();
  showToast(`${name} are acum rolul ${role}.`);
});

blockBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;

  const name = blockInput.value.trim();
  if (!name) return;

  if (!state.blockedUsers.includes(name)) {
    state.blockedUsers.push(name);
    saveBlockedUsers();
    Object.keys(state.rooms).forEach((roomId) => {
      state.rooms[roomId] = (state.rooms[roomId] || []).filter((message) => message.author !== name);
    });
    saveRooms();
    render();
    showToast(`Utilizatorul ${name} a fost blocat.`);
  } else {
    showToast(`${name} este deja blocat.`);
  }

  blockInput.value = '';
});

unblockBtn.addEventListener('click', () => {
  if (!state.user || state.user.role !== 'owner') return;

  const name = blockInput.value.trim();
  if (!name) return;

  state.blockedUsers = state.blockedUsers.filter((entry) => entry !== name);
  saveBlockedUsers();
  render();
  showToast(`${name} a fost deblocat.`);
  blockInput.value = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!state.user) return;

  const isMutedNow = state.mutedUsers.some((entry) => entry.name === state.user.name && Date.now() < entry.expiresAt);
  if (state.blockedUsers.includes(state.user.name)) {
    showToast('Contul tău este blocat.');
    return;
  }

  if (isMutedNow) {
    showToast('Ești mutat temporar și nu poți trimite mesaje.');
    return;
  }

  if (!text && !pendingImage) return;

  if (containsRudeWords(text)) {
    showToast('Mesajul conține limbaj neadecvat. Ownerul îl poate bloca.');
  }

  const message = {
    author: state.user.name,
    text,
    image: pendingImage || null,
    me: true
  };

  if (!state.rooms[state.activeRoom]) {
    state.rooms[state.activeRoom] = [];
  }

  state.rooms[state.activeRoom].push(message);
  saveRooms();
  input.value = '';
  pendingImage = null;
  imageInput.value = '';
  renderMessages();
  playSound();
  showToast(`Mesaj trimis în ${roomConfig.find((room) => room.id === state.activeRoom)?.label}`);

  window.setTimeout(() => {
    const roomName = roomConfig.find((room) => room.id === state.activeRoom)?.label || 'camera';
    state.rooms[state.activeRoom].push({
      author: 'Bot',
      text: `Altcineva a răspuns în ${roomName}.`,
      me: false
    });
    saveRooms();
    renderMessages();
    playSound();
  }, 900);
});

joinBtn.addEventListener('click', () => {
  if (!state.user) return;
  const roomName = roomConfig.find((room) => room.id === state.activeRoom)?.label || 'General';
  state.rooms[state.activeRoom].push({ author: 'System', text: `Te-ai alăturat camerei ${roomName}.`, me: false });
  saveRooms();
  renderMessages();
  showToast(`Ai intrat în ${roomName}`);
  playSound();
});

const savedUser = loadUser();
if (savedUser) {
  enterApp(savedUser);
} else {
  render();
}

hydrateAppState();
