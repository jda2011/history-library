// Supabase 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

SUPABASE_URL = SUPABASE_URL.replace(/\/+$\vert{}\/auth\/v1.*$/g, '');

let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_ANON_KEY !== ''sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase 클라이언트 초기화 대기 중");
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
  // 요소를 안전하게 가져오기
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

  // 1. 화면 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (myRoomSection) myRoomSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  };

  // 2. 로그인 상태 업데이트 UI
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

  // 초기 로그인 세션 확인
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    }).catch(() => updateAuthState(null));
  } else {
    updateAuthState(null);
  }

  // 3. 네비게이션 버튼 바인딩
  if (navHomeBtn) navHomeBtn.onclick = () => window.showSection('homeSection');
  if (navLoginBtn) navLoginBtn.onclick = () => window.showSection('loginSection');
  if (navRegisterBtn) navRegisterBtn.onclick = () => window.showSection('registerSection');
  if (navMyRoomBtn) navMyRoomBtn.onclick = () => window.showSection('myRoomSection');

  // 로그아웃
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

  // 4. 비밀번호 표시 토글
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

  // 5. 영상 목록 렌더링 및 모달 클릭
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

  // 시대별 부록 탭 이벤트
  const eraButtons = document.querySelectorAll('.era-btn');
  eraButtons.forEach(btn => {
    btn.onclick = (e) => {
      eraButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderVideos(e.currentTarget.dataset.era);
    };
  });

  renderVideos('all');

  // 6. 아이디 중복 체크
  async function checkUsernameDuplicate(username) {
    const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
    if (userMap[username]) return true;

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient
          .from('profiles')
          .select('username')
          .eq('username', username);
        if (data && data.length > 0) return true;
      } catch (err) {}
    }
    return false;
  }

  // 7. 회원가입 제출
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

      // 아이디 중복 확인
      const isDuplicate = await checkUsernameDuplicate(username);
      if (isDuplicate) {
        alert('누군가 사용중입니다');
        return;
      }

      if (!supabaseClient) {
        alert('Supabase 키가 설정되지 않았습니다. script.js 최상단 키값을 등록해 주세요.');
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
        const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
        userMap[username] = email;
        localStorage.setItem('user_map', JSON.stringify(userMap));

        alert('회원가입 성공! 이제 로그인해 주세요.');
        window.showSection('loginSection');
      }
    };
  }

  // 8. 로그인 제출
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const inputVal = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPw').value;

      if (!supabaseClient) {
        alert('Supabase 키가 설정되지 않았습니다. script.js 최상단 키값을 등록해 주세요.');
        return;
      }

      const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
      let targetEmail = userMap[inputVal] || inputVal;

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
