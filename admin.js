// admin.js - 관리자 기능 관련 JS

document.addEventListener('DOMContentLoaded', () => {
  const adminSection = document.getElementById('adminSection');
  const navAdminBtn = document.getElementById('navAdminBtn');
  
  const adminAddVideoForm = document.getElementById('adminAddVideoForm');
  const adminVideoEra = document.getElementById('adminVideoEra');
  const adminVideoTitle = document.getElementById('adminVideoTitle');
  const adminVideoFileInput = document.getElementById('adminVideoFileInput');
  const adminVideoDesc = document.getElementById('adminVideoDesc');
  const uploadProgressText = document.getElementById('uploadProgressText');
  const adminVideoSubmitBtn = document.getElementById('adminVideoSubmitBtn');

  const adminAddQuizForm = document.getElementById('adminAddQuizForm');
  const adminQuizVideoSelect = document.getElementById('adminQuizVideoSelect');
  const adminQuizQuestion = document.getElementById('adminQuizQuestion');
  const adminQuizOpt1 = document.getElementById('adminQuizOpt1');
  const adminQuizOpt2 = document.getElementById('adminQuizOpt2');
  const adminQuizOpt3 = document.getElementById('adminQuizOpt3');
  const adminQuizOpt4 = document.getElementById('adminQuizOpt4');
  const adminQuizAnswer = document.getElementById('adminQuizAnswer');

  const adminManageList = document.getElementById('adminManageList');

  // 관리자 방 이동 버튼 클릭 시
  if (navAdminBtn) {
    navAdminBtn.addEventListener('click', () => {
      // 모든 섹션 숨기기 후 관리자 섹션만 표시
      document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
      if (adminSection) adminSection.style.display = 'block';
      
      // 관리자 화면용 데이터 로드
      loadAdminVideoOptions();
      loadAdminManageList();
    });
  }

  // 1. 제작 영상 게시 및 스토리지 업로드
  if (adminAddVideoForm) {
    adminAddVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const file = adminVideoFileInput.files[0];
      if (!file) {
        alert('업로드할 영상 파일을 선택해주세요.');
        return;
      }

      try {
        if (uploadProgressText) uploadProgressText.style.display = 'block';
        if (adminVideoSubmitBtn) adminVideoSubmitBtn.disabled = true;

        // Supabase Storage에 영상 파일 업로드
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabaseClient
          .storage
          .from('history_videos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 업로드된 파일의 Public URL 가져오기
        const { data: urlData } = supabaseClient
          .storage
          .from('history_videos')
          .getPublicUrl(filePath);

        const videoUrl = urlData.publicUrl;

        // Database (videos 테이블)에 영상 정보 저장
        const { error: dbError } = await supabaseClient
          .from('videos')
          .insert([
            {
              era: adminVideoEra.value,
              title: adminVideoTitle.value,
              description: adminVideoDesc.value,
              video_url: videoUrl,
              created_at: new Date().toISOString()
            }
          ]);

        if (dbError) throw dbError;

        alert('영상 게시 및 업로드가 완료되었습니다!');
        adminAddVideoForm.reset();
        loadAdminVideoOptions();
        loadAdminManageList();
        if (typeof loadVideos === 'function') loadVideos(); // 메인 영상 목록 갱신

      } catch (err) {
        console.error('영상 업로드 에러:', err);
        alert('영상 업로드 중 오류가 발생했습니다: ' + (err.message || err));
      } finally {
        if (uploadProgressText) uploadProgressText.style.display = 'none';
        if (adminVideoSubmitBtn) adminVideoSubmitBtn.disabled = false;
      }
    });
  }

  // 2. 퀴즈 셀렉트박스에 영상 목록 불러오기
  async function loadAdminVideoOptions() {
    if (!adminQuizVideoSelect) return;
    adminQuizVideoSelect.innerHTML = '<option value="">영상을 선택하세요</option>';

    try {
      const { data: videos, error } = await supabaseClient
        .from('videos')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;

      videos.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.title;
        adminQuizVideoSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('퀴즈용 영상 목록 로드 에러:', err);
    }
  }

  // 3. 문제(퀴즈) 등록
  if (adminAddQuizForm) {
    adminAddQuizForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const videoId = adminQuizVideoSelect.value;
      if (!videoId) {
        alert('연결할 영상을 선택해주세요.');
        return;
      }

      try {
        const { error } = await supabaseClient
          .from('quizzes')
          .insert([
            {
              video_id: videoId,
              question: adminQuizQuestion.value,
              option1: adminQuizOpt1.value,
              option2: adminQuizOpt2.value,
              option3: adminQuizOpt3.value,
              option4: adminQuizOpt4.value,
              answer: parseInt(adminQuizAnswer.value, 10)
            }
          ]);

        if (error) throw error;

        alert('문제 게시가 완료되었습니다!');
        adminAddQuizForm.reset();
      } catch (err) {
        console.error('퀴즈 등록 에러:', err);
        alert('문제 등록 중 오류가 발생했습니다.');
      }
    });
  }

  // 4. 등록된 콘텐츠 관리 및 삭제 목록
  async function loadAdminManageList() {
    if (!adminManageList) return;
    adminManageList.innerHTML = '<p style="color:#666;">콘텐츠 목록을 불러오는 중...</p>';

    try {
      const { data: videos, error } = await supabaseClient
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!videos || videos.length === 0) {
        adminManageList.innerHTML = '<p style="color:#888;">등록된 영상이 없습니다.</p>';
        return;
      }

      adminManageList.innerHTML = '';
      videos.forEach(v => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee; background:#fff; margin-bottom:6px; border-radius:6px;';
        item.innerHTML = `
          <div>
            <strong>[${v.era}] ${v.title}</strong>
            <p style="font-size:12px; color:#666; margin-top:2px;">${v.description}</p>
          </div>
          <button class="btn-danger" style="padding:6px 12px; font-size:12px;" onclick="deleteVideo('${v.id}')">삭제</button>
        `;
        adminManageList.appendChild(item);
      });
    } catch (err) {
      console.error('관리 데이터 로드 에러:', err);
      adminManageList.innerHTML = '<p style="color:red;">목록을 불러오지 못했습니다.</p>';
    }
  }

  // 영상 삭제 함수 (글로벌 바인딩)
  window.deleteVideo = async function(videoId) {
    if (!confirm('이 영상을 정말 삭제하시겠습니까? 관련 퀴즈도 함께 삭제됩니다.')) return;

    try {
      const { error } = await supabaseClient
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      alert('삭제되었습니다.');
      loadAdminVideoOptions();
      loadAdminManageList();
      if (typeof loadVideos === 'function') loadVideos();
    } catch (err) {
      console.error('삭제 에러:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
});
