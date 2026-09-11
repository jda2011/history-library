// 초기 영상 및 퀴즈 데이터
const defaultVideos = [
  {
    id: 1,
    title: "삼국시대 - 고구려, 백제, 신라의 성립",
    category: "ancient",
    reqLevel: 1,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    desc: "삼국의 성립과 발전을 다룬 영상입니다.",
    quizzes: [
      { q: "1. 고구려를 건국한 인물은 누구일까요?", a: "주몽" },
      { q: "2. 신라의 청소년 수련 단체 명칭은?", a: "화랑도" },
      { q: "3. 백제의 수도가 아닌 곳은? (한성/웅진/사비/개경)", a: "개경" }
    ]
  },
  {
    id: 2,
    title: "고려의 외교술 - 서희의 강동 6주",
    category: "goryeo",
    reqLevel: 2,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    desc: "외교 담판으로 강동 6주를 획득한 서희의 이야기입니다.",
    quizzes: [
      { q: "1. 서희가 외교 담판을 벌인 침입 국가 이름은?", a: "거란" },
      { q: "2. 서희의 담판으로 확보한 지역 이름은?", a: "강동 6주" },
      { q: "3. 고려를 건국한 왕은 누구일까요?", a: "왕건" }
    ]
  }
];

// 초기 관리자 커스텀 뱃지 데이터
const defaultBadges = [
  { name: "역사 첫 걸음", icon: "🌱", points: 1, reqLevel: 1 },
  { name: "삼국 탐험가", icon: "⚔️", points: 2, reqLevel: 2 },
  { name: "고려 역사학자", icon: "📜", points: 3, reqLevel: 3 },
  { name: "조선 마스터", icon: "👑", points: 5, reqLevel: 4 }
];

let videoList = JSON.parse(localStorage.getItem('history_videos_v2')) || defaultVideos;
let badgeList = JSON.parse(localStorage.getItem('history_badges_v2')) || defaultBadges;
let currentUser = JSON.parse(localStorage.getItem('history_current_user')) || null;
let activeVideo = null;

