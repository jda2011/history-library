// LocalStorage 전역 데이터 관리
window.customVideoData = JSON.parse(localStorage.getItem('custom_video_data')) || [
  { id: 1, era: 'ancient', title: '[고대] 단군왕검과 고조선 성립', desc: '한반도 최초의 국가 고조선의 건국과 8조법을 살펴봅니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 2, era: 'medieval', title: '[중세] 고려의 창건과 왕건', desc: '후삼국을 통일하고 고려를 건국한 태조 왕건의 정책을 공부합니다.', youtubeId: 'dQw4w9WgXcQ' }
];

window.customQuizData = JSON.parse(localStorage.getItem('custom_quiz_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
  const navAdminBtn = document.getElementById('navAdminBtn');
  if (navAdminBtn) {
    navAdminBtn.onclick = () => {
      if (typeof window.showSection === 'function') window.showSection('adminSection');
      renderAdminManageList();
      populateQuizVideoSelect();
    };
  }

  // 영상 등록
  const adminAddVideoForm = document.getElementById('adminAddVideoForm');
  if (adminAddVideoForm) {
    adminAddVideoForm.onsubmit = (e) => {
      e.preventDefault();
      const newVideo = {
        id: Date.now(),
        era: document.getElementById('adminVideoEra').value,
        title: document.getElementById('adminVideoTitle').value.trim(),
        youtubeId: document.getElementById('adminVideoYoutubeId').value.trim(),
        desc: document.getElementById('adminVideoDesc').value.trim()
      };

      window.customVideoData.push(newVideo);
      localStorage.setItem('custom_video_data', JSON.stringify(window.customVideoData));
      alert('영상이 등록되었습니다!');
      adminAddVideoForm.reset();
      if (typeof window.renderVideos === 'function') window.renderVideos('all');
      renderAdminManageList();
      populateQuizVideoSelect();
    };
  }

  // 퀴즈 등록
  const adminAddQuizForm = document.getElementById('adminAddQuizForm');
  if (adminAddQuizForm) {
    adminAddQuizForm.onsubmit = (e) => {
      e.preventDefault();
      const newQuiz = {
        id: Date.now(),
        videoId: Number(document.getElementById('adminQuizVideoSelect').value),
        question: document.getElementById('adminQuizQuestion').value.trim(),
        options: [
          document.getElementById('adminQuizOpt1').value.trim(),
          document.getElementById('adminQuizOpt2').value.trim(),
          document.getElementById('adminQuizOpt3').value.trim(),
          document.getElementById('adminQuizOpt4').value.trim()
        ],
        answer: Number(document.getElementById('adminQuizAnswer').value)
      };

      window.customQuizData.push(newQuiz);
      localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
      alert('퀴즈가 등록되었습니다!');
      adminAddQuizForm.reset();
      renderAdminManageList();
    };
  }
});

// 관리자 목록 렌더링
function renderAdminManageList() {
  const container = document.getElementById('adminManageList');
  if (!container) return;

  container.innerHTML = '<h4>[등록된 영상 목록]</h4>';

  if (window.customVideoData.length === 0) {
    container.innerHTML += '<p style="color:#888;">등록된 영상이 없습니다.</p>';
  } else {
    window.customVideoData.forEach(v => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span><b>${v.title}</b> (${v.era})</span>
        <button onclick="deleteVideo(${v.id})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">영상 삭제</button>
      `;
      container.appendChild(item);
    });
  }

  container.innerHTML += '<h4 style="margin-top:20px;">[등록된 퀴즈 목록]</h4>';
  if (window.customQuizData.length === 0) {
    container.innerHTML += '<p style="color:#888;">등록된 퀴즈가 없습니다.</p>';
  } else {
    window.customQuizData.forEach(q => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom: 1px solid #eee;';
      item.innerHTML = `
        <span><b>Q: ${q.question}</b> (정답: ${q.answer}번)</span>
        <button onclick="deleteQuiz(${q.id})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">퀴즈 삭제</button>
      `;
      container.appendChild(item);
    });
  }
}

// 영상 삭제
window.deleteVideo = function(videoId) {
  if (confirm('삭제하시겠습니까?')) {
    window.customVideoData = window.customVideoData.filter(v => v.id !== videoId);
    window.customQuizData = window.customQuizData.filter(q => q.videoId !== videoId);
    localStorage.setItem('custom_video_data', JSON.stringify(window.customVideoData));
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    if (typeof window.renderVideos === 'function') window.renderVideos('all');
    renderAdminManageList();
    populateQuizVideoSelect();
  }
};

// 퀴즈 삭제
window.deleteQuiz = function(quizId) {
  if (confirm('이 퀴즈를 삭제하시겠습니까?')) {
    window.customQuizData = window.customQuizData.filter(q => q.id !== quizId);
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    renderAdminManageList();
  }
};

function populateQuizVideoSelect() {
  const select = document.getElementById('adminQuizVideoSelect');
  if (!select) return;
  select.innerHTML = '';
  window.customVideoData.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.title;
    select.appendChild(opt);
  });
}
