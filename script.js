// ==========================================
// 0. Supabase 클라이언트 초기화
// ==========================================
const SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co/rest/v1/'; // 본인 Supabase URL 입력
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc';                   // 본인 Supabase Anon Key 입력

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// 1. 전역 함수 (화면 전환, 모달 제어, 비밀번호 토글)
// ==========================================

function showView(viewId) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(view => {
    view.style.display = 'none';
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  }
}
window.showView = showView;

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}
window.openModal = openModal;

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
window.closeModal = closeModal;

function switchModal(fromId, toId, e) {
  if (e) e.preventDefault();
  closeModal(fromId);
  openModal(toId);
}
window.switchModal = switchModal;

function switchToResetModal(e) {
  if (e) e.preventDefault();
  closeModal('loginModal');
  openModal('resetPasswordModal');
}
window.switchToResetModal = switchToResetModal;

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

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [id, domain] = email.split('@');
  if (id.length <= 2) return id[0] + '*@' + domain;
  const visible = id.slice(0, 3);
  const masked = '*'.repeat(Math.max(id.length - 3, 2));
  return `${visible}${masked}@${domain}`;
}

// ==========================================
// 2. Supabase 데이터 로드 및 삭제 함수
// ==========================================

async function loadUserProfile() {
  if (!supabaseClient || !supabaseClient.auth) return;

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (user) {
    const nicknameElem = document.getElementById('myRoomNickname');
    const emailElem = document.getElementById('myRoomEmail');
    const userBtnText = document.getElementById('userNavBtnText');

    const userNickname = user.user_metadata?.nickname || user.email.split('@')[0];

    if (nicknameElem) nicknameElem.textContent = userNickname;
    if (emailElem) emailElem.textContent = user.email;
    if (userBtnText) userBtnText.textContent = `${userNickname}님의 방`;

    document.querySelectorAll('.auth-logged-in').forEach(el => el.style.display = 'inline-block');
    document.querySelectorAll('.auth-logged-out').forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('.auth-logged-in').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.auth-logged-out').forEach(el => el.style.display = 'inline-block');
  }
}

async function fetchVideos() {
  if (!supabaseClient) return;

  const { data: videos, error } = await supabaseClient
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('영상 불러오기 실패:', error);
    return;
  }

  const videoListContainer = document.getElementById('videoList');
  if (videoListContainer) {
    videoListContainer.innerHTML = '';
    if (!videos || videos.length === 0) {
      videoListContainer.innerHTML = '<p class="empty-msg">등록된 영상이 없습니다.</p>';
    } else {
      videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
          <div class="video-thumbnail">
            <iframe src="${video.url}" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="video-info">
            <span class="category-badge">${video.category || '기타'}</span>
            <h3>${video.title}</h3>
            <p>${video.description || ''}</p>
          </div>
        `;
        videoListContainer.appendChild(card);
      });
    }
  }

  const quizSelect = document.getElementById('quizVideoSelect');
  if (quizSelect && videos) {
    quizSelect.innerHTML = '<option value="">영상을 선택하세요</option>';
    videos.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.title;
      quizSelect.appendChild(opt);
    });
  }

  const adminList = document.getElementById('adminVideoList');
  if (adminList && videos) {
    adminList.innerHTML = '';
    videos.forEach(v => {
      const item = document.createElement('div');
      item.className = 'admin-video-item';
      item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span>[${v.category || '기타'}] ${v.title}</span>
        <button type="button" onclick="deleteVideo('${v.id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">삭제</button>
      `;
      adminList.appendChild(item);
    });
  }
}

async function deleteVideo(videoId) {
  if (!confirm('정말 이 영상을 삭제하시겠습니까?')) return;

  if (supabaseClient) {
    const { error } = await supabaseClient.from('videos').delete().eq('id', videoId);
    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      alert('영상이 삭제되었습니다.');
      fetchVideos();
    }
  }
}
window.deleteVideo = deleteVideo;

