const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  mainBannerTitle: String,       // 메인 화면 제목
  mainBannerDescription: String, // 메인 화면 설명
  heroVideoUrl: String,          // 메인 대표 영상 URL
  noticeText: String,            // 공지사항 텍스트
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
