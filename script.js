// Supabase 클라이언트 초기화 (여기서만 단 한 번 선언합니다)
const SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

// window.supabaseClient로 변수명을 변경하여 기존 선언 충돌을 방지합니다.
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  };

  // 상단 네비게이션 버튼 클릭 이벤트
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => window.showSection('loginSection'));
  }
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', () => window.showSection('registerSection'));
  }

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

  // 회원가입
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge').value;

      if (!supabaseClient) {
        alert('Supabase 연결을 확인해주세요.');
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { age_group: ageGroup }
        }
      });

      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        alert('회원가입 성공! 로그인해 주세요.');
        window.showSection('loginSection');
      }
    });
  }

  // 로그인
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPw').value;

      if (!supabaseClient) {
        alert('Supabase 연결을 확인해주세요.');
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        alert('로그인 실패: ' + error.message);
      } else {
        alert(`${data.user.email}님 환영합니다!`);
        window.showSection('homeSection');
      }
    });
  }
});
