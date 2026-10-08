// ==========================================
// 1. 화면 전환(View) 함수
// ==========================================
function showView(viewId) {
  // 모든 view-section 요소 숨기기
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => {
    view.style.display = 'none';
  });

  // 대상 view 요소만 보이기
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  } else {
    console.error(`'${viewId}' ID를 가진 섹션을 찾을 수 없습니다.`);
  }
}

// ==========================================
// 2. 버튼 이벤트 연결 (HTML 로드 완료 후 실행)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // 1) 로고/홈 버튼 (헤더 제목 클릭 시 홈으로)
  const logoBtn = document.querySelector('header h1') || document.querySelector('.logo');
  if (logoBtn) {
    logoBtn.style.cursor = 'pointer';
    logoBtn.addEventListener('click', () => showView('homeView'));
  }

  // 2) '내 방' 버튼 이벤트
  // 상단 버튼 중 "님의 방" 글자가 포함된 버튼을 자동으로 찾습니다.
  const allButtons = Array.from(document.querySelectorAll('button, a'));
  
  const myRoomBtn = allButtons.find(btn => btn.textContent.includes('님의 방') || btn.textContent.includes('내 방'));
  if (myRoomBtn) {
    myRoomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showView('myRoomView');
    });
  }

  // 3) '관리자 방' 버튼 이벤트
  const adminBtn = allButtons.find(btn => btn.textContent.includes('관리자 방'));
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showView('adminView');
    });
  }

  // 4) '로그아웃' 버튼 이벤트 (확인 창 alert 포함)
  const logoutBtn = allButtons.find(btn => btn.textContent.includes('로그아웃'));
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // 로그아웃 재확인 confirm 창
      const isConfirm = confirm('정말 로그아웃 하시겠습니까?');
      if (!isConfirm) return; // '취소' 시 중단

      // Supabase 로그아웃 연동 (있는 경우)
      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        await supabaseClient.auth.signOut();
      }

      alert('로그아웃 되었습니다.');
      window.location.reload(); // 페이지 새로고침 또는 로그인 페이지로 이동
    });
  }

  // 기본적으로 첫 화면(homeView)을 보여줍니다.
  showView('homeView');
});
