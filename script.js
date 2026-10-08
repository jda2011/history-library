// ==========================================
// 1. 전역 함수 (화면 전환, 모달 제어)
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

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
window.openModal = openModal;
window.closeModal = closeModal;

// ==========================================
// 2. Supabase 연동 및 데이터 처리
// ==========================================

async function loadUserProfile() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient.auth) return;

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
  if (typeof supabaseClient === 'undefined') return;

  const { data: videos, error } = await supabaseClient
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('영상 로드 오류:', error);
    return;
  }

  const videoListContainer = document.getElementById('videoList');
  if (videoListContainer) {
    videoListContainer.innerHTML = '';
    if (videos.length === 0) {
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
  if (quizSelect) {
    quizSelect.innerHTML = '<option value="">영상을 선택하세요</option>';
    videos.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.title;
      quizSelect.appendChild(opt);
    });
  }

  const adminList = document.getElementById('adminVideoList');
  if (adminList) {
    adminList.innerHTML = '';
    videos.forEach(v => {
      const item = document.createElement('div');
      item.className = 'admin-video-item';
      item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span>[${v.category || '기타'}] ${v.title}</span>
        <button onclick="deleteVideo('${v.id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">삭제</button>
      `;
      adminList.appendChild(item);
    });
  }
}

async function deleteVideo(videoId) {
  if (!confirm('정말 이 영상을 삭제하시겠습니까?')) return;

  if (typeof supabaseClient !== 'undefined') {
    const { error } = await supabaseClient.from('videos').delete().eq('id', videoId);
    if (error) alert('삭제 실패: ' + error.message);
    else {
      alert('영상이 삭제되었습니다.');
      fetchVideos();
    }
  }
}
window.deleteVideo = deleteVideo;

// ==========================================
// 3. 이벤트 핸들러
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  fetchVideos();

  document.body.addEventListener('click', async (e) => {
    const target = e.target;
    const text = target.textContent ? target.textContent.trim() : '';

    if (text === '로그인' || target.id === 'loginBtn' || target.classList.contains('btn-login')) {
      e.preventDefault();
      openModal('loginModal');
    } else if (text === '회원가입' || target.id === 'signupBtn' || target.classList.contains('btn-signup')) {
      e.preventDefault();
      openModal('signupModal');
    } else if (text.includes('님의 방') || text.includes('내 방') || text.includes('마이페이지')) {
      e.preventDefault();
      showView('myRoomView');
    } else if (text.includes('관리자 방') || text.includes('관리자 센터')) {
      e.preventDefault();
      showView('adminView');
    } else if (text.includes('역사 동영상 도서관') || target.classList.contains('logo')) {
      e.preventDefault();
      showView('homeView');
    } else if (text === '로그아웃') {
      e.preventDefault();
      if (!confirm('정말 로그아웃 하시겠습니까?')) return;
      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        await supabaseClient.auth.signOut();
      }
      alert('로그아웃 되었습니다.');
      window.location.reload();
    } else if (target.classList.contains('close-modal') || target.classList.contains('btn-close')) {
      const modal = target.closest('.modal');
      if (modal) modal.style.display = 'none';
    }
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // 회원가입 제출
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail')?.value;
      const password = document.getElementById('signupPassword')?.value;
      const nickname = document.getElementById('signupNickname')?.value;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { nickname: nickname }
          }
        });

        if (error) alert('회원가입 실패: ' + error.message);
        else {
          alert('회원가입이 완료되었습니다! 로그인해 주세요.');
          closeModal('signupModal');
        }
      }
    });
  }

  // 로그인 제출
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      if (typeof supabaseClient !== 'undefined' && supabaseClient.auth) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert('로그인 실패: ' + error.message);
        else {
          alert('로그인 성공!');
          closeModal('loginModal');
          window.location.reload();
        }
      }
    });
  }

  // 영상 등록
  const addVideoForm = document.getElementById('addVideoForm');
  if (addVideoForm) {
    addVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('videoCategory').value;
      const title = document.getElementById('videoTitle').value;
      const url = document.getElementById('videoUrl').value;
      const description = document.getElementById('videoDesc').value;

      if (typeof supabaseClient !== 'undefined') {
        const { error } = await supabaseClient.from('videos').insert([{ category, title, url, description }]);
        if (error) alert('영상 게시 실패: ' + error.message);
        else {
          alert('영상 게시 성공!');
          addVideoForm.reset();
          fetchVideos();
        }
      }
    });
  }

  // 퀴즈 등록
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

      if (typeof supabaseClient !== 'undefined') {
        const { error } = await supabaseClient.from('quizzes').insert([
          { video_id, question, option1, option2, option3, option4, answer: parseInt(answer, 10) }
        ]);
        if (error) alert('문제 게시 실패: ' + error.message);
        else {
          alert('문제 게시 성공!');
          addQuizForm.reset();
        }
      }
    });
  }

  showView('homeView');
});
