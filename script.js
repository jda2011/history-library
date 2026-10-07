// Supabase 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

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

  // --- 회원가입 방식 전환 (이메일 / 전화번호) ---
  const regTypeRadios = document.querySelectorAll('input[name="regType"]');
  const regEmailGroup = document.getElementById('regEmailGroup');
  const regPhoneGroup = document.getElementById('regPhoneGroup');

  regTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'email') {
        regEmailGroup.style.display = 'block';
        regPhoneGroup.style.display = 'none';
        document.getElementById('regEmail').required = true;
        document.getElementById('regPhone').required = false;
      } else {
        regEmailGroup.style.display = 'none';
        regPhoneGroup.style.display = 'block';
        document.getElementById('regEmail').required = false;
        document.getElementById('regPhone').required = true;
      }
    });
  });

  // --- 로그인 방식 전환 (이메일 / 전화번호) ---
  const loginTypeRadios = document.querySelectorAll('input[name="loginType"]');
  const loginEmailGroup = document.getElementById('loginEmailGroup');
  const loginPhoneGroup = document.getElementById('loginPhoneGroup');

  loginTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'email') {
        loginEmailGroup.style.display = 'block';
        loginPhoneGroup.style.display = 'none';
        document.getElementById('loginEmail').required = true;
        document.getElementById('loginPhone').required = false;
      } else {
        loginEmailGroup.style.display = 'none';
        loginPhoneGroup.style.display = 'block';
        document.getElementById('loginEmail').required = false;
        document.getElementById('loginPhone').required = true;
      }
    });
  });

  // --- 전화번호 국가코드 형식 변환 (+82) ---
  function formatPhoneNumber(phone) {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+82' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+82' + cleanPhone;
    }
    return cleanPhone;
  }

  // --- 회원가입 제출 ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const regType = document.querySelector('input[name="regType"]:checked').value;
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge').value;

      // 1. 비밀번호 규칙 검증 (6자 이상 + 특수문자 1개 이상)
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (!specialCharRegex.test(password)) {
        alert('비밀번호에 최소 1개 이상의 특수문자(!@#$%^&* 등)가 포함되어야 합니다.');
        return;
      }

      if (!supabaseClient) {
        alert('Supabase 키 설정을 확인해 주세요.');
        return;
      }

      let signUpParams = {
        password: password,
        options: {
          data: { age_group: ageGroup }
        }
      };

      if (regType === 'email') {
        signUpParams.email = document.getElementById('regEmail').value.trim();
      } else {
        const phone = document.getElementById('regPhone').value.trim();
        signUpParams.phone = formatPhoneNumber(phone);
      }

      const { data, error } = await supabaseClient.auth.signUp(signUpParams);

      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        alert('회원가입 성공! 로그인해 주세요.');
        window.showSection('loginSection');
      }
    });
  }

  // --- 로그인 제출 ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const loginType = document.querySelector('input[name="loginType"]:checked').value;
      const password = document.getElementById('loginPw').value;

      if (!supabaseClient) {
        alert('Supabase 키 설정을 확인해 주세요.');
        return;
      }

      let signInParams = { password: password };

      if (loginType === 'email') {
        signInParams.email = document.getElementById('loginEmail').value.trim();
      } else {
        const phone = document.getElementById('loginPhone').value.trim();
        signInParams.phone = formatPhoneNumber(phone);
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword(signInParams);

      if (error) {
        alert('로그인 실패: ' + error.message);
      } else {
        const userIdentifier = data.user.email || data.user.phone;
        alert(`${userIdentifier}님 환영합니다!`);
        window.showSection('homeSection');
      }
    });
  }
});
