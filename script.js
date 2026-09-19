document.addEventListener('DOMContentLoaded', () => {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  function showSection(sectionToShow) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    if (sectionToShow) sectionToShow.style.display = 'block';
  }

  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => showSection(loginSection));
  }

  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', () => showSection(registerSection));
  }

  // 회원가입
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
        if (res.ok) {
          alert('회원가입이 완료되었습니다!');
          showSection(loginSection);
        } else {
          alert(data.message || '회원가입 실패');
        }
      } catch (err) {
        alert('백엔드 API 서버 응답 없음 (주소/배포 확인 필요)');
      }
    });
  }
});
