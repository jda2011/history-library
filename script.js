// script.js - 메인 로직 및 안정적인 화면 전환

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

  // 안전한 화면 전환 함수
  function showSection(targetSection) {
    Object.values(sections).forEach(sec => {
      if (sec) sec.style.display = 'none';
    });
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  }

  // 상단 로고 클릭 -> 홈 이동
  if (btns.home) {
    btns.home.onclick = () => {
      showSection(sections.home);
      loadVideos();
    };
  }

  // 로그인 버튼 클릭 -> 로그인 화면 이동
  if (btns.login) {
    btns.login.onclick = () => {
      showSection(sections.login);
    };
  }

  // 회원가입 버튼 클릭 -> 회원가입 화면 이동
  if (btns.register) {
    btns.register.onclick = () => {
      showSection(sections.register);
    };
  }

  // 내 방 버튼 클릭 -> 마이페이지 이동
  if (btns.myRoom) {
    btns.myRoom.onclick = () => {
      showSection(sections.myRoom);
      loadMyProfile();
    };
  }

  // 로그아웃
  if (btns.logout) {
    btns.logout.onclick = async () => {
      try {
        if (typeof supabaseClient !== 'undefined') {
          await supabaseClient.auth.signOut();
        }
      } catch (err) {
        console.warn('로그아웃 중 오류:', err);
      }
      localStorage.removeItem('userSession');
      alert('로그아웃 되었습니다.');
      checkAuthState();
      showSection(sections.home);
    };
  }

  // 로그인 상태 확인 및 UI 반영 함수
async function checkAuthState() {
  let user = null;

  try {
    if (typeof supabaseClient !== 'undefined') {
      const { data } = await supabaseClient.auth.getUser();
      user = data?.user;
    }
  } catch (err) {
    console.warn('사용자 인증 확인 실패:', err);
  }

  if (user) {
    if (navs.guest) navs.guest.style.display = 'none';
    if (navs.user) navs.user.style.display = 'flex';

    const nicknameDisplay = document.getElementById('userNicknameDisplay');
    if (nicknameDisplay) {
      nicknameDisplay.textContent = user.user_metadata?.nickname || user.email.split('@')[0];
    }

    // 💡 관리자 이메일 설정 (원하는 관리자 이메일 주소를 입력하세요)
    const ADMIN_EMAIL = '8yskvkwj@gmail.com'; // 👈 본인의 관리자 이메일로 변경하세요!

    if (btns.admin) {
      if (user.email === ADMIN_EMAIL) {
        btns.admin.style.display = 'inline-block'; // 관리자일 때만 보임
      } else {
        btns.admin.style.display = 'none'; // 일반 유저에게는 안 보임
      }
    }
  } else {
    if (navs.guest) navs.guest.style.display = 'flex';
    if (navs.user) navs.user.style.display = 'none';
  }
}
  // 로그인 폼 제출 처리
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
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
        await checkAuthState();
        showSection(sections.home);
      } catch (err) {
        alert('로그인 실패: ' + (err.message || '아이디와 비밀번호를 확인하세요.'));
      }
    };
  }

  // 회원가입 폼 제출 처리
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const pw = document.getElementById('regPw').value;
      const username = document.getElementById('regUsername').value;

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: pw,
          options: {
            data: { nickname: username }
          }
        });

        if (error) throw error;

        alert('회원가입 신청이 완료되었습니다! (이메일 인증 확인 필요)');
        showSection(sections.login);
      } catch (err) {
        alert('회원가입 실패: ' + (err.message || '다시 시도해 주세요.'));
      }
    };
  }

  // 영상 목록 가져오기 함수 (에러 방어 완비)
  window.loadVideos = async function() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;

    try {
      if (typeof supabaseClient === 'undefined') {
        videoList.innerHTML = '<p style="grid-column:1/-1; color:#888;">Supabase가 설정되지 않았습니다.</p>';
        return;
      }

      const { data: videos, error } = await supabaseClient
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('영상 목록 로드 실패 (테이블 확인 필요):', error);
        videoList.innerHTML = '<p style="grid-column:1/-1; color:#888;">현재 등록된 영상이 없거나 DB 연결 준비 중입니다.</p>';
        return;
      }

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
      console.warn('영상 로드 중 예외 발생:', err);
      videoList.innerHTML = '<p style="grid-column:1/-1; color:#888;">영상 데이터를 불러올 수 없습니다.</p>';
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

  // 1. 화면 전환(View Navigation) 함수
function showView(viewId) {
  // 모든 뷰 섹션 가져오기
  const views = document.querySelectorAll('.view-section');
  
  // 모든 섹션을 숨김 처리
  views.forEach(view => {
    view.style.display = 'none';
  });

  // 클릭한 ID의 섹션만 표시
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  }
}

// 2. 상단 상단 네비게이션 버튼 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
  // 로고 / 홈 버튼 클릭 시
  const logoBtn = document.getElementById('logoBtn'); // 상단 로고/제목 ID
  if (logoBtn) {
    logoBtn.addEventListener('click', () => showView('homeView'));
  }

  // '내 방' 버튼 클릭 시
  const myRoomBtn = document.getElementById('myRoomBtn'); // 또는 querySelector('.btn-myroom')
  if (myRoomBtn) {
    myRoomBtn.addEventListener('click', () => showView('myRoomView'));
  }

  // '관리자 방' 버튼 클릭 시
  const adminBtn = document.getElementById('adminBtn'); // 또는 querySelector('.btn-admin')
  if (adminBtn) {
    adminBtn.addEventListener('click', () => showView('adminView'));
  }
  
  // 기본 첫 화면 설정
  showView('homeView');
});

  // 마이페이지 정보 로드
  async function loadMyProfile() {
    try {
      const { data } = await supabaseClient.auth.getUser();
      if (data?.user) {
        const user = data.user;
        document.getElementById('myRoomUsername').textContent = user.user_metadata?.nickname || '사용자';
        document.getElementById('myEmail').textContent = user.email;
      }
    } catch (err) {
      console.warn('프로필 로드 실패:', err);
    }
  }

  // 초기 시작 실행
  checkAuthState();
  loadVideos();
});
// 1. 화면 전환 함수
function showView(viewId) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(v => v.style.display = 'none');

  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
  }
}

// 2. 버튼 이벤트 및 로그아웃 재확인 처리
document.addEventListener('DOMContentLoaded', () => {
  // 상단 내 방 버튼
  const myRoomBtn = document.getElementById('navMyRoomBtn') || document.querySelector('.btn-myroom');
  if (myRoomBtn) {
    myRoomBtn.addEventListener('click', () => showView('myRoomView'));
  }

  // 상단 관리자 방 버튼
  const adminBtn = document.getElementById('navAdminBtn') || document.querySelector('.btn-admin');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => showView('adminView'));
  }

  // 상단 로고 클릭 시 홈으로
  const homeBtn = document.getElementById('navHomeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => showView('homeView'));
  }

  // 로그아웃 버튼 (재확인 alert 창 포함)
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const confirmLogout = confirm('정말 로그아웃 하시겠습니까?');
      if (!confirmLogout) return; // '취소' 클릭 시 반응하지 않음

      if (typeof supabaseClient !== 'undefined') {
        await supabaseClient.auth.signOut();
      }
      alert('로그아웃 되었습니다.');
      window.location.reload();
    });
  }
});
