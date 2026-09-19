document.addEventListener('DOMContentLoaded', () => {
  // 배경 및 로그인 상태 체크
  applyBackground();
  checkLoginStatus();

  // 회원가입 폼 이벤트 바인딩
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', handleRegister);
  }

  // 로그인 폼 이벤트 바인딩
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// script.js 상단
const BASE_URL = 'http://localhost:5000';

let currentVideoId = null;

document.addEventListener('DOMContentLoaded', () => {
  applyBackground();
  checkLoginStatus();

  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
});

// 섹션 전환
function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.style.display = 'none');

  const target = document.getElementById(sectionId);
  if (target) target.style.display = 'block';

  if (sectionId === 'mainSection') {
    loadVideos();
  }
}

// 비밀번호 눈 토글
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);

  // 상단에 서버 base URL 변수 추가
const BASE_URL = 'http://localhost:5000'; // 백엔드 포트에 맞춰 수정하세요

// 회원가입 함수(handleRegister) 내부 수정:
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  try {
    // 상대 경로 `/api/auth/register` -> `${BASE_URL}/api/auth/register`로 변경
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, grade })
    });

    const data = await res.json();

    if (res.ok) {
      alert('회원가입이 완료되었습니다!');
      document.getElementById('registerForm').reset();
      showSection('loginSection');
    } else {
      alert(data.message || '회원가입 실패');
    }
  } catch (err) {
    console.error('상세 에러 내용:', err); // 콘솔에 실제 에러 출력
    alert('서버 통신 오류가 발생했습니다.');
  }
}
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// 배경 적용 API 호출
async function applyBackground() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const config = await res.json();

    if (config.mainBannerTitle && document.getElementById('bannerTitle')) {
      document.getElementById('bannerTitle').textContent = config.mainBannerTitle;
    }
    if (config.mainBannerDescription && document.getElementById('bannerDesc')) {
      document.getElementById('bannerDesc').textContent = config.mainBannerDescription;
    }

    if (config.backgroundImageUrl) {
      document.body.style.backgroundImage = `url('${config.backgroundImageUrl}')`;
      document.body.style.backgroundSize = 'cover';
    } else if (config.backgroundColor) {
      document.body.style.backgroundColor = config.backgroundColor;
    }
  } catch (err) {
    console.error('배경 불러오기 실패:', err);
  }
}

// 회원가입 (완료 후 입력창 초기화 및 로그인 화면으로 이동)
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, grade })
    });

    const data = await res.json();

    if (res.ok) {
      alert('회원가입이 완료되었습니다!');
      document.getElementById('registerForm').reset();
      showSection('loginSection');
    } else {
      alert(data.message || '회원가입 실패');
    }
  } catch (err) {
    alert('서버 통신 오류');
  }
}

// 로그인 처리
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('로그인되었습니다!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      document.getElementById('loginForm').reset();
      checkLoginStatus();
      showSection('mainSection');
    } else {
      alert(data.message || '로그인 실패');
    }
  } catch (err) {
    alert('서버 통신 오류');
  }
}

// 로그인 상태 체크 UI 변경
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const authNav = document.getElementById('authNav');
  const userNav = document.getElementById('userNav');
  const adminBtn = document.getElementById('adminBtn');

  if (token && user.username) {
    if (authNav) authNav.style.display = 'none';
    if (userNav) userNav.style.display = 'block';

    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.textContent = `${user.username} 님 (${user.badgeRank || '초보 사관'}) - ${user.points || 0}P`;
    }

    if (user.role === 'admin' && adminBtn) {
      adminBtn.style.display = 'inline-block';
    }
  } else {
    if (authNav) authNav.style.display = 'block';
    if (userNav) userNav.style.display = 'none';
  }
}

// 로그아웃
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  checkLoginStatus();
  showSection('mainSection');
}

