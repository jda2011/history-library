// 1. Supabase 클라이언트 초기화 (본인의 URL과 ANON_KEY로 수정하세요)
const SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  // 버튼 클릭 및 화면 전환 이벤트...
});

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

  window.showSection = function(sectionId) {
    if (homeSection) homeSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
  };

  if (navLoginBtn) navLoginBtn.addEventListener('click', () => window.showSection('loginSection'));
  if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => window.showSection('registerSection'));

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

  // 2. Supabase 회원가입
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPw').value;
      const ageGroup = document.getElementById('regAge').value;

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { age_group: ageGroup } // 추가 사용자 정보 저장
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

  // 3. Supabase 로그인
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPw').value;

      const { data, error } = await supabase.auth.signInWithPassword({
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

// 회원가입 요청 핸들러 부분
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPw').value;
  const ageGroup = document.getElementById('regAge').value;

  // 1. Supabase Auth 가입
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert('회원가입 실패: ' + error.message);
    return;
  }

  // 2. profiles 테이블에 연령대 및 초기 포인트 데이터 삽입
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id: data.user.id, age_group: ageGroup, points: 0 }
      ]);

    if (profileError) {
      console.error('프로필 저장 실패:', profileError.message);
    }
  }

  alert('회원가입이 완료되었습니다!');
  window.showSection('loginSection');
});

// 동영상 목록 데이터 (예시)
const videos = [
  { id: 'video1', title: '삼국시대 핵심 요약', youtubeId: 'dQw4w9WgXcQ', points: 10 },
  { id: 'video2', title: '조선 왕조 500년 역사', youtubeId: 'dQw4w9WgXcQ', points: 15 }
];

// 로그인 성공 시 동영상 라이브러리 표시 및 사용자 프로필 조회
async function loadUserProfile(user) {
  document.getElementById('userEmailTag').textContent = user.email;
  
  // DB에서 포인트 가져오기
  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single();

  if (data) {
    document.getElementById('userPoints').textContent = data.points;
  }
}

// 로그아웃 기능
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    alert('로그아웃 되었습니다.');
    window.showSection('loginSection');
  });
}
