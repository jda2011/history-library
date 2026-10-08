// script.js - 메인 로직 및 화면 전환

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 선택
  const sections = {
    home: document.getElementById('homeSection'),
    myRoom: document.getElementById('myRoomSection'),
    admin: document.getElementById('adminSection'),
    login: document.getElementById('loginSection'),
    register: document.getElementById('registerSection')
  };

  const navs = {
    guest: document.getElementById('guestNav'),
    user: document.getElementById('userNav')
  };

  const btns = {
    home: document.getElementById('navHomeBtn'),
    login: document.getElementById('navLoginBtn'),
    register: document.getElementById('navRegisterBtn'),
    myRoom: document.getElementById('navMyRoomBtn'),
    admin: document.getElementById('navAdminBtn'),
    logout: document.getElementById('navLogoutBtn')
  };

  // 화면 전환 함수
  function showSection(targetSection) {
    Object.values(sections).forEach(sec => {
      if (sec) sec.style.display = 'none';
    });
    if (targetSection) targetSection.style.display = 'block';
  }

  // 상단 로고 클릭 -> 홈 이동
  if (btns.home) {
    btns.home.addEventListener('click', () => {
      showSection(sections.home);
      loadVideos();
    });
  }

  // 로그인 버튼 클릭 -> 로그인 화면 이동
  if (btns.login) {
    btns.login.addEventListener('click', () => {
      showSection(sections.login);
    });
  }

  // 회원가입 버튼 클릭 -> 회원가입 화면 이동
  if (btns.register) {
    btns.register.addEventListener('click', () => {
      showSection(sections.register);
    });
  }

  // 내 방 버튼 클릭 -> 마이페이지 이동
  if (btns.myRoom) {
    btns.myRoom.addEventListener('click', () => {
      showSection(sections.myRoom);
      loadMyProfile();
    });
  }

  // 로그아웃
  if (btns.logout) {
    btns.logout.addEventListener('click', async () => {
      if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.auth.signOut();
      }
      localStorage.removeItem('userSession');
      alert('로그아웃 되었습니다.');
      checkAuthState();
      showSection(sections.home);
    });
  }

  // 로그인 상태 확인 및 UI 반영
  async function checkAuthState() {
    let user = null;

    if (typeof supabaseClient !== 'undefined') {
      const { data } = await supabaseClient.auth.getUser();
      user = data?.user;
    }

    if (user) {
      if (navs.guest) navs.guest.style.display = 'none';
      if (navs.user) navs.user.style.display = 'flex';

      const nicknameDisplay = document.getElementById('userNicknameDisplay');
      if (nicknameDisplay) nicknameDisplay.textContent = user.user_metadata?.nickname || user.email.split('@')[0];

      // 관리자 권한 확인 (예: 특정 아이디나 메일)
      if (btns.admin) {
        btns.admin.style.display = 'inline-block';
      }
    } else {
      if (navs.guest) navs.guest.style.display = 'flex';
      if (navs.user) navs.user.style.display = 'none';
    }
  }

  // 로그인 폼 제출 처리
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginUsername').value;
      const pw = document.getElementById('loginPw').value;

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: pw
        });

        if (error) throw error;

        alert('로그인되었습니다!');
        checkAuthState();
        showSection(sections.home);
      } catch (err) {
        alert('로그인 실패: ' + (err.message || '아이디와 비밀번호를 확인하세요.'));
      }
    });
  }

  // 영상 목록 가져오기 함수 (글로벌 바인딩)
  window.loadVideos = async function() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    videoList.innerHTML = '<p>영상을 불러오는 중...</p>';

    try {
      if (typeof supabaseClient === 'undefined') return;

      const { data: videos, error } = await supabaseClient
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!videos || videos.length === 0) {
        videoList.innerHTML = '<p style="grid-column:1/-1; color:#888;">등록된 영상이 없습니다.</p>';
        return;
      }

      videoList.innerHTML = '';
      videos.forEach(v => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
          <div class="video-thumbnail">📺</div>
          <h4 style="margin-top:10px;">[${v.era}] ${v.title}</h4>
          <p style="font-size:12px; color:#666; margin-top:4px;">${v.description}</p>
        `;
        card.onclick = () => openVideoModal(v);
        videoList.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      videoList.innerHTML = '<p>영상 목록을 불러올 수 없습니다.</p>';
    }
  };

  // 영상 재생 모달 창
  function openVideoModal(video) {
    const modal = document.getElementById('videoModal');
    const title = document.getElementById('modalVideoTitle');
    const player = document.getElementById('modalVideoPlayer');
    const desc = document.getElementById('modalVideoDesc');

    if (title) title.textContent = video.title;
    if (desc) desc.textContent = video.description;
    if (player) {
      player.src = video.video_url;
      player.style.display = 'block';
    }
    if (modal) modal.style.display = 'flex';
  }

  // 모달 닫기
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.onclick = () => {
      const modal = document.getElementById('videoModal');
      const player = document.getElementById('modalVideoPlayer');
      if (player) {
        player.pause();
        player.src = '';
      }
      if (modal) modal.style.display = 'none';
    };
  }

  // 마이페이지 정보 로드
  async function loadMyProfile() {
    const { data } = await supabaseClient.auth.getUser();
    if (data?.user) {
      document.getElementById('myRoomUsername').textContent = data.user.user_metadata?.nickname || '사용자';
      document.getElementById('myEmail').textContent = data.user.email;
    }
  }

  // 초기화 실행
  checkAuthState();
  loadVideos();
});
