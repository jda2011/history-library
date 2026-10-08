// Supabase 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

SUPABASE_URL = SUPABASE_URL.replace(/\/+$\vert{}\/auth\/v1.*$/g, '');

let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase 클라이언트 초기화 실패:", e);
}

// 시대별 영상 데이터
const videoData = [
  { id: 1, era: 'ancient', title: '[고대] 단군왕검과 고조선 성립', desc: '한반도 최초의 국가 고조선의 건국과 8조법을 살펴봅니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 2, era: 'ancient', title: '[고대] 삼국시대 태동과 광개토대왕', desc: '고구려 전성기를 이끈 광개토대왕의 영토 확장 이야기입니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 3, era: 'medieval', title: '[중세] 고려의 창건과 왕건', desc: '후삼국을 통일하고 고려를 건국한 태조 왕건의 정책을 공부합니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 4, era: 'medieval', title: '[중세] 대몽항쟁과 팔만대장경', desc: '몽골 침입에 맞서 팔만대장경을 제작한 고려 백성들의 호국 정신.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 5, era: 'early-modern', title: '[근세] 세종대왕과 훈민정음 창제', desc: '백성을 생각하는 마음으로 창제된 한글의 역사를 확인합니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 6, era: 'early-modern', title: '[근세] 임진왜란과 이순신 장군', desc: '조선 바다를 지켜낸 이순신 장군의 명량 및 한산도 대첩.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 7, era: 'modern', title: '[근대] 강화도 조약과 개항', desc: '조선 말기 서구 열강의 등장과 개항 과정의 변화를 정리합니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 8, era: 'modern', title: '[근대] 3·1 운동과 대한민국 임시정부', desc: '일제강점기 전 민족이 함께한 독립운동과 임시정부 수립.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 9, era: 'contemporary', title: '[현대] 6·25 전쟁과 한반도 분단', desc: '광복 이후 한반도의 역사와 전쟁의 아픔, 분단 과정입니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 10, era: 'contemporary', title: '[현대] 한강의 기적과 민주화 운동', desc: '대한민국의 눈부신 경제 성장과 민주주의 발전 과정.', youtubeId: 'dQw4w9WgXcQ' }
];

document.addEventListener('DOMContentLoaded', () => {
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const navMyRoomBtn = document.getElementById('navMyRoomBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  
  const homeSection = document.getElementById('homeSection');
  const myRoomSection = document.getElementById('myRoomSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const togglePwBtn = document.getElementById('togglePwBtn');
  const regPwInput = document.getElementById('regPw');
  
  const toggleLoginPwBtn = document.getElementById('toggleLoginPwBtn');
  const loginPwInput = document.getElementById('loginPw');

  const videoList = document.getElementById('videoList');
  const videoModal = document.getElementById('videoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalVideoDesc = document.getElementById('modalVideoDesc');

  let currentUser = null;

  // 화면 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (myRoomSection) myRoomSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
  };

  // UI 로그인 상태 반영
  function updateAuthState(user) {
    currentUser = user;
    if (user) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || '사용자';
      
      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';
      
      const userNicknameDisplay = document.getElementById('userNicknameDisplay');
      const myRoomUsername = document.getElementById('myRoomUsername');
      const myEmail = document.getElementById('myEmail');
      const myNickname = document.getElementById('myNickname');
      const welcomeMsg = document.getElementById('welcomeMsg');

      if (userNicknameDisplay) userNicknameDisplay.textContent = username;
      if (myRoomUsername) myRoomUsername.textContent = username;
      if (myEmail) myEmail.textContent = user.email || '-';
      if (myNickname) myNickname.textContent = username;
      if (welcomeMsg) welcomeMsg.textContent = `${username}님, 환영합니다! 동영상을 선택하여 시청해보세요.`;
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      const welcomeMsg = document.getElementById('welcomeMsg');
      if (welcomeMsg) welcomeMsg.textContent = '로그인 후 다양한 역사 동영상을 시청해보세요!';
    }
  }

  // 로그인 상태 세션 확인
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    }).catch(() => updateAuthState(null));
  } else {
    updateAuthState(null);
  }

  // 상단 네비게이션 버튼들
  if (navHomeBtn) navHomeBtn.onclick = () => window.showSection('homeSection');
  if (navLoginBtn) navLoginBtn.onclick = () => window.showSection('loginSection');
  if (navRegisterBtn) navRegisterBtn.onclick = () => window.showSection('registerSection');
  if (navMyRoomBtn) navMyRoomBtn.onclick = () => window.showSection('myRoomSection');

  // 로그아웃 처리
  if (navLogoutBtn) {
    navLogoutBtn.onclick = async () => {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      updateAuthState(null);
      alert('로그아웃 되었습니다.');
      window.showSection('homeSection');
    };
  }

  // 비밀번호 보임/숨김 토글
  if (togglePwBtn && regPwInput) {
    togglePwBtn.onclick = () => {
      regPwInput.type = regPwInput.type === 'password' ? 'text' : 'password';
      togglePwBtn.textContent = regPwInput.type === 'password' ? '보임' : '숨김';
    };
  }

  if (toggleLoginPwBtn && loginPwInput) {
    toggleLoginPwBtn.onclick = () => {
      loginPwInput.type = loginPwInput.type === 'password' ? 'text' : 'password';
      toggleLoginPwBtn.textContent = loginPwInput.type === 'password' ? '보임' : '숨김';
    };
  }

  // 영상 목록 출력
  function renderVideos(eraFilter = 'all') {
    if (!videoList) return;
    videoList.innerHTML = '';
    const filtered = eraFilter === 'all' ? videoData : videoData.filter(v => v.era === eraFilter);

    filtered.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumbnail">📺</div>
        <h3>${video.title}</h3>
        <p>${video.desc}</p>
      `;

      card.onclick = () => {
        if (!currentUser) {
          alert('영상을 시청하시려면 먼저 로그인해 주세요!');
          window.showSection('loginSection');
          return;
        }
        if (modalVideoTitle) modalVideoTitle.textContent = video.title;
        if (modalVideoDesc) modalVideoDesc.textContent = video.desc;
        if (modalVideoPlayer) modalVideoPlayer.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
        if (videoModal) videoModal.style.display = 'flex';
      };

      videoList.appendChild(card);
    });
  }

  // 모달 닫기
  if (closeModalBtn) {
    closeModalBtn.onclick = () => {
      if (videoModal) videoModal.style.display = 'none';
      if (modalVideoPlayer) modalVideoPlayer.src = '';
    };
  }

  // 시대별 부록 탭
  const eraButtons = document.querySelectorAll('.era-btn');
  eraButtons.forEach(btn => {
    btn.onclick = (e) => {
      eraButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderVideos(e.currentTarget.dataset.era);
    };
  });

  renderVideos('all');

  // 아이디 중복 확인
  function checkUsernameDuplicate(username) {
    const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
    return !!userMap[username];
  }

  // 회원가입
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPw').value;
    const ageGroup = document.getElementById('regAge').value;

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (!specialCharRegex.test(password)) {
      alert('비밀번호에 최소 1개 이상의 특수문자(!@#$%^&* 등)가 포함되어야 합니다.');
      return;
    }

    // 아이디 중복 체크
    if (checkUsernameDuplicate(username)) {
      alert('누군가 사용중입니다');
      return;
    }

    if (!supabaseClient) {
      alert('Supabase 초기화 실패');
      return;
    }

    // 👑 'jj' 아이디인 경우 자동으로 관리자(admin) 권한 부여
    const isAdminAccount = (username === 'jj');

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { 
          username: username, 
          age_group: ageGroup,
          role: isAdminAccount ? 'admin' : 'user' // 👈 jj 계정만 'admin' 설정
        }
      }
    });

    if (error) {
      alert('회원가입 실패: ' + error.message);
    } else {
      // 아이디 - 이메일 정보 저장
      const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
      userMap[username] = email;
      localStorage.setItem('user_map', JSON.stringify(userMap));

      alert(`${username}님, 회원가입 성공!${isAdminAccount ? ' (관리자 권한이 부여되었습니다)' : ''}`);
      window.showSection('loginSection');
    }
  };
}

      // 아이디 중복 체크
      if (checkUsernameDuplicate(username)) {
        alert('누군가 사용중입니다');
        return;
      }

      if (!supabaseClient) {
        alert('Supabase 초기화 실패');
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { username: username, age_group: ageGroup }
        }
      });

      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        // 아이디 - 이메일 정보 저장
        const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
        userMap[username] = email;
        localStorage.setItem('user_map', JSON.stringify(userMap));

        alert('회원가입 성공! 이제 로그인해 주세요.');
        window.showSection('loginSection');
      }
    };
  }

  // 로그인
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const inputVal = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPw').value;

      if (!supabaseClient) {
        alert('Supabase 초기화 실패');
        return;
      }

      // 입력값이 이메일 형식이 아닌 아이디인 경우, 등록된 이메일 가져오기
      const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
      let targetEmail = userMap[inputVal] || inputVal;

      // 만약 저장된 이메일이 없는 아이디일 경우 가상 이메일 형식을 할당해서 시도
      if (!targetEmail.includes('@')) {
        targetEmail = `${inputVal}@library.com`;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });

      if (error) {
        alert('로그인 실패: 아이디(이메일) 또는 비밀번호가 올바르지 않습니다.');
      } else {
        updateAuthState(data.user);
        const displayName = data.user.user_metadata?.username || inputVal;
        alert(`${displayName}님 환영합니다!`);
        window.showSection('homeSection');
      }
    };
  }
});

// LocalStorage를 활용해 영상과 퀴즈를 지속 관리 (기본 데이터 초기화)
let customVideoData = JSON.parse(localStorage.getItem('custom_video_data')) || [
  { id: 1, era: 'ancient', title: '[고대] 단군왕검과 고조선 성립', desc: '한반도 최초의 국가 고조선의 건국과 8조법을 살펴봅니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 2, era: 'medieval', title: '[중세] 고려의 창건과 왕건', desc: '후삼국을 통일하고 고려를 건국한 태조 왕건의 정책을 공부합니다.', youtubeId: 'dQw4w9WgXcQ' }
];

let customQuizData = JSON.parse(localStorage.getItem('custom_quiz_data')) || [];

// 1. 화면 전환 함수에 adminSection 처리 추가
window.showSection = function(sectionId) {
  if (homeSection) homeSection.style.display = 'none';
  if (myRoomSection) myRoomSection.style.display = 'none';
  if (registerSection) registerSection.style.display = 'none';
  if (loginSection) loginSection.style.display = 'none';
  
  const adminSec = document.getElementById('adminSection');
  if (adminSec) adminSec.style.display = 'none';

  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.style.display = 'block';
};

// 2. 권한에 따른 관리자 전용 UI 노출
function updateAuthState(user) {
  currentUser = user;
  const adminBadge = document.getElementById('adminBadge');
  const navAdminBtn = document.getElementById('navAdminBtn');

  if (user) {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || '사용자';
    const userRole = user.user_metadata?.role || (username === 'jj' ? 'admin' : 'user');

    if (guestNav) guestNav.style.display = 'none';
    if (userNav) userNav.style.display = 'flex';

    if (userRole === 'admin') {
      if (adminBadge) adminBadge.style.display = 'inline-block';
      if (navAdminBtn) navAdminBtn.style.display = 'inline-block';
    } else {
      if (adminBadge) adminBadge.style.display = 'none';
      if (navAdminBtn) navAdminBtn.style.display = 'none';
    }
  } else {
    if (guestNav) guestNav.style.display = 'flex';
    if (userNav) userNav.style.display = 'none';
    if (adminBadge) adminBadge.style.display = 'none';
    if (navAdminBtn) navAdminBtn.style.display = 'none';
  }
}

// 3. 관리자 센터 이벤트 연동
document.addEventListener('DOMContentLoaded', () => {
  const navAdminBtn = document.getElementById('navAdminBtn');
  if (navAdminBtn) {
    navAdminBtn.onclick = () => {
      window.showSection('adminSection');
      renderAdminManageList();
      populateQuizVideoSelect();
    };
  }

  // 영상 등록 처리
  const adminAddVideoForm = document.getElementById('adminAddVideoForm');
  if (adminAddVideoForm) {
    adminAddVideoForm.onsubmit = (e) => {
      e.preventDefault();
      const newVideo = {
        id: Date.now(),
        era: document.getElementById('adminVideoEra').value,
        title: document.getElementById('adminVideoTitle').value.trim(),
        youtubeId: document.getElementById('adminVideoYoutubeId').value.trim(),
        desc: document.getElementById('adminVideoDesc').value.trim()
      };

      customVideoData.push(newVideo);
      localStorage.setItem('custom_video_data', JSON.stringify(customVideoData));
      alert('영상이 새로 등록되었습니다!');
      adminAddVideoForm.reset();
      renderVideos('all');
      renderAdminManageList();
      populateQuizVideoSelect();
    };
  }

  // 퀴즈 등록 처리
  const adminAddQuizForm = document.getElementById('adminAddQuizForm');
  if (adminAddQuizForm) {
    adminAddQuizForm.onsubmit = (e) => {
      e.preventDefault();
      const newQuiz = {
        id: Date.now(),
        videoId: Number(document.getElementById('adminQuizVideoSelect').value),
        question: document.getElementById('adminQuizQuestion').value.trim(),
        options: [
          document.getElementById('adminQuizOpt1').value.trim(),
          document.getElementById('adminQuizOpt2').value.trim(),
          document.getElementById('adminQuizOpt3').value.trim(),
          document.getElementById('adminQuizOpt4').value.trim()
        ],
        answer: Number(document.getElementById('adminQuizAnswer').value)
      };

      customQuizData.push(newQuiz);
      localStorage.setItem('custom_quiz_data', JSON.stringify(customQuizData));
      alert('퀴즈(문제)가 등록되었습니다!');
      adminAddQuizForm.reset();
      renderAdminManageList();
    };
  }
});

// 관리자 삭제용 목록 동적 생성
function renderAdminManageList() {
  const container = document.getElementById('adminManageList');
  if (!container) return;

  container.innerHTML = '<h4>[등록된 영상 목록]</h4>';

  if (customVideoData.length === 0) {
    container.innerHTML += '<p style="color:#888;">등록된 영상이 없습니다.</p>';
  } else {
    customVideoData.forEach(v => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span><b>${v.title}</b> (${v.era})</span>
        <button onclick="deleteVideo(${v.id})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">영상 삭제</button>
      `;
      container.appendChild(item);
    });
  }

  container.innerHTML += '<h4 style="margin-top:20px;">[등록된 퀴즈 목록]</h4>';
  if (customQuizData.length === 0) {
    container.innerHTML += '<p style="color:#888;">등록된 퀴즈가 없습니다.</p>';
  } else {
    customQuizData.forEach(q => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span><b>Q: ${q.question}</b> (정답: ${q.answer}번)</span>
        <button onclick="deleteQuiz(${q.id})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">퀴즈 삭제</button>
      `;
      container.appendChild(item);
    });
  }
}

// 영상 삭제 함수
window.deleteVideo = function(videoId) {
  if (confirm('이 영상을 삭제하시겠습니까? 관련 퀴즈도 함께 삭제될 수 있습니다.')) {
    customVideoData = customVideoData.filter(v => v.id !== videoId);
    customQuizData = customQuizData.filter(q => q.videoId !== videoId);
    localStorage.setItem('custom_video_data', JSON.stringify(customVideoData));
    localStorage.setItem('custom_quiz_data', JSON.stringify(customQuizData));
    renderVideos('all');
    renderAdminManageList();
    populateQuizVideoSelect();
  }
};

// 퀴즈 삭제 함수
window.deleteQuiz = function(quizId) {
  if (confirm('이 퀴즈를 삭제하시겠습니까?')) {
    customQuizData = customQuizData.filter(q => q.id !== quizId);
    localStorage.setItem('custom_quiz_data', JSON.stringify(customQuizData));
    renderAdminManageList();
  }
};

// 퀴즈 생성 시 영상 선택 드롭다운 갱신
function populateQuizVideoSelect() {
  const select = document.getElementById('adminQuizVideoSelect');
  if (!select) return;
  select.innerHTML = '';
  customVideoData.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.title;
    select.appendChild(opt);
  });
}
