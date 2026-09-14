const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, '아이디를 입력해 주세요.'], 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, '비밀번호를 입력해 주세요.'] 
  },
  role: { 
    type: String, 
    default: 'user' // 'user' 또는 'admin'
  },
  grade: {
    type: String,
    required: true,
    enum: [
      'UNDER_13',  // 13세 미만
      'ELEMENTARY_1', 'ELEMENTARY_2', 'ELEMENTARY_3', 'ELEMENTARY_4', 'ELEMENTARY_5', 'ELEMENTARY_6',
      'MIDDLE_1', 'MIDDLE_2', 'MIDDLE_3',
      'HIGH_1', 'HIGH_2', 'HIGH_3',
      'OVER_19'    // 19세 이상
    ]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

  <div class="form-group">
      <label for="password">비밀번호</label><br>
      <div class="password-wrapper">
        <input type="password" id="password" placeholder="비밀번호를 입력하세요" required>
        <button type="button" id="toggleBtn" class="toggle-btn">표시</button>
      </div>
    </div>

    <button type="submit">로그인</button>
  </form>

  <script>
    // 1. 화면의 요소들을 가져옵니다.
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggleBtn');

    // 2. 버튼 클릭 이벤트를 등록합니다.
    toggleBtn.addEventListener('click', function() {
      // 현재 type이 password인지 확인
      const isPassword = passwordInput.getAttribute('type') === 'password';

      // type을 반대로 변경 (password -> text / text -> password)
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

      // 버튼의 글자 변경
      toggleBtn.textContent = isPassword ? '숨기기' : '표시';
    });
  </script>

</body>
</html>
