document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
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
  const adminSection = document.getElementById('adminSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 👁️ 비밀번호 보임/숨김 토글 요소
  const togglePwBtn = document.getElementById('togglePwBtn');
  const regPwInput = document.getElementById('regPw');
  const toggleLoginPwBtn = document.getElementById('toggleLoginPwBtn');
  const loginPwInput = document.getElementById('loginPw');

  // 모달 요소
  const videoModal = document.getElementById('videoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  let currentUser = null;

  // 1. 화면 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (myRoomSection) myRoomSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';

    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
  };

  // 2. 로그인 상태 UI 업데이트
  function updateAuthState(user) {
    currentUser = user;
    const adminBadge = document.getElementById('adminBadge');
    const navAdminBtn = document.getElementById('navAdminBtn');

    if (user) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || '사용자';
      const userRole = user.user_metadata?.role || (username === 'jj' ? 'admin' : 'user');

      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';

      // 관리자 UI 표시
      if (userRole === 'admin') {
        if (adminBadge) adminBadge.style.display = 'inline-block';
        if (navAdminBtn) navAdminBtn.style.display = 'inline-block';
      } else {
        if (adminBadge) adminBadge.style.display = 'none';
        if (navAdminBtn) navAdminBtn.style.display = 'none';
      }

      // 내정보 UI 반영
      const userNicknameDisplay = document.getElementById('userNicknameDisplay');
      const myRoomUsername = document.getElementById('myRoomUsername');
      const myEmail = document.getElementById('myEmail');
      const myNickname = document.getElementById('myNickname');

      if (userNicknameDisplay) userNicknameDisplay.textContent = username;
      if (myRoomUsername) myRoomUsername.textContent = username;
      if (myEmail) myEmail.textContent = user.email || '-';
      if (myNickname) myNickname.textContent = username;
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (adminBadge) adminBadge.style.display = 'none';
      if (navAdminBtn) navAdminBtn.style.display = 'none';
    }
  }

  // 3. Supabase 세션 체크
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    }).catch(() => updateAuthState(null));
  }

  // 4. 네비게이션 버튼 이벤트
  if (navHomeBtn) navHomeBtn.onclick = () => window.showSection('homeSection');
  if (navLoginBtn) navLoginBtn.onclick = () => window.showSection('loginSection');
  if (navRegisterBtn) navRegisterBtn.onclick = () => window.showSection('registerSection');
  if (navMyRoomBtn) navMyRoomBtn.onclick = () => window.showSection('myRoomSection');

  // 로그아웃
  if (navLogoutBtn) {
    navLogoutBtn.onclick = async () => {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      updateAuthState(null);
      alert('로그아웃 되었습니다.');
      window.showSection('homeSection');
    };
  }

  // 5. 👁️ 비밀번호 보임/숨김 토글 기능 복원
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

  // 6. 📺 영상 목록 렌더링
  window.renderVideos = function(eraFilter = 'all') {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;
    videoList.innerHTML = '';

    const list = window.customVideoData || [];
    const filtered = eraFilter === 'all' ? list : list.filter(v => v.era === eraFilter);

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
        const modalVideoTitle = document.getElementById('modalVideoTitle');
        const modalVideoDesc = document.getElementById('modalVideoDesc');
        const modalVideoPlayer = document.getElementById('modalVideoPlayer');

        if (modalVideoTitle) modalVideoTitle.textContent = video.title;
        if (modalVideoDesc) modalVideoDesc.textContent = video.desc;
        if (modalVideoPlayer) modalVideoPlayer.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
        if (videoModal) videoModal.style.display = 'flex';
      };

      videoList.appendChild(card);
    });
  };

  // 7. 시대별 탭 필터링 이벤트 복원
  const eraButtons = document.querySelectorAll('.era-btn');
  eraButtons.forEach(btn => {
    btn.onclick = (e) => {
      eraButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      window.renderVideos(e.currentTarget.dataset.era);
    };
  });

  // 8. 모달 닫기 복원
  if (closeModalBtn) {
    closeModalBtn.onclick = () => {
      if (videoModal) videoModal.style.display = 'none';
      const modalVideoPlayer = document.getElementById('modalVideoPlayer');
      if (modalVideoPlayer) modalVideoPlayer.src = '';
    };
  }

  window.renderVideos('all');

  // 9. 회원가입 처리
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge').value;

      if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('Supabase 연결 실패');
        return;
      }

      const isAdminAccount = (username === 'jj');

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { 
            username: username, 
            age_group: ageGroup,
            role: isAdminAccount ? 'admin' : 'user'
          }
        }
      });

      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
        userMap[username] = email;
        localStorage.setItem('user_map', JSON.stringify(userMap));

        alert(`${username}님, 회원가입 성공!${isAdminAccount ? ' (관리자 권한이 부여되었습니다)' : ''}`);
        window.showSection('loginSection');
      }
    };
  }

  // 10. 로그인 처리
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const inputVal = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPw').value;

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('Supabase 연결 실패');
        return;
      }

      // 저장된 이메일 찾기
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
