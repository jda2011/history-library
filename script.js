// 전역 화면 전환 함수
window.showSection = function(sectionId) {
  const sections = ['homeSection', 'myRoomSection', 'registerSection', 'loginSection', 'adminSection'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const navMyRoomBtn = document.getElementById('navMyRoomBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');
  const navAdminBtn = document.getElementById('navAdminBtn');

  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 비밀번호 보임/숨김 버튼
  const togglePwBtn = document.getElementById('togglePwBtn') || document.getElementById('toggleRegisterPwBtn');
  const regPwInput = document.getElementById('regPw');
  const toggleLoginPwBtn = document.getElementById('toggleLoginPwBtn');
  const loginPwInput = document.getElementById('loginPw');

  // 모달 요소
  const videoModal = document.getElementById('videoModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  let currentUser = null;

  // 1. 로그인 상태 업데이트 (관리자 권한 자동 부여)
  function updateAuthState(user) {
    currentUser = user;
    const adminBadge = document.getElementById('adminBadge');

    if (user) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || '사용자';
      // jj 아이디는 무조건 admin 권한 부여
      const userRole = (username === 'jj') ? 'admin' : (user.user_metadata?.role || 'user');

      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';

      // 관리자 메뉴 & 배지 노출
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

  // 2. 초기 세션 확인
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    }).catch(() => updateAuthState(null));
  }

  // 3. 네비게이션 버튼 이벤트
  if (navHomeBtn) navHomeBtn.onclick = () => window.showSection('homeSection');
  if (navLoginBtn) navLoginBtn.onclick = () => window.showSection('loginSection');
  if (navRegisterBtn) navRegisterBtn.onclick = () => window.showSection('registerSection');
  if (navMyRoomBtn) navMyRoomBtn.onclick = () => window.showSection('myRoomSection');
  if (navAdminBtn) navAdminBtn.onclick = () => {
    window.showSection('adminSection');
    if (typeof window.renderAdminManageList === 'function') window.renderAdminManageList();
    if (typeof window.populateQuizVideoSelect === 'function') window.populateQuizVideoSelect();
  };

  // 🔴 4. 로그아웃 (재차 확인 창 추가)
  if (navLogoutBtn) {
    navLogoutBtn.onclick = async () => {
      const confirmLogout = confirm('정말 로그아웃 하시겠습니까?');
      if (!confirmLogout) return;

      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      updateAuthState(null);
      alert('로그아웃 되었습니다.');
      window.showSection('homeSection');
    };
  }

  // 5. 비밀번호 보임/숨김 토글
  if (togglePwBtn && regPwInput) {
    togglePwBtn.onclick = (e) => {
      e.preventDefault();
      const isPw = (regPwInput.type === 'password');
      regPwInput.type = isPw ? 'text' : 'password';
      togglePwBtn.textContent = isPw ? '숨김' : '보임';
    };
  }

  if (toggleLoginPwBtn && loginPwInput) {
    toggleLoginPwBtn.onclick = (e) => {
      e.preventDefault();
      const isPw = (loginPwInput.type === 'password');
      loginPwInput.type = isPw ? 'text' : 'password';
      toggleLoginPwBtn.textContent = isPw ? '숨김' : '보임';
    };
  }

  // 6. 영상 목록 렌더링
  window.renderVideos = function(eraFilter = 'all') {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;
    videoList.innerHTML = '';

    const list = window.customVideoData || [];
    const filtered = eraFilter === 'all' ? list : list.filter(v => v.era === eraFilter);

    if (filtered.length === 0) {
      videoList.innerHTML = '<p style="text-align:center; color:#888; grid-column: 1/-1;">등록된 영상이 없습니다.</p>';
      return;
    }

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

  // 7. 시대별 탭 필터링
  const eraButtons = document.querySelectorAll('.era-btn');
  eraButtons.forEach(btn => {
    btn.onclick = (e) => {
      eraButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      window.renderVideos(e.currentTarget.dataset.era);
    };
  });

  // 8. 모달 닫기
  if (closeModalBtn) {
    closeModalBtn.onclick = () => {
      if (videoModal) videoModal.style.display = 'none';
      const modalVideoPlayer = document.getElementById('modalVideoPlayer');
      if (modalVideoPlayer) modalVideoPlayer.src = '';
    };
  }

  window.renderVideos('all');

  // 9. 회원가입
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();

      const username = document.getElementById('regUsername').value.trim();
      const emailInput = document.getElementById('regEmail') ? document.getElementById('regEmail').value.trim() : '';
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge') ? document.getElementById('regAge').value : '';

      if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('Supabase가 연결되지 않았습니다.');
        return;
      }

      const finalEmail = (emailInput && emailInput.includes('@')) ? emailInput : `${username}@library.com`;
      const isAdminAccount = (username === 'jj');

      const { data, error } = await supabaseClient.auth.signUp({
        email: finalEmail,
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
        alert(`${username}님, 회원가입 성공!${isAdminAccount ? ' (관리자 권한 부여)' : ''}`);
        window.showSection('loginSection');
      }
    };
  }

  // 10. 로그인
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const inputVal = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPw').value;

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('Supabase가 연결되지 않았습니다.');
        return;
      }

      const targetEmail = inputVal.includes('@') ? inputVal : `${inputVal}@library.com`;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });

      if (error) {
        alert('로그인 실패: 아이디 또는 비밀번호를 확인해 주세요.');
      } else {
        updateAuthState(data.user);
        const displayName = data.user.user_metadata?.username || inputVal;
        alert(`${displayName}님 환영합니다!`);
        window.showSection('homeSection');
      }
    };
  }
});
