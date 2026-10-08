// ==========================================
// 1. 화면 전환 (View Navigation)
// ==========================================
function showView(viewId) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(v => v.style.display = 'none');

  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
  }
}
window.showView = showView;

// ==========================================
// 2. 모달(팝업창) 열기 / 닫기
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
window.openModal = openModal;
window.closeModal = closeModal;

// ==========================================
// 3. 이벤트 연결 및 메인 로직
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

  // --- [A] 상단 네비게이션 & 모달 버튼 연결 ---
  document.body.addEventListener('click', async (e) => {
    const target = e.target;
    const text = target.textContent ? target.textContent.trim() : '';

    // 1) 로그인 버튼 클릭 -> 로그인 모달 열기
    if (text === '로그인' || target.id === 'loginBtn' || target.classList.contains('btn-login')) {
      e.preventDefault();
      openModal('loginModal'); // HTML의 로그인 모달 ID
    }

    // 2) 회원가입 버튼 클릭 -> 회원가입 모달 열기
    else if (text === '회원가입' || target.id === 'signupBtn' || target.classList.contains('btn-signup')) {
      e.preventDefault();
      openModal('signupModal'); // HTML의 회원가입 모달 ID
    }

    // 3) 내 방 (또는 'OO님의 방') 클릭
    else if (text.includes('님의 방') || text.includes('내 방') || text.includes('마이페이지')) {
      e.preventDefault();
      showView('myRoomView');
    }

    // 4) 관리자 방 클릭
    else if (text.includes('관리자 방') || text.includes('관리자 센터')) {
      e.preventDefault();
      showView('adminView');
    }

    // 5) 로고 / 홈 클릭
    else if (text.includes('역사 동영상 도서관') || target.classList.contains('logo')) {
      e.preventDefault();
      showView('homeView');
    }

    // 6) 로그아웃 버튼 클릭 (재확인 alert 창 포함)
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

    // 7) 모달 닫기 버튼 (X 또는 닫기 버튼)
    else if (target.classList.contains('close-modal') || target.classList.contains('btn-close')) {
      const modal = target.closest('.modal');
      if (modal) modal.style.display = 'none';
    }
  });

  // --- [B] 모달 외부 배경 클릭 시 닫기 ---
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // --- [C] 로그인 폼 제출 처리 ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          alert('로그인 실패: ' + error.message);
        } else {
          alert('로그인 성공!');
          closeModal('loginModal');
          window.location.reload();
        }
      } else {
        alert('Supabase 설정이 완료되지 않았습니다.');
      }
    });
  }

  // --- [D] 회원가입 폼 제출 처리 ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail')?.value;
      const password = document.getElementById('signupPassword')?.value;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
          alert('회원가입 실패: ' + error.message);
        } else {
          alert('회원가입이 완료되었습니다! 로그인해 주세요.');
          closeModal('signupModal');
        }
      } else {
        alert('Supabase 설정이 완료되지 않았습니다.');
      }
    });
  }

  // 기본 첫 화면은 홈 화면으로 설정
  showView('homeView');
});
