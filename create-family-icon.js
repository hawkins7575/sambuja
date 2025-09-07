const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createFamilyIcon() {
  // 512x512 캔버스 생성
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // 원형 배경 그리기
  const centerX = 256;
  const centerY = 256;
  const radius = 240;

  // 배경 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  // 원형 테두리
  ctx.strokeStyle = '#4A90E2';
  ctx.lineWidth = 8;
  ctx.stroke();

  // 텍스트 스타일 설정
  ctx.fillStyle = '#2C3E50';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 메인 타이틀
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText('삼부자', centerX, centerY - 60);

  // 서브 타이틀
  ctx.font = '28px Arial, sans-serif';
  ctx.fillStyle = '#5A6C7D';
  ctx.fillText('패밀리', centerX, centerY - 10);

  // 가족 아이콘 그리기 (간단한 도형으로)
  ctx.fillStyle = '#34495E';
  
  // 아빠 (큰 원)
  ctx.beginPath();
  ctx.arc(centerX - 40, centerY + 50, 25, 0, 2 * Math.PI);
  ctx.fill();
  
  // 첫째 (중간 원)
  ctx.beginPath();
  ctx.arc(centerX + 15, centerY + 50, 20, 0, 2 * Math.PI);
  ctx.fill();
  
  // 둘째 (작은 원)
  ctx.beginPath();
  ctx.arc(centerX + 60, centerY + 50, 18, 0, 2 * Math.PI);
  ctx.fill();

  // 하트 모양 추가
  ctx.fillStyle = '#E74C3C';
  const heartX = centerX;
  const heartY = centerY + 120;
  const heartSize = 20;
  
  ctx.beginPath();
  ctx.moveTo(heartX, heartY + heartSize/4);
  ctx.bezierCurveTo(heartX, heartY, heartX - heartSize/2, heartY, heartX - heartSize/2, heartY + heartSize/4);
  ctx.bezierCurveTo(heartX - heartSize/2, heartY + heartSize/2, heartX, heartY + heartSize, heartX, heartY + heartSize);
  ctx.bezierCurveTo(heartX, heartY + heartSize, heartX + heartSize/2, heartY + heartSize/2, heartX + heartSize/2, heartY + heartSize/4);
  ctx.bezierCurveTo(heartX + heartSize/2, heartY, heartX, heartY, heartX, heartY + heartSize/4);
  ctx.fill();

  // PNG로 저장
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('public/family-icon.png', buffer);
  
  console.log('패밀리 아이콘이 생성되었습니다: public/family-icon.png');
}

createFamilyIcon().catch(console.error);