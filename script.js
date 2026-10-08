// ==========================================
// 1. 전역 유틸리티 함수 (화면 전환, 모달, 눈동자)
// ==========================================

// 화면 전환 함수
function showView(viewId) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => {
    view.style.display = 'none';
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  } else {
    console.warn(`'${viewId}' ID를 가진 섹션을 찾을 수 없습니다.`);
  }
}
window.showView = showView;

// 모달 열기
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

// 모달 닫기
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
window.openModal = openModal;
window.closeModal = closeModal;

// 비밀번호 보이기 / 숨기기 (👁️) 토글 함수
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}
window.togglePassword = togglePassword;

// ==========================================
// 2. Supabase 데이터 관련 로직 (사용자, 영상, 퀴즈)
// ==========================================

// 현재 로그인한 사용자 정보 가져오기 및 UI 반영
async function loadUserProfile() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient.auth) return;

  const { data: { user }, error } = await supabaseClient.auth.getUser();

  if (user) {
    // 개인 방 프로필 정보 업데이트
    const nicknameElem = document.getElementById('myRoomNickname');
    const emailElem = document.getElementById('myRoomEmail');
    const userBtnText = document.getElementById('userNavBtnText');

    const userNickname = user.user_metadata?.nickname || user.email.split('@')[0];
    
    if (nicknameElem) nicknameElem.textContent = userNickname;
    if (emailElem) emailElem.textContent = user.email;
    if (userBtnText) userBtnText.textContent = `${userNickname}님의 방`;

    // 상단 네비게이션 로그인/로그아웃 버튼 표시 전환
    const loggedInNav = document.querySelectorAll('.auth-logged-in');
    const loggedOutNav = document.querySelectorAll('.auth-logged-out');

    loggedInNav.forEach(el => el.style.display = 'inline-block');
    loggedOutNav.forEach(el => el.style.display = 'none');
  } else {
    const loggedInNav = document.querySelectorAll('.auth-logged-in');
    const loggedOutNav = document.querySelectorAll('.auth-logged-out');

    loggedInNav.forEach(el => el.style.display = 'none');
    loggedOutNav.forEach(el => el.style.display = 'inline-block');
  }
}

// 영상 목록 불러오기 (홈 화면)
async function fetchVideos() {
  const videoListContainer = document.getElementById('videoList');
  if (!videoListContainer || typeof supabaseClient === 'undefined') return;

  const { data: videos, error } = await supabaseClient
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('영상 불러오기 실패:', error);
    return;
  }

  videoListContainer.innerHTML = '';
  if (videos.length === 0) {
    videoListContainer.innerHTML = '<p class="empty-msg">등록된 영상이 없습니다.</p>';
    return;
  }

  videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-thumbnail">
        <iframe src="${video.url}" frameborder="0" allowfullscreen></iframe>
      </div>
      <div class="video-info">
        <span class="category-badge">${video.category || '기타'}</span>
        <h3>${video.title}</h3>
        <p>${video.description || ''}</p>
      </div>
    `;
    videoListContainer.appendChild(card);
  });
}

// ==========================================
// 3. 메인 이벤트 리스너 (DOM 로드 후 실행)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

  // 초기 프로필 및 영상 목록 불러오기
  loadUserProfile();
  fetchVideos();

  // --- [A] 클릭 이벤트 통합 감지 ---
  document.body.addEventListener('click', async (e) => {
    const target = e.target;
    const text = target.textContent ? target.textContent.trim() : '';

    // 로그인 모달 열기
    if (text === '로그인' || target.id === 'loginBtn' || target.classList.contains('btn-login')) {
      e.preventDefault();
      openModal('loginModal');
    }

    // 회원가입 모달 열기
    else if (text === '회원가입' || target.id === 'signupBtn' || target.classList.contains('btn-signup')) {
      e.preventDefault();
      openModal('signupModal');
    }

    // 내 방 이동
    else if (text.includes('님의 방') || text.includes('내 방') || text.includes('마이페이지')) {
      e.preventDefault();
      showView('myRoomView');
    }

    // 관리자 방 이동
    else if (text.includes('관리자 방') || text.includes('관리자 센터')) {
      e.preventDefault();
      showView('adminView');
    }

    // 홈 이동
    else if (text.includes('역사 동영상 도서관') || target.classList.contains('logo')) {
      e.preventDefault();
      showView('homeView');
    }

    // 로그아웃 (confirm 확인 창 포함)
    else if (text === '로그아웃') {
      e.preventDefault();
      const confirmLogout = confirm('정말 로그아웃 하시겠습니까?');
      if (!confirmLogout) return;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        await supabaseClient.auth.signOut();
      }
      alert('로그아웃 되었습니다.');
      window.location.reload();
    }

    // 모달 닫기
    else if (target.classList.contains('close-modal') || target.classList.contains('btn-close')) {
      const modal = target.closest('.modal');
      if (modal) modal.style.display = 'none';
    }
  });

  // --- [B] 모달 외부 바깥 클릭 시 닫기 ---
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // --- [C] 회원가입 처리 (닉네임, 연령, 비밀번호 확인 포함) ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('signupEmail')?.value;
      const nickname = document.getElementById('signupNickname')?.value;
      const age = document.getElementById('signupAge')?.value;
      const password = document.getElementById('signupPassword')?.value;
      const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value;

      // 비밀번호 일치 검사 (비밀번호 재입력 칸이 있는 경우)
      if (passwordConfirm && password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              nickname: nickname,
              age: age ? parseInt(age, 10) : null
            }
          }
        });

        if (error) {
          alert('회원가입 실패: ' + error.message);
        } else {
          alert('회원가입이 완료되었습니다! 로그인해 주세요.');
          closeModal('signupModal');
        }
      } else {
        alert('Supabase가 연결되지 않았습니다.');
      }
    });
  }

  // --- [D] 로그인 처리 ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          alert('로그인 실패: ' + error.message);
        } else {
          alert('로그인 성공!');
          closeModal('loginModal');
          window.location.reload();
        }
      } else {
        alert('Supabase가 연결되지 않았습니다.');
      }
    });
  }

  // 기본 홈 화면 표시
  showView('homeView');
});
