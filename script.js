// ==========================================
// 0. Supabase 클라이언트 초기화 (오류 방지)
// ==========================================
const SUPABASE_URL = 'https://your-supabase-url.supabase.co'; // 본인 Supabase URL 입력
const SUPABASE_ANON_KEY = 'your-anon-key';                   // 본인 Supabase Anon Key 입력

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// 1. 화면 전환 및 모달 제어
// ==========================================

function showView(viewId) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => view.style.display = 'none');

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.style.display = 'block';
}
window.showView = showView;

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

// X 버튼을 눌러야만 모달이 닫히도록 설정
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
window.openModal = openModal;
window.closeModal = closeModal;

// 비밀번호 보이기 / 숨기기 (👁️) 토글
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🔒';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}
window.togglePassword = togglePassword;

// 바깥 배경 클릭시 꺼지는 기능은 삭제했습니다 (X버튼으로만 닫힘)

// ==========================================
// 2. DOM 로드 후 처리
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

  // 로그인 처리
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          alert('로그인 실패: ' + error.message);
        } else {
          alert('로그인 성공!');
          closeModal('loginModal');
          window.location.reload();
        }
      } else {
        alert('Supabase 키 설정이 필요합니다.');
      }
    });
  }

  // 회원가입 처리
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const nickname = document.getElementById('signupNickname').value;
      const age = document.getElementById('signupAge').value;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { nickname, age: age ? parseInt(age, 10) : null }
          }
        });

        if (error) {
          alert('회원가입 실패: ' + error.message);
        } else {
          alert('회원가입이 완료되었습니다!');
          closeModal('signupModal');
        }
      } else {
        alert('Supabase 키 설정이 필요합니다.');
      }
    });
  }

  showView('homeView');
});

// 1. 모달끼리 자연스럽게 전환하는 공용 함수
function switchModal(fromId, toId, e) {
  if (e) e.preventDefault();
  closeModal(fromId);
  openModal(toId);
}
window.switchModal = switchModal;

// 2. 이메일 일부 가리기(마스킹) 도우미 함수 (예: test1234@gmail.com -> tes*****@gmail.com)
function maskEmail(email) {
  const [id, domain] = email.split('@');
  if (id.length <= 2) return id[0] + '*@' + domain;
  const visible = id.slice(0, 3);
  const masked = '*'.repeat(Math.max(id.length - 3, 2));
  return `${visible}${masked}@${domain}`;
}

// ==========================================
// DOMContentLoaded 안쪽에 아래 내용 적용/추가
// ==========================================

  // [수정] 회원가입 처리 시 profiles 테이블에도 닉네임과 이메일 동시 저장
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const nickname = document.getElementById('signupNickname').value;
      const age = document.getElementById('signupAge')?.value;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { nickname, age: age ? parseInt(age, 10) : null }
          }
        });

        if (error) {
          alert('회원가입 실패: ' + error.message);
        } else {
          // profiles 테이블에 닉네임과 이메일 저장
          await supabaseClient.from('profiles').insert([{ nickname, email }]);
          alert('회원가입이 완료되었습니다!');
          closeModal('signupModal');
        }
      }
    });
  }

  // [신규 추가] 닉네임으로 이메일 찾기 폼 제출 처리
  const findEmailForm = document.getElementById('findEmailForm');
  if (findEmailForm) {
    findEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nicknameInput = document.getElementById('findNickname').value.trim();
      const resultBox = document.getElementById('foundEmailResult');

      if (!supabaseClient) return;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('nickname', nicknameInput);

      resultBox.style.display = 'block';

      if (error || !data || data.length === 0) {
        resultBox.style.color = '#ef4444';
        resultBox.textContent = '일치하는 닉네임의 계정을 찾을 수 없습니다.';
      } else {
        resultBox.style.color = '#1e293b';
        // 동일한 닉네임이 여러 개일 경우 모두 표시
        const maskedList = data.map(row => maskEmail(row.email)).join(', ');
        resultBox.innerHTML = `가입된 이메일: <br><span style="color:#3b82f6; font-size:16px;">${maskedList}</span>`;
      }
    });
  }