// ==========================================
// 3. 메인 이벤트 리스너 (DOM 로드 후 실행)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  fetchVideos();

  // 로그아웃 버튼 처리
  document.body.addEventListener('click', async (e) => {
    const target = e.target;
    const text = target.textContent ? target.textContent.trim() : '';

    if (text === '로그아웃' || target.classList.contains('btn-logout')) {
      e.preventDefault();
      if (!confirm('정말 로그아웃 하시겠습니까?')) return;

      if (supabaseClient && supabaseClient.auth) {
        await supabaseClient.auth.signOut();
      }
      alert('로그아웃 되었습니다.');
      window.location.reload();
    }
  });

  // 회원가입 제출 (async 필수!)
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const nickname = document.getElementById('signupNickname').value;
      const age = document.getElementById('signupAge')?.value;

      if (!supabaseClient) {
        alert('Supabase 키 설정이 필요합니다.');
        return;
      }

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
        await supabaseClient.from('profiles').insert([{ nickname, email }]);
        alert('회원가입이 완료되었습니다!');
        closeModal('signupModal');
        signupForm.reset();
      }
    });
  }

  // 로그인 제출 (async 필수!)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (!supabaseClient) {
        alert('Supabase 키 설정이 필요합니다.');
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        alert('로그인 실패: ' + error.message);
      } else {
        alert('로그인 성공!');
        closeModal('loginModal');
        window.location.reload();
      }
    });
  }

  // 닉네임으로 이메일 찾기 제출 (async 필수!)
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
        const maskedList = data.map(row => maskEmail(row.email)).join(', ');
        resultBox.innerHTML = `가입된 이메일: <br><span style="color:#3b82f6; font-size:16px;">${maskedList}</span>`;
      }
    });
  }

  // 비밀번호 재설정 메일 발송 제출 (async 필수!)
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;

      if (!supabaseClient) return;

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        alert('메일 발송 실패: ' + error.message);
      } else {
        alert('비밀번호 재설정 링크가 이메일로 발송되었습니다! 메일함을 확인해 주세요.');
        closeModal('resetPasswordModal');
        resetPasswordForm.reset();
      }
    });
  }

  // 비밀번호 변경 링크 복귀 감지 (async 필수!)
  if (supabaseClient && supabaseClient.auth) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        const newPassword = prompt('새로 사용할 비밀번호를 입력해 주세요 (6자 이상):');
        if (newPassword && newPassword.length >= 6) {
          const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
          if (error) {
            alert('비밀번호 변경 실패: ' + error.message);
          } else {
            alert('비밀번호가 성공적으로 변경되었습니다!');
          }
        } else if (newPassword !== null) {
          alert('비밀번호는 6자 이상이어야 합니다.');
        }
      }
    });
  }

  // 관리자: 영상 등록 (async 필수!)
  const addVideoForm = document.getElementById('addVideoForm');
  if (addVideoForm) {
    addVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('videoCategory').value;
      const title = document.getElementById('videoTitle').value;
      const url = document.getElementById('videoUrl').value;
      const description = document.getElementById('videoDesc').value;

      if (!supabaseClient) return;

      const { error } = await supabaseClient.from('videos').insert([{ category, title, url, description }]);
      if (error) {
        alert('영상 게시 실패: ' + error.message);
      } else {
        alert('영상 게시 성공!');
        addVideoForm.reset();
        fetchVideos();
      }
    });
  }

  // 관리자: 퀴즈 등록 (async 필수!)
  const addQuizForm = document.getElementById('addQuizForm');
  if (addQuizForm) {
    addQuizForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const video_id = document.getElementById('quizVideoSelect').value;
      const question = document.getElementById('quizQuestion').value;
      const option1 = document.getElementById('quizOpt1').value;
      const option2 = document.getElementById('quizOpt2').value;
      const option3 = document.getElementById('quizOpt3').value;
      const option4 = document.getElementById('quizOpt4').value;
      const answer = document.getElementById('quizAnswer').value;

      if (!video_id) return alert('연결할 영상을 선택해 주세요.');
      if (!supabaseClient) return;

      const { error } = await supabaseClient.from('quizzes').insert([
        { video_id, question, option1, option2, option3, option4, answer: parseInt(answer, 10) }
      ]);
      if (error) {
        alert('문제 게시 실패: ' + error.message);
      } else {
        alert('문제 게시 성공!');
        addQuizForm.reset();
      }
    });
  }

  showView('homeView');
});
