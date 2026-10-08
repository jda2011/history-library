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
  const adminSection = document.getElementById('adminSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  let currentUser = null;

  // 화면 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (myRoomSection) myRoomSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';

    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';
  };

  // 로그인 상태 반영
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

      const userNicknameDisplay = document.getElementById('userNicknameDisplay');
      if (userNicknameDisplay) userNicknameDisplay.textContent = username;
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (adminBadge) adminBadge.style.display = 'none';
      if (navAdminBtn) navAdminBtn.style.display = 'none';
    }
  }

  // 로그인 상태 확인
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    }).catch(() => updateAuthState(null));
  }

  if (navHomeBtn) navHomeBtn.onclick = () => window.showSection('homeSection');
  if (navLoginBtn) navLoginBtn.onclick = () => window.showSection('loginSection');
  if (navRegisterBtn) navRegisterBtn.onclick = () => window.showSection('registerSection');
  if (navMyRoomBtn) navMyRoomBtn.onclick = () => window.showSection('myRoomSection');

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

  // 영상 목록 출력
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
        const videoModal = document.getElementById('videoModal');

        if (modalVideoTitle) modalVideoTitle.textContent = video.title;
        if (modalVideoDesc) modalVideoDesc.textContent = video.desc;
        if (modalVideoPlayer) modalVideoPlayer.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
        if (videoModal) videoModal.style.display = 'flex';
      };

      videoList.appendChild(card);
    });
  };

  window.renderVideos('all');

  // 회원가입
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

        alert(`${username}님, 회원가입 성공!`);
        window.showSection('loginSection');
      }
    };
  }

  // 로그인 (async 올바르게 부여됨)
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const inputVal = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPw').value;

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert('Supabase 연결 실패');
        return;
      }

      const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
      let targetEmail = userMap[inputVal] || inputVal;

      if (!targetEmail.includes('@')) {
        targetEmail = `${inputVal}@library.com`;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });

      if (error) {
        alert('로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        updateAuthState(data.user);
        const displayName = data.user.user_metadata?.username || inputVal;
        alert(`${displayName}님 환영합니다!`);
        window.showSection('homeSection');
      }
    };
  }
});
