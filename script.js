git add vercel.json
git commit -m "fix: vercel.json syntax error"
git push

document.addEventListener('DOMContentLoaded', () => {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');
  const registerForm = document.getElementById('registerForm');

  // 우측 상단 '회원가입' 버튼 클릭 시 화면 전환
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', () => {
      if (homeSection) homeSection.style.display = 'none';
      if (registerSection) registerSection.style.display = 'block';
    });
  }

  // 우측 상단 '로그인' 버튼 클릭 시
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      alert('로그인 페이지로 이동합니다.');
      // 로그인 섹션 전환 로직 추가 가능
    });
  }

  // 회원가입 폼 제출(Submit) 이벤트 연결
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

// 회원가입 API 통신 처리 함수
async function handleRegister(event) {
  event.preventDefault();

  const userId = document.getElementById('regId').value;
  const userPw = document.getElementById('regPw').value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userId, password: userPw })
    });

    const data = await response.json();

    if (response.ok) {
      alert('회원가입이 완료되었습니다!');
      window.location.reload();
    } else {
      alert(data.message || '회원가입 실패');
    }
  } catch (error) {
    alert('서버 통신 오류가 발생했습니다.');
  }
}
