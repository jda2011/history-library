window.customVideoData = JSON.parse(localStorage.getItem('custom_video_data')) || [
  { id: 1, era: 'ancient', title: '[고대] 단군왕검과 고조선', desc: '직접 제작한 고대사 영상입니다.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

window.customQuizData = JSON.parse(localStorage.getItem('custom_quiz_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
  const adminAddVideoForm = document.getElementById('adminAddVideoForm');
  
  if (adminAddVideoForm) {
    adminAddVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('adminVideoSubmitBtn');
      const progressText = document.getElementById('uploadProgressText');
      const fileInput = document.getElementById('adminVideoFileInput');
      const file = fileInput.files[0];

      if (!file) {
        alert('업로드할 영상 파일을 선택해 주세요.');
        return;
      }

      try {
        // 버튼 비활성화 및 안내 문구
        submitBtn.disabled = true;
        progressText.style.display = 'block';

        // 파일명 중복 방지를 위한 고유 파일명 생성
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `uploaded/${fileName}`;

        // Supabase Storage에 파일 업로드
        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('videos')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error('Storage 업로드 실패: ' + uploadError.message);
        }

        // 업로드된 파일의 Public URL 가져오기
        const { data: urlData } = supabaseClient
          .storage
          .from('videos')
          .getPublicUrl(filePath);

        const uploadedVideoUrl = urlData.publicUrl;

        // 영상 데이터 객체 생성
        const newVideo = {
          id: Date.now(),
          era: document.getElementById('adminVideoEra').value,
          title: document.getElementById('adminVideoTitle').value.trim(),
          videoUrl: uploadedVideoUrl,
          desc: document.getElementById('adminVideoDesc').value.trim()
        };

        // 데이터 저장
        window.customVideoData.push(newVideo);
        localStorage.setItem('custom_video_data', JSON.stringify(window.customVideoData));

        alert('영상 파일이 성공적으로 업로드 및 게시되었습니다!');
        adminAddVideoForm.reset();

        // 목록 리프레시
        if (typeof window.renderVideos === 'function') window.renderVideos();
        window.renderAdminManageList();
        window.populateQuizVideoSelect();

      } catch (err) {
        alert('오류 발생: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        progressText.style.display = 'none';
      }
    });
  }

  // 퀴즈 게시
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

// 관리 목록 렌더링
window.renderAdminManageList = function() {
  const container = document.getElementById('adminManageList');
  if (!container) return;

  let html = '<h4 style="margin-bottom:8px;">📂 게시된 직접 제작 영상 목록</h4>';
  if (window.customVideoData.length === 0) {
    html += '<p style="color:#888;">등록된 영상이 없습니다.</p>';
  } else {
    window.customVideoData.forEach(v => {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:#f9f9f9; border-radius:6px; border:1px solid #ddd;">
          <span><b>[${v.era}] ${v.title}</b></span>
          <button onclick="window.deleteVideo(${v.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">영상 삭제</button>
        </div>
      `;
    });
  }

  html += '<h4 style="margin-top:20px; margin-bottom:8px;">❓ 게시된 퀴즈 목록</h4>';
  if (window.customQuizData.length === 0) {
    html += '<p style="color:#888;">등록된 퀴즈가 없습니다.</p>';
  } else {
    window.customQuizData.forEach(q => {
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:8px; background:#f9f9f9; border-radius:6px; border:1px solid #ddd;">
          <span><b>Q: ${q.question}</b> (정답: ${q.answer}번)</span>
          <button onclick="window.deleteQuiz(${q.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">퀴즈 삭제</button>
        </div>
      `;
    });
  }

  container.innerHTML = html;
};

window.deleteVideo = function(videoId) {
  if (confirm('해당 영상을 삭제하시겠습니까?')) {
    window.customVideoData = window.customVideoData.filter(v => v.id !== videoId);
    window.customQuizData = window.customQuizData.filter(q => q.videoId !== videoId);
    localStorage.setItem('custom_video_data', JSON.stringify(window.customVideoData));
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    if (typeof window.renderVideos === 'function') window.renderVideos();
    window.renderAdminManageList();
    window.populateQuizVideoSelect();
  }
};

window.deleteQuiz = function(quizId) {
  if (confirm('해당 퀴즈를 삭제하시겠습니까?')) {
    window.customQuizData = window.customQuizData.filter(q => q.id !== quizId);
    localStorage.setItem('custom_quiz_data', JSON.stringify(window.customQuizData));
    window.renderAdminManageList();
  }
};

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
