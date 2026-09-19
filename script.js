document.addEventListener('DOMContentLoaded', () => {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const togglePwBtn = document.getElementById('togglePwBtn');
  const regPwInput = document.getElementById('regPw');

  // 화면 전환 함수
  function showSection(section) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    if (section) section.style.display = 'block';
  }

  if (navLoginBtn) navLoginBtn.addEventListener('click', () => showSection(loginSection));
  if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => showSection(registerSection));

  // 비밀번호 보임/숨김 토글
  if (togglePwBtn && regPwInput) {
    togglePwBtn.addEventListener('click', () => {
      if (regPwInput.type === 'password') {
        regPwInput.type = 'text';
        togglePwBtn.textContent = '숨김';
      } else {
        regPwInput.type = 'password';
        togglePwBtn.textContent = '보임';
      }
    });
  }

  // 회원가입 전송
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('regId').value;
      const userPw = document.getElementById('regPw').value;
      const userAge = document.getElementById('regAge').value;

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userId, password: userPw, ageGroup: userAge })
        });
        
        const data = await res.json();
        if (res.ok) {
          alert('회원가입 성공!');
          showSection(loginSection);
        } else {
          alert(data.message || '회원가입 실패');
        }
      } catch (err) {
        alert('서버 연결 실패: Vercel 환경변수(MongoDB URI) 및 API 설정을 확인하세요.');
      }
    });
  }
});