function formatYoutubeEmbedUrl(url) {
  if (url.includes('embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
}

// 영상 카드 출력
function renderVideos(filter = 'all') {
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '';

  const filteredData = filter === 'all' 
    ? videoList 
    : videoList.filter(item => item.category === filter);

  const userLevel = currentUser ? currentUser.level : 1;

  filteredData.forEach(video => {
    const isWatched = currentUser && currentUser.watchedVideoIds.includes(video.id);
    const isLocked = userLevel < video.reqLevel;

    const card = document.createElement('div');
    card.className = `video-card ${isLocked ? 'locked' : ''}`;
    
    if (isLocked) {
      card.onclick = () => alert(`Lv.${video.reqLevel} 이상만 시청 가능합니다. 이전 영상 퀴즈를 풀어 레벨을 올리세요!`);
    } else {
      card.onclick = () => openVideoModal(video);
    }

    card.innerHTML = `
      <span class="level-tag">Lv.${video.reqLevel}</span>
      ${isWatched ? '<span class="badge-completed">✓ 시청 완료</span>' : ''}
      ${isLocked ? `<div class="lock-overlay">🔒 Lv.${video.reqLevel} 필요</div>` : ''}
      <img src="${video.thumbnail}" alt="${video.title}">
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterVideo(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderVideos(category);
}

// 회원가입
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const id = document.getElementById('signupId').value;
  const grade = document.getElementById('signupGrade').value;
  const pw = document.getElementById('signupPw').value;

  const newUser = {
    id: id,
    pw: pw,
    name: name,
    grade: grade,
    level: 1, // 초기 레벨 1
    points: 0,
    watchedVideoIds: [],
    isAdmin: id === 'admin'
  };

  localStorage.setItem(`user_${id}`, JSON.stringify(newUser));
  alert('회원가입 완료! 로그인해 주세요.');
  closeModal('signupModal');
}

// 로그인
function handleLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginId').value;
  const pw = document.getElementById('loginPw').value;

  if (id === 'admin' && pw === 'admin') {
    let adminUser = JSON.parse(localStorage.getItem('user_admin')) || {
      id: 'admin', name: '관리자', level: 99, points: 99, watchedVideoIds: [], isAdmin: true
    };
    loginSuccess(adminUser);
    return;
  }

  const savedUser = JSON.parse(localStorage.getItem(`user_${id}`));
  if (savedUser && savedUser.pw === pw) {
    loginSuccess(savedUser);
  } else {
    alert('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
}

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('history_current_user', JSON.stringify(currentUser));
  updateUI();
  closeModal('loginModal');
  alert(`${user.name}님 환영합니다!`);
}

function logout() {
  currentUser = null;
  localStorage.removeItem('history_current_user');
  updateUI();
  alert('로그아웃 되었습니다.');
}

// UI 및 뱃지 업데이트
function updateUI() {
  if (currentUser) {
    document.getElementById('userInfoBar').style.display = 'flex';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    
    document.getElementById('displayUserName').innerText = `${currentUser.name} (${currentUser.grade || '관리자'})`;
    document.getElementById('displayLevel').innerText = currentUser.level;
    document.getElementById('displayPoints').innerText = currentUser.points;

    document.getElementById('adminBtn').style.display = currentUser.isAdmin ? 'inline-block' : 'none';

    // 뱃지 자동 획득 체크 (포인트 & 레벨 조건 충족 시)
    const badgeContainer = document.getElementById('displayBadges');
    badgeContainer.innerHTML = '';
    badgeList.forEach(badge => {
      if (currentUser.points >= badge.points && currentUser.level >= badge.reqLevel) {
        const badgeSpan = document.createElement('span');
        badgeSpan.title = `${badge.name} (이모지: ${badge.icon})`;
        badgeSpan.innerText = badge.icon;
        badgeContainer.appendChild(badgeSpan);
      }
    });

  } else {
    document.getElementById('userInfoBar').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('signupBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('adminBtn').style.display = 'none';
  }
  renderVideos();
}

// 영상 플레이어
function openVideoModal(video) {
  activeVideo = video;
  document.getElementById('youtubePlayer').src = `${video.youtubeUrl}?autoplay=1`;
  document.getElementById('videoModalTitle').innerText = video.title;
  document.getElementById('videoModalDesc').innerText = video.desc;

  const isWatched = currentUser && currentUser.watchedVideoIds.includes(video.id);
  document.getElementById('startQuizBtn').style.display = isWatched ? 'none' : 'block';
  document.getElementById('watchedBadge').style.display = isWatched ? 'inline' : 'none';

  document.getElementById('videoModal').style.display = 'flex';
}

function closeVideoModal() {
  document.getElementById('youtubePlayer').src = '';
  document.getElementById('videoModal').style.display = 'none';
  activeVideo = null;
}

// 퀴즈 창 열기
function openQuizModal() {
  if (!currentUser) {
    alert('로그인 후 퀴즈에 참여할 수 있습니다.');
    return;
  }
  closeVideoModal();

  const container = document.getElementById('quizContainer');
  container.innerHTML = '';

  activeVideo.quizzes.forEach((quiz, index) => {
    const div = document.createElement('div');
    div.className = 'quiz-item';
    div.innerHTML = `
      <p>${quiz.q}</p>
      <input type="text" id="userAns_${index}" placeholder="정답을 입력하세요" required>
    `;
    container.appendChild(div);
  });

  document.getElementById('quizModal').style.display = 'flex';
}

// 퀴즈 제출 및 레벨업 체크
function submitQuiz() {
  let isAllCorrect = true;

  activeVideo.quizzes.forEach((quiz, index) => {
    const userAns = document.getElementById(`userAns_${index}`).value.trim();
    if (userAns !== quiz.a.trim()) {
      isAllCorrect = false;
    }
  });

  if (isAllCorrect) {
    alert('🎉 정답입니다! 1 포인트를 얻고 레벨이 1 올랐습니다.');
    
    currentUser.points += 1;
    currentUser.level += 1; // 레벨업으로 다음 영상 해금
    currentUser.watchedVideoIds.push(activeVideo.id);

    localStorage.setItem('history_current_user', JSON.stringify(currentUser));
    localStorage.setItem(`user_${currentUser.id}`, JSON.stringify(currentUser));

    closeModal('quizModal');
    updateUI();
  } else {
    alert('❌ 아쉽네요! 틀린 정답이 있습니다. 영상을 다시 시청하고 도전해 보세요.');
  }
}

// 관리자: 영상 및 퀴즈 등록
function handleAddVideo(e) {
  e.preventDefault();
  const title = document.getElementById('adminVideoTitle').value;
  const category = document.getElementById('adminVideoCategory').value;
  const reqLevel = parseInt(document.getElementById('adminReqLevel').value);
  const rawUrl = document.getElementById('adminYoutubeUrl').value;
  const desc = document.getElementById('adminVideoDesc').value;

  const embedUrl = formatYoutubeEmbedUrl(rawUrl);
  const videoId = embedUrl.split('/embed/')[1];
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const quizzes = [
    { q: document.getElementById('q1Text').value, a: document.getElementById('q1Ans').value },
    { q: document.getElementById('q2Text').value, a: document.getElementById('q2Ans').value },
    { q: document.getElementById('q3Text').value, a: document.getElementById('q3Ans').value }
  ];

  const newVideo = {
    id: Date.now(),
    title, category, reqLevel, thumbnail,
    youtubeUrl: embedUrl, desc, quizzes
  };

  videoList.push(newVideo);
  localStorage.setItem('history_videos_v2', JSON.stringify(videoList));
  alert('새 영상과 퀴즈가 성공적으로 등록되었습니다.');
  renderVideos();
  closeModal('adminModal');
}

// 관리자: 커스텀 뱃지 추가 및 관리
function handleAddBadge(e) {
  e.preventDefault();
  const name = document.getElementById('badgeName').value;
  const icon = document.getElementById('badgeIcon').value;
  const points = parseInt(document.getElementById('badgePoints').value);
  const reqLevel = parseInt(document.getElementById('badgeLevel').value);

  badgeList.push({ name, icon, points, reqLevel });
  badgeList.sort((a, b) => a.points - b.points);

  localStorage.setItem('history_badges_v2', JSON.stringify(badgeList));
  alert('커스텀 뱃지 등록 완료!');
  renderAdminBadgeList();
  updateUI();
}

function renderAdminBadgeList() {
  const list = document.getElementById('adminBadgeList');
  list.innerHTML = '';
  badgeList.forEach(b => {
    const li = document.createElement('li');
    li.innerText = `${b.icon} ${b.name} (필요: ${b.points}pt / Lv.${b.reqLevel})`;
    list.appendChild(li);
  });
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
  if (id === 'adminModal') renderAdminBadgeList();
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

window.onload = () => {
  updateUI();
};
