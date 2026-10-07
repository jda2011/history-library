// Supabase 설정
let SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';

SUPABASE_URL = SUPABASE_URL.replace(/\/+$\vert{}\/auth\/v1.*$/g, '');
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navRegisterBtn = document.getElementById('navRegisterBtn');
  const navMyRoomBtn = document.getElementById('navMyRoomBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  
  const homeSection = document.getElementById('homeSection');
  const myRoomSection = document.getElementById('myRoomSection');
  const registerSection = document.getElementById('registerSection');
  const loginSection = document.getElementById('loginSection');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const togglePwBtn = document.getElementById('togglePwBtn');
  const regPwInput = document.getElementById('regPw');

  // 현재 로그인한 사용자 정보 저장용
  let currentUser = null;

  // 섹션 전환 함수
  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (myRoomSection) myRoomSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
  };

  // 로그인 상태 업데이트 (헤더 버튼 전환)
  function updateAuthState(user) {
    currentUser = user;
    if (user) {
      const username = user.user_metadata?.username || user.email.split('@')[0];
      
      guestNav.style.display = 'none';
      userNav.style.display = 'flex';
      
      document.getElementById('userNicknameDisplay').textContent = username;
      document.getElementById('myRoomUsername').textContent = username;
      document.getElementById('myEmail').textContent = user.email;
      document.getElementById('myNickname').textContent = username;
      document.getElementById('welcomeMsg').textContent = `${username}님, 환영합니다! 동영상을 선택하여 시청해보세요.`;
    } else {
      guestNav.style.display = 'flex';
      userNav.style.display = 'none';
      document.getElementById('welcomeMsg').textContent = '로그인 후 다양한 역사 동영상을 시청해보세요!';
    }
  }

  // 초기 로그인 상태 점검
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateAuthState(session.user);
      } else {
        updateAuthState(null);
      }
    });
  }

  // 네비게이션 버튼 이벤트
  if (navHomeBtn) navHomeBtn.addEventListener('click', () => window.showSection('homeSection'));
  if (navLoginBtn) navLoginBtn.addEventListener('click', () => window.showSection('loginSection'));
  if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => window.showSection('registerSection'));
  if (navMyRoomBtn) navMyRoomBtn.addEventListener('click', () => window.showSection('myRoomSection'));

  // 로그아웃 이벤트
  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', async () => {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
        updateAuthState(null);
        alert('로그아웃 되었습니다.');
        window.showSection('homeSection');
      }
    });
  }

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

  // 아이디(닉네임) 중복 검사 함수
  async function checkUsernameDuplicate(username) {
    if (!supabaseClient) return false;
    // profiles 테이블에서 username 검색
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('username', username);

    if (error) {
      // profiles 테이블이 별도로 없는 경우 false 처리
      return false;
    }
    return data && data.length > 0;
  }

  // 회원가입 제출
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
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

      // 2. 아이디 중복 확인
      const isDuplicate = await checkUsernameDuplicate(username);
      if (isDuplicate) {
        alert('누군가 사용중입니다');
        return;
      }

      // 3. 회원가입 실행
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            age_group: ageGroup
          }
        }
      });

      if (error) {
        alert('회원가입 실패: ' + error.message);
      } else {
        // 프로필 테이블 저장을 시도 (profiles 테이블이 생성되어 있을 경우)
        if (data.user) {
          await supabaseClient.from('profiles').insert([
            { id: data.user.id, username: username, age_group: ageGroup }
          ]).catch(() => {});
        }
        alert('회원가입 성공! 이제 로그인해 주세요.');
        window.showSection('loginSection');
      }
    });
  }

  // 로그인 제출
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
        alert('로그인 실패: ' + error.message + '\n아이디(이메일) 및 비밀번호를 다시 확인해 주세요.');
      } else {
        updateAuthState(data.user);
        alert(`${data.user.user_metadata?.username || '사용자'}님 환영합니다!`);
        window.showSection('homeSection');
      }
    });
  }
});
