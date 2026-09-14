const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  mainBannerTitle: String,       // 메인 화면 제목
  mainBannerDescription: String, // 메인 화면 설명
  heroVideoUrl: String,          // 메인 대표 영상 URL
  noticeText: String,            // 공지사항 텍스트
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);

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
  heroVideoUrl: {
    type: String,
    default: '' // 관리자가 직접 등록할 메인 대표 영상 URL
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
