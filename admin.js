// 전역 관리 데이터 로드 및 초기화
window.customVideoData = JSON.parse(localStorage.getItem('custom_video_data')) || [
  { id: 1, era: 'ancient', title: '[고대] 단군왕검과 고조선 성립', desc: '한반도 최초의 국가 고조선의 건국을 알아봅니다.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 2, era: 'medieval', title: '[중세] 고려의 창건과 왕건', desc: '고려를 건국한 태조 왕건의 정책을 공부합니다.', youtubeId: 'dQw4w9WgXcQ' }
];

window.customQuizData = JSON.parse(localStorage.getItem('custom_quiz_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
  // 영상 추가 폼
  const adminAddVideoForm = document.getElementById('adminAddVideoForm');
  if (adminAddVideoForm) {
    adminAddVideoForm.addEventListener('submit', (e) => {
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
      alert('새로운 영상이 성공적으로 게시되었습니다!');
      adminAddVideoForm.reset();
      
      if (typeof window.renderVideos === 'function') window.renderVideos('all');
      window.renderAdminManageList();
      window.populateQuizVideoSelect();
    });
  }

  // 퀴즈 추가 폼
  const adminAddQuizForm = document.getElementById('adminAddQuizForm');
  if (adminAddQuizForm) {
    adminAddQuizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const videoSelect = document.getElementById('adminQuizVideoSelect');
      if (!videoSelect || !videoSelect.value) {
        alert('퀴즈를 연결할 영상을 먼저 선택해 주세요.');
        return;
      }

      const newQuiz = {
        id: Date.now(),
        videoId: Number(videoSelect.value),
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
      alert('새로운 퀴즈가 성공적으로 게시되었습니다!');
      adminAddQuizForm.reset();
      window.renderAdminManageList();
    });
  }
});

// 관리자 목록 렌더링
window.renderAdminManageList = function() {
  const container = document.getElementById('adminManageList');
  if (!container) return;

  let html = '<h3 style="margin-bottom:10px; color:#2c3e50;">📂 등록된 영상 목록</h3>';
  if (window.customVideoData.length === 0) {
    html += '<p style="color:#888;">등록된 영상이 없습니다.</p>';
  } else {
    window.customVideoData.forEach(v => {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; margin-bottom: 8px; background:#f9f9f9; border-radius:6px; border:1px solid #ddd;">
          <span><b>[${v.era}] ${v.title}</b> (YouTube ID: ${v.youtubeId})</span>
          <button onclick="window.deleteVideo(${v.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">영상 삭제</button>
        </div>
      `;
    });
  }

  html += '<h3 style="margin-top:25px; margin-bottom:10px; color:#2c3e50;">❓ 등록된 퀴즈 목록</h3>';
  if (window.customQuizData.length === 0) {
    html += '<p style="color:#888;">등록된 퀴즈가 없습니다.</p>';
  } else {
    window.customQuizData.forEach(q => {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; margin-bottom: 8px; background:#f9f9f9; border-radius:6px; border:1px solid #ddd;">
          <span><b>Q: ${q.question}</b> (정답: ${q.answer}번)</span>
          <button onclick="window.deleteQuiz(${q.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">퀴즈 삭제</button>
        </div>
      `;
    });
  }

  container.innerHTML = html;
};

// 영상 삭제
window.deleteVideo = function(videoId) {
  if (confirm('해당 영상을 삭제하시겠습니까? 연결된 퀴즈도 함께 삭제됩니다.')) {
    window.customVideoData = window.customVideoData.filter(v => v.id !== videoId);
    window.customQuizData = window.customQuizData.filter(q => q.videoId !== videoId);
    localStorage.setItem('custom_video_data', JSON.stringify(window.customVideoData));
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    
    if (typeof window.renderVideos === 'function') window.renderVideos('all');
    window.renderAdminManageList();
    window.populateQuizVideoSelect();
  }
};

// 퀴즈 삭제
window.deleteQuiz = function(quizId) {
  if (confirm('해당 퀴즈를 삭제하시겠습니까?')) {
    window.customQuizData = window.customQuizData.filter(q => q.id !== quizId);
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    window.renderAdminManageList();
  }
};

// 퀴즈 등록 시 영상 셀렉트박스 채우기
window.populateQuizVideoSelect = function() {
  const select = document.getElementById('adminQuizVideoSelect');
  if (!select) return;
  select.innerHTML = '<option value="">영상을 선택하세요</option>';
  window.customVideoData.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.title;
    select.appendChild(opt);
  });
};