// 동영상 목록 불러오기
async function loadVideos() {
  const container = document.getElementById('videoContainer');
  if (!container) return;

  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p>로그인 후 학년에 맞는 역사 동영상을 시청할 수 있습니다.</p>';
    return;
  }

  try {
    const res = await fetch('/api/videos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const videos = await res.json();

    container.innerHTML = '';
    videos.forEach(v => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `<h3>${v.title}</h3><p>시청 후 퀴즈 풀기 🎯</p>`;
      card.onclick = () => openQuizSection(v);
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p>동영상을 불러오지 못했습니다.</p>';
  }
}

// 퀴즈 화면 열기
function openQuizSection(video) {
  currentVideoId = video._id;
  document.getElementById('quizVideoTitle').textContent = video.title;
  document.getElementById('quizVideoFrame').src = video.videoUrl;

  const questionsDiv = document.getElementById('quizQuestions');
  questionsDiv.innerHTML = '';

  video.quizzes.forEach((q, idx) => {
    const qBox = document.createElement('div');
    qBox.className = 'quiz-item';
    qBox.innerHTML = `<h4>Q${idx + 1}. ${q.question}</h4>`;

    q.options.forEach((opt, optIdx) => {
      qBox.innerHTML += `
        <label style="display:block; margin:4px 0;">
          <input type="radio" name="q_${idx}" value="${optIdx}"> ${opt}
        </label>
      `;
    });
    questionsDiv.appendChild(qBox);
  });

  showSection('quizSection');
}

// 퀴즈 제출
async function submitQuiz() {
  const token = localStorage.getItem('token');
  const quizItems = document.querySelectorAll('.quiz-item');
  const answers = [];

  quizItems.forEach((_, idx) => {
    const selected = document.querySelector(`input[name="q_${idx}"]:checked`);
    answers.push(selected ? parseInt(selected.value) : -1);
  });

  try {
    const res = await fetch(`/api/videos/${currentVideoId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const result = await res.json();

    if (result.isAllCorrect) {
      alert(`🎉 축하합니다! 모든 퀴즈를 맞혀 ${result.earnedPoints} 포인트를 획득하셨습니다!`);
    } else {
      alert(`아쉽네요! ${result.totalQuestions} 문제 중 ${result.correctCount} 문제를 맞혔습니다.`);
    }
  } catch (err) {
    alert('퀴즈 제출에 실패했습니다.');
  }
}

// 관리자 전용 퀴즈 폼 동적 추가 로직
let quizCount = 0;
function addQuizInput() {
  quizCount++;
  const container = document.getElementById('quizInputsContainer');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'admin-quiz-item';
  div.style.marginBottom = '15px';
  div.innerHTML = `
    <h5>문제 ${quizCount}</h5>
    <input type="text" placeholder="퀴즈 질문" class="q-title" required style="width:100%; margin-bottom:5px;" />
    <input type="text" placeholder="보기 1" class="q-opt-0" required />
    <input type="text" placeholder="보기 2" class="q-opt-1" required />
    <input type="text" placeholder="보기 3" class="q-opt-2" required />
    <input type="text" placeholder="보기 4" class="q-opt-3" required />
    <select class="q-correct">
      <option value="0">정답: 보기 1</option>
      <option value="1">정답: 보기 2</option>
      <option value="2">정답: 보기 3</option>
      <option value="3">정답: 보기 4</option>
    </select>
  `;
  container.appendChild(div);
}

// 1. script.js 파일 최상단에 추가 (백엔드 실행 포트가 5000일 경우)
const BASE_URL = 'http://localhost:5000'; 

// 2. applyBackground 함수 수정
async function applyBackground() {
  try {
    const res = await fetch(`${BASE_URL}/api/config`); // BASE_URL 추가
    if (!res.ok) return;
    const config = await res.json();
    // ... 기존 동일
  } catch (err) {
    console.error('배경 불러오기 실패:', err);
  }
}

// 3. handleRegister 함수 수정
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, { // BASE_URL 추가
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, grade })
    });

    const data = await res.json();

    if (res.ok) {
      alert('회원가입이 완료되었습니다!');
      document.getElementById('registerForm').reset();
      showSection('loginSection');
    } else {
      alert(data.message || '회원가입 실패');
    }
  } catch (err) {
    alert('서버 통신 오류가 발생했습니다.');
  }
}

// script.js 맨 위에 백엔드 서버 주소를 적어줍니다.
// (예: 백엔드가 Vercel/Render 등에 따로 열려있다면 해당 주소, 로컬 테스트라면 http://localhost:5000)
const BASE_URL = 'https://your-backend-domain.com'; // 👈 실제 백엔드 서버 주소 입력

// API 요청하는 부분들 수정:
// 1. applyBackground
const res = await fetch(`${BASE_URL}/api/config`);

// 2. handleRegister
const res = await fetch(`${BASE_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, grade })
});

// 3. handleLogin
const res = await fetch(`${BASE_URL}/api/auth/login`, { ... });

// 4. loadVideos
const res = await fetch(`${BASE_URL}/api/videos`, { ... });

document.addEventListener('DOMContentLoaded', () => {
  // 회원가입 버튼/폼 이벤트
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // 로그인 버튼/폼 이벤트
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// 회원가입 처리 함수 예시
async function handleRegister(e) {
  e.preventDefault();
  // ...회원가입 fetch 로직
}

document.addEventListener('DOMContentLoaded', () => {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');

  // 우측 상단 '회원가입' 버튼 클릭 시
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', () => {
      if (homeSection) homeSection.style.display = 'none';
      if (registerSection) registerSection.style.display = 'block';
    });
  }

  // 회원가입 폼 제출 이벤트
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

// 회원가입 백엔드 요청 함수
async function handleRegister(e) {
  e.preventDefault();
  const userId = document.getElementById('regId').value;
  const userPw = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userId, password: userPw })
    });

    const data = await res.json();
    if (res.ok) {
      alert('회원가입 성공!');
    } else {
      alert(data.message || '회원가입 실패');
    }
  } catch (err) {
    alert('서버 통신 오류');
  }
}
