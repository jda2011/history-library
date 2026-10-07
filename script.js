// Supabase 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co'; // 본인의 Project URL
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

// URL 끝부분 정리
SUPABASE_URL = SUPABASE_URL.replace(/\/+$\vert{}\/auth\/v1.*$/g, '');

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  
  const homeSection = document.getElementById('homeSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const togglePwBtn = document.getElementById('togglePwBtn');
  const regPwInput = document.getElementById('regPw');

  // 섹션 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  };

  // 네비게이션 버튼 이벤트
  if (navHomeBtn) navHomeBtn.addEventListener('click', () => window.showSection('homeSection'));
  if (navLoginBtn) navLoginBtn.addEventListener('click', () => window.showSection('loginSection'));
  if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => window.showSection('registerSection'));

  // 비밀번호 표시 토글
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

  // 회원가입 핸들러
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge').value;

      if (password.length < 6) {
        alert('비밀번호는 최소 6자리 이상이어야 합니다.');
        return;
      }

      if (!supabaseClient) {
        alert('Supabase 키 설정을 확인해 주세요.');
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
        alert('회원가입 성공! 이제 로그인해 주세요.');
        window.showSection('loginSection');
      }
    });
  }

  // 로그인 핸들러
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPw').value;

      if (!supabaseClient) {
        alert('Supabase 키 설정을 확인해 주세요.');
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        alert('로그인 실패: ' + error.message + '\n(회원가입이 정상적으로 완료되었는지, 비밀번호가 맞는지 확인해 주세요.)');
      } else {
        alert(`${data.user.email}님 환영합니다!`);
        window.showSection('homeSection');
      }
    });
  }
});
