// ==========================================
// 0. Supabase 클라이언트 초기화
// ==========================================
const SUPABASE_URL = 'https://fmjbtdmafpxsnymhtxkp.supabase.co'; // 본인 URL 
const SUPABASE_ANON_KEY = 'sb_publishable_O-u3pUx9ni2z6dQup2ZcxQ_G6m68uAc'; // 본인 Anon Key

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
// 2. Supabase 데이터 로드 및 관리 함수
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
window.loadUserProfile = loadUserProfile;

let allVideosData = [];

function renderVideoCards(videosToRender) {
  const videoListContainer = document.getElementById('videoList');
  if (!videoListContainer) return;

  videoListContainer.innerHTML = '';
  if (!videosToRender || videosToRender.length === 0) {
    videoListContainer.innerHTML = '<p class="empty-msg" style="grid-column: 1/-1; text-align:center;">해당 카테고리에 등록된 영상이 없습니다.</p>';
    return;
  }

  videosToRender.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-thumbnail">
        <video src="${video.url}" controls preload="metadata"></video>
      </div>
      <div class="video-info">
        <span class="category-badge">${video.category || '기타'}</span>
        <h3>${video.title}</h3>
        <p>${video.description || ''}</p>
        <button type="button" class="nav-btn btn-blue" style="margin: 0; width: 100%;" 
          onclick="startVideoStudy('${video.id}', '${video.title}', '${video.category || '기타'}')">
          📖 내 학습방에 담기
        </button>
      </div>
    `;
    videoListContainer.appendChild(card);
  });
}

function filterVideos(selectedCategory, btnElement) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  if (selectedCategory === '전체') {
    renderVideoCards(allVideosData);
  } else {
    const filtered = allVideosData.filter(video => video.category === selectedCategory);
    renderVideoCards(filtered);
  }
}
window.filterVideos = filterVideos;

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

  allVideosData = videos || [];
  renderVideoCards(allVideosData);

  const quizSelect = document.getElementById('quizVideoSelect');
  if (quizSelect) {
    quizSelect.innerHTML = '<option value="">영상을 선택하세요</option>';
    allVideosData.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `[${v.category}] ${v.title}`;
      quizSelect.appendChild(opt);
    });

    quizSelect.onchange = (e) => {
      loadAdminQuizzes(e.target.value);
    };
  }

  const adminList = document.getElementById('adminVideoList');
  if (adminList) {
    adminList.innerHTML = '';
    if (allVideosData.length === 0) {
      adminList.innerHTML = '<p class="empty-msg">게시된 강의가 없습니다.</p>';
    } else {
      allVideosData.forEach(v => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9;';
        item.innerHTML = `
          <div>
            <span class="category-badge" style="margin-bottom:4px;">${v.category || '기타'}</span>
            <div style="font-weight:600; font-size:14px;">${v.title}</div>
          </div>
          <button type="button" onclick="deleteVideo('${v.id}')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px;">삭제</button>
        `;
        adminList.appendChild(item);
      });
    }
  }
}
window.fetchVideos = fetchVideos;

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

async function loadMyRoomData() {
  if (!supabaseClient || !supabaseClient.auth) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data: profileData } = await supabaseClient
    .from('profiles')
    .select('points')
    .eq('email', user.email)
    .single();

  const currentPoints = profileData?.points || 0;
  const pointsElem = document.getElementById('myRoomPoints');
  if (pointsElem) pointsElem.textContent = currentPoints.toLocaleString();

  const { data: progressList } = await supabaseClient
    .from('user_progress')
    .select('*')
    .eq('user_email', user.email)
    .order('updated_at', { ascending: false });

  const container = document.getElementById('myProgressList');
  if (!container) return;

  if (!progressList || progressList.length === 0) {
    container.innerHTML = '<p class="empty-msg">아직 학습 중인 영상이 없습니다. 홈에서 영상을 시청해 보세요!</p>';
    return;
  }

  const completedCount = progressList.filter(item => item.is_completed).length;
  const inProgressCount = progressList.length - completedCount;
  const totalRate = Math.round((completedCount / progressList.length) * 100);

  const statInProgress = document.getElementById('statInProgress');
  const statCompleted = document.getElementById('statCompleted');
  const statTotalRate = document.getElementById('statTotalRate');

  if (statInProgress) statInProgress.textContent = `${inProgressCount}개`;
  if (statCompleted) statCompleted.textContent = `${completedCount}개`;
  if (statTotalRate) statTotalRate.textContent = `${totalRate}%`;

  container.innerHTML = '';
  progressList.forEach(item => {
    const isDone = item.is_completed;
    const card = document.createElement('div');
    card.className = 'progress-item-card';
    card.innerHTML = `
      <div class="progress-item-top">
        <div>
          <span class="category-badge">${item.category || '역사'}</span>
          <strong style="margin-left:8px; font-size:16px;">${item.video_title}</strong>
        </div>
        <span class="status-badge ${isDone ? 'done' : 'ing'}">
          ${isDone ? '✅ 학습 완료' : '▶️ 학습 중'}
        </span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill ${isDone ? 'done' : ''}" style="width: ${item.progress}%;"></div>
      </div>
      <div class="progress-item-bottom">
        <span>진도율: <strong>${item.progress}%</strong></span>
        ${!isDone 
          ? `<button type="button" class="btn-complete-study" onclick="completeVideoStudy('${item.id}')">학습 완료하기 (+50P)</button>` 
          : `<span>포인트 지급 완료</span>`
        }
      </div>
    `;
    container.appendChild(card);
  });
}
window.loadMyRoomData = loadMyRoomData;

async function startVideoStudy(videoId, videoTitle, category) {
  if (!supabaseClient) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert('로그인 후 학습 기록을 남길 수 있습니다!');
    openModal('loginModal');
    return;
  }

  const { data: existing } = await supabaseClient
    .from('user_progress')
    .select('*')
    .eq('user_email', user.email)
    .eq('video_id', videoId);

  if (!existing || existing.length === 0) {
    await supabaseClient.from('user_progress').insert([{
      user_email: user.email,
      video_id: videoId,
      video_title: videoTitle,
      category: category,
      progress: 50,
      is_completed: false
    }]);
    alert(`'${videoTitle}' 학습이 시작되었습니다! 내 학습방에서 진도를 확인할 수 있어요.`);
  } else {
    alert('이미 내 학습방에 등록된 영상입니다!');
  }
  loadMyRoomData();
}
window.startVideoStudy = startVideoStudy;

async function completeVideoStudy(progressId) {
  if (!supabaseClient) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient
    .from('user_progress')
    .update({ progress: 100, is_completed: true })
    .eq('id', progressId);

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('points')
    .eq('email', user.email)
    .single();

  const newPoints = (profile?.points || 0) + 50;
  await supabaseClient
    .from('profiles')
    .update({ points: newPoints })
    .eq('email', user.email);

  alert('🎉 학습을 완료하여 50 포인트가 적립되었습니다!');
  loadMyRoomData();
}
window.completeVideoStudy = completeVideoStudy;

async function loadAdminQuizzes(videoId) {
  const quizListContainer = document.getElementById('adminQuizList');
  if (!quizListContainer) return;

  if (!videoId) {
    quizListContainer.innerHTML = '<p class="empty-msg">영상을 먼저 선택해 주세요.</p>';
    return;
  }

  const { data: quizzes, error } = await supabaseClient
    .from('quizzes')
    .select('*')
    .eq('video_id', videoId);

  if (error || !quizzes || quizzes.length === 0) {
    quizListContainer.innerHTML = '<p class="empty-msg">등록된 퀴즈가 없습니다.</p>';
    return;
  }

  quizListContainer.innerHTML = '';
  quizzes.forEach((q, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;';
    item.innerHTML = `
      <div>
        <strong>Q${index + 1}. ${q.question}</strong>
        <div style="color: #64748b; font-size: 12px; margin-top: 2px;">정답: ${q.answer}번</div>
      </div>
      <button type="button" onclick="deleteQuiz('${q.id}', '${videoId}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">퀴즈 삭제</button>
    `;
    quizListContainer.appendChild(item);
  });
}
window.loadAdminQuizzes = loadAdminQuizzes;

async function deleteQuiz(quizId, videoId) {
  if (!confirm('정말 이 퀴즈를 삭제하시겠습니까?')) return;

  const { error } = await supabaseClient.from('quizzes').delete().eq('id', quizId);
  if (error) {
    alert('퀴즈 삭제 실패: ' + error.message);
  } else {
    alert('퀴즈가 삭제되었습니다.');
    loadAdminQuizzes(videoId);
  }
}
window.deleteQuiz = deleteQuiz;

// ==========================================
// 3. 메인 이벤트 리스너 (DOM 로드 후 실행)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  fetchVideos();
  loadMyRoomData();
  showView('homeView');

  // 로그아웃 처리
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

  // 회원가입 제출
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const nickname = document.getElementById('signupNickname').value;
      const age = document.getElementById('signupAge')?.value;

      if (!supabaseClient) return;

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

  // 로그인 제출
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (!supabaseClient) return;

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

  // 이메일 찾기 제출
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

      if (resultBox) {
        resultBox.style.display = 'block';

        if (error || !data || data.length === 0) {
          resultBox.style.color = '#ef4444';
          resultBox.textContent = '일치하는 닉네임의 계정을 찾을 수 없습니다.';
        } else {
          resultBox.style.color = '#1e293b';
          const maskedList = data.map(row => maskEmail(row.email)).join(', ');
          resultBox.innerHTML = `가입된 이메일: <br><span style="color:#3b82f6; font-size:16px;">${maskedList}</span>`;
        }
      }
    });
  }

  // 비밀번호 재설정 메일 발송
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

  // 비밀번호 변경 링크 복귀 감지
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

  // 관리자: 영상 업로드
  const addVideoForm = document.getElementById('addVideoForm');
  if (addVideoForm) {
    addVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('videoCategory').value;
      const title = document.getElementById('videoTitle').value;
      const fileInput = document.getElementById('videoFile');
      const description = document.getElementById('videoDesc').value;
      const uploadBtn = document.getElementById('uploadVideoBtn');

      const file = fileInput.files[0];
      if (!file) return alert('업로드할 영상 파일을 선택해 주세요!');
      if (!supabaseClient) return;

      uploadBtn.disabled = true;
      uploadBtn.textContent = '영상 업로드 중... 잠시만 기다려 주세요 ⏳';

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
          .from('history-videos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage
          .from('history-videos')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabaseClient.from('videos').insert([{
          category,
          title,
          url: urlData.publicUrl,
          description
        }]);

        if (dbError) throw dbError;

        alert('🎉 직접 제작한 강의 영상이 성공적으로 게시되었습니다!');
        addVideoForm.reset();
        fetchVideos();
      } catch (err) {
        alert('업로드 실패: ' + err.message);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '영상 업로드 및 게시';
      }
    });
  }

  // 관리자: 퀴즈 등록
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
        alert('퀴즈 등록 실패: ' + error.message);
      } else {
        alert('퀴즈가 성공적으로 등록되었습니다!');
        const selectedVideoId = video_id;
        addQuizForm.reset();
        document.getElementById('quizVideoSelect').value = selectedVideoId;
        loadAdminQuizzes(selectedVideoId);
      }
    });
  }
});
