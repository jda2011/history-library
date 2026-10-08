window.showSection = function(sectionId) {
  const sections = ['homeSection', 'myRoomSection', 'registerSection', 'loginSection', 'adminSection'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  let currentUser = null;

  function updateAuthState(user) {
    currentUser = user;
    const adminBadge = document.getElementById('adminBadge');
    const navAdminBtn = document.getElementById('navAdminBtn');

    if (user) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || '사용자';
      const userRole = (username === 'jj') ? 'admin' : (user.user_metadata?.role || 'user');

      if (guestNav) guestNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';

      if (userRole === 'admin') {
        if (adminBadge) adminBadge.style.display = 'inline-block';
        if (navAdminBtn) navAdminBtn.style.display = 'inline-block';
      } else {
        if (adminBadge) adminBadge.style.display = 'none';
        if (navAdminBtn) navAdminBtn.style.display = 'none';
      }

      document.getElementById('userNicknameDisplay').textContent = username;
      document.getElementById('myRoomUsername').textContent = username;
      document.getElementById('myEmail').textContent = user.email || '-';
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (userNav) userNav.style.display = 'none';
      if (adminBadge) adminBadge.style.display = 'none';
      if (navAdminBtn) navAdminBtn.style.display = 'none';
    }
  }

  // 초기 세션 동기화
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session ? session.user : null);
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session ? session.user : null);
    });
  }

  // 네비게이션 버튼
  document.getElementById('navHomeBtn').onclick = () => window.showSection('homeSection');
  document.getElementById('navLoginBtn').onclick = () => window.showSection('loginSection');
  document.getElementById('navRegisterBtn').onclick = () => window.showSection('registerSection');
  document.getElementById('navMyRoomBtn').onclick = () => window.showSection('myRoomSection');
  document.getElementById('navAdminBtn').onclick = () => {
    window.showSection('adminSection');
    if (typeof window.renderAdminManageList === 'function') window.renderAdminManageList();
    if (typeof window.populateQuizVideoSelect === 'function') window.populateQuizVideoSelect();
  };

  // 로그아웃
  document.getElementById('navLogoutBtn').onclick = async () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      updateAuthState(null);
      alert('로그아웃 되었습니다.');
      window.showSection('homeSection');
    }
  };

  // 비디오 카드 렌더링 및 모달 연결
  window.renderVideos = function() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;
    videoList.innerHTML = '';

    const list = window.customVideoData || [];

    if (list.length === 0) {
      videoList.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">게시된 영상이 없습니다.</p>';
      return;
    }

    list.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumbnail">📺</div>
        <h3 style="margin-top:10px;">${video.title}</h3>
        <p style="font-size:13px; color:#666; margin-top:5px;">${video.desc}</p>
      `;

      card.onclick = () => {
        // 로그인 체크 (currentUser가 존재하면 즉시 시청)
        if (!currentUser) {
          alert('영상을 시청하시려면 먼저 로그인해 주세요!');
          window.showSection('loginSection');
          return;
        }

        const modal = document.getElementById('videoModal');
        const modalVideoTitle = document.getElementById('modalVideoTitle');
        const modalVideoDesc = document.getElementById('modalVideoDesc');
        const videoPlayer = document.getElementById('modalVideoPlayer');
        const iframePlayer = document.getElementById('modalIframePlayer');

        modalVideoTitle.textContent = video.title;
        modalVideoDesc.textContent = video.desc;

        const url = video.videoUrl || '';

        // 직접 제작한 MP4 파일 링크 여부 판단
        if (url.includes('.mp4') || url.includes('.webm') || url.includes('blob:')) {
          videoPlayer.src = url;
          videoPlayer.style.display = 'block';
          iframePlayer.style.display = 'none';
          videoPlayer.play();
        } else {
          // 유튜브나 기타 웹 링크일 때
          iframePlayer.src = url.includes('youtube.com') ? url.replace('watch?v=', 'embed/') : url;
          iframePlayer.style.display = 'block';
          videoPlayer.style.display = 'none';
        }

        modal.style.display = 'flex';
      };

      videoList.appendChild(card);
    });
  };

  // 모달 닫기
  document.getElementById('closeModalBtn').onclick = () => {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('modalVideoPlayer');
    const iframePlayer = document.getElementById('modalIframePlayer');

    videoPlayer.pause();
    videoPlayer.src = '';
    iframePlayer.src = '';
    modal.style.display = 'none';
  };

  window.renderVideos();

  // 회원가입
  document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPw').value;

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username, role: username === 'jj' ? 'admin' : 'user' } }
    });

    if (error) {
      alert('회원가입 실패: ' + error.message);
    } else {
      const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
      userMap[username] = email;
      localStorage.setItem('user_map', JSON.stringify(userMap));

      alert(`${username}님, 회원가입이 완료되었습니다!`);
      window.showSection('loginSection');
    }
  };

  // 로그인
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const inputVal = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPw').value;

    const userMap = JSON.parse(localStorage.getItem('user_map') || '{}');
    let targetEmail = userMap[inputVal];

    if (inputVal === 'jj') {
      targetEmail = targetEmail || '8yskvkwj@gmail.com';
    }

    if (!targetEmail) {
      targetEmail = inputVal.includes('@') ? inputVal : `${inputVal}@library.com`;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: targetEmail,
      password: password
    });

    if (error) {
      alert('로그인 실패: 아이디 또는 비밀번호를 확인해 주세요.');
    } else {
      updateAuthState(data.user);
      alert(`${inputVal}님, 환영합니다!`);
      window.showSection('homeSection');
    }
  };
});
