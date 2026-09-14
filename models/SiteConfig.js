const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  mainBannerTitle: {
    type: String,
    default: '역사 동영상 도서관에 오신 것을 환영합니다'
  },
  mainBannerDescription: {
    type: String,
    default: '원하는 역사 동영상을 찾아보고 퀴즈를 풀어보세요.'
  },
  // 관리자가 조율할 배경 이미지 URL 및 배경색
  backgroundImageUrl: {
    type: String,
    default: '' 
  },
  backgroundColor: {
    type: String,
    default: '#fff8e7' // 지니키즈 느낌의 파스텔 노랑 기본값
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
