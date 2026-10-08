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
    console.warn(`'${viewId}' ID를 가진 섹션을 찾을 수 없습니다.`);
  }
}

// Inline HTML onclick 호환용 함수
window.showView = showView;

// ==========================================
// 2. 버튼 클릭 이벤트 및 초기화 처리
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // HTML 내부의 모든 버튼/링크 감지
  const allNavElements = document.querySelectorAll('button, a, .logo, header h1');

  allNavElements.forEach(element => {
    const text = element.textContent.trim();

    // 1) 홈/로고 클릭 시
    if (text.includes('역사 동영상 도서관') || element.classList.contains('logo')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        showView('homeView');
      });
    }

    // 2) '내 방' (또는 'OO님의 방') 클릭 시
    else if (text.includes('님의 방') || text.includes('내 방') || text.includes('마이페이지')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        showView('myRoomView');
      });
    }

    // 3) '관리자 방' 클릭 시
    else if (text.includes('관리자 방') || text.includes('관리자 센터')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        showView('adminView');
      });
    }

    // 4) '로그아웃' 클릭 시 (재확인 alert 창 포함)
    else if (text.includes('로그아웃')) {
      element.addEventListener('click', async (e) => {
        e.preventDefault();

        // 1차 재확인 물어보기
        const confirmLogout = confirm('정말 로그아웃 하시겠습니까?');
        if (!confirmLogout) return;

        // Supabase 로그아웃 실행 (Supabase 연동 시)
        if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
          try {
            await supabaseClient.auth.signOut();
          } catch (err) {
            console.error('로그아웃 오류:', err);
          }
        }

        alert('로그아웃 되었습니다.');
        window.location.reload();
      });
    }
  });

  // 기본 첫 화면 설정
  showView('homeView');
});
