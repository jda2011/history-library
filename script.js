document.addEventListener('DOMContentLoaded', () => {
  // HTML 요소 가져오기
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // 화면 전환 전용 함수
  function showSection(sectionToShow) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    if (sectionToShow) {
      sectionToShow.style.display = 'block';
    }
  }

  // 상단 '로그인' 버튼 클릭 이벤트
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      showSection(loginSection);
    });
  }

  // 상단 '회원가입' 버튼 클릭 이벤트
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', () => {
      showSection(registerSection);
    });
  }

  // 회원가입 폼 제출(Submit)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('regId').value;
      const userPw = document.getElementById('regPw').value;

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userId, password: userPw })
        });
        const data = await res.json();
        alert(data.message || (res.ok ? '회원가입 성공!' : '회원가입 실패'));
      } catch (err) {
        alert('서버 연결 실패');
      }
    });
  }

  // 로그인 폼 제출(Submit)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('loginId').value;
      const userPw = document.getElementById('loginPw').value;

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userId, password: userPw })
        });
        const data = await res.json();
        alert(data.message || (res.ok ? '로그인 성공!' : '로그인 실패'));
      } catch (err) {
        alert('서버 연결 실패');
      }
    });
  }
});
