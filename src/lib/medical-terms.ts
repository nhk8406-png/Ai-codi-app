export interface DiagnosisTerm {
  name: string;
  code: string;
  category: string;
}

export const COMMON_DIAGNOSES: DiagnosisTerm[] = [
  // 순환기
  { name: '고혈압', code: 'I10', category: '순환기' },
  { name: '허혈성 심장질환', code: 'I25.9', category: '순환기' },
  { name: '심부전', code: 'I50.9', category: '순환기' },
  { name: '부정맥', code: 'I49.9', category: '순환기' },
  // 내분비
  { name: '제2형 당뇨병', code: 'E11.9', category: '내분비' },
  { name: '제1형 당뇨병', code: 'E10.9', category: '내분비' },
  { name: '갑상선기능저하증', code: 'E03.9', category: '내분비' },
  { name: '갑상선기능항진증', code: 'E05.90', category: '내분비' },
  { name: '고지혈증', code: 'E78.5', category: '내분비' },
  { name: '비만', code: 'E66.9', category: '내분비' },
  // 호흡기
  { name: '상기도감염', code: 'J06.9', category: '호흡기' },
  { name: '급성 편도염', code: 'J03.9', category: '호흡기' },
  { name: '급성 기관지염', code: 'J20.9', category: '호흡기' },
  { name: '폐렴', code: 'J18.9', category: '호흡기' },
  { name: '천식', code: 'J45.909', category: '호흡기' },
  { name: '만성폐쇄성폐질환(COPD)', code: 'J44.9', category: '호흡기' },
  { name: '알레르기성 비염', code: 'J30.9', category: '호흡기' },
  { name: '부비동염', code: 'J32.9', category: '호흡기' },
  // 소화기
  { name: '급성 위염', code: 'K29.70', category: '소화기' },
  { name: '만성 위염', code: 'K29.50', category: '소화기' },
  { name: '위식도역류질환(GERD)', code: 'K21.0', category: '소화기' },
  { name: '소화성 궤양', code: 'K27.9', category: '소화기' },
  { name: '과민성 대장증후군', code: 'K58.9', category: '소화기' },
  { name: '급성 장염', code: 'A09', category: '소화기' },
  { name: '변비', code: 'K59.00', category: '소화기' },
  { name: '치질(치핵)', code: 'K64.9', category: '소화기' },
  // 근골격
  { name: '요통', code: 'M54.5', category: '근골격' },
  { name: '경추통', code: 'M54.2', category: '근골격' },
  { name: '골관절염', code: 'M19.90', category: '근골격' },
  { name: '류마티스 관절염', code: 'M06.9', category: '근골격' },
  { name: '오십견(유착성 관절낭염)', code: 'M75.0', category: '근골격' },
  { name: '근막통증증후군', code: 'M79.3', category: '근골격' },
  { name: '골다공증', code: 'M81.0', category: '근골격' },
  // 신경
  { name: '편두통', code: 'G43.909', category: '신경' },
  { name: '긴장성 두통', code: 'G44.209', category: '신경' },
  { name: '어지럼증/현훈', code: 'R42', category: '신경' },
  { name: '불면증', code: 'G47.00', category: '신경' },
  // 정신건강
  { name: '우울장애', code: 'F32.9', category: '정신건강' },
  { name: '불안장애', code: 'F41.9', category: '정신건강' },
  { name: '공황장애', code: 'F41.0', category: '정신건강' },
  // 비뇨기
  { name: '요로감염(UTI)', code: 'N39.0', category: '비뇨기' },
  { name: '방광염', code: 'N30.90', category: '비뇨기' },
  { name: '신우신염', code: 'N10', category: '비뇨기' },
  { name: '전립선비대증', code: 'N40.0', category: '비뇨기' },
  // 피부
  { name: '두드러기', code: 'L50.9', category: '피부' },
  { name: '아토피 피부염', code: 'L20.9', category: '피부' },
  { name: '접촉성 피부염', code: 'L25.9', category: '피부' },
  { name: '대상포진', code: 'B02.9', category: '피부' },
  // 혈액
  { name: '철결핍성 빈혈', code: 'D50.9', category: '혈액' },
  { name: '빈혈', code: 'D64.9', category: '혈액' },
  // 안과/이비인후과
  { name: '결막염', code: 'H10.9', category: '안과' },
  { name: '중이염', code: 'H66.9', category: '이비인후과' },
  { name: '외이도염', code: 'H60.9', category: '이비인후과' },
];

export const COMMON_SYMPTOMS = [
  '두통', '발열', '기침', '콧물', '인후통', '복통', '오심', '구토',
  '설사', '변비', '어지럼증', '흉통', '호흡곤란', '피로감', '근육통',
  '관절통', '부종', '발진', '가려움증', '식욕부진', '체중감소', '이명',
  '시력저하', '배뇨통', '빈뇨', '혈뇨', '요통', '어깨통증', '무릎통증',
];

export const COMMON_TREATMENTS = [
  '약물치료', '안정 및 휴식 권고', '물리치료', '식이요법 교육',
  '운동 권고', '수액 요법', '해열 및 진통 처치', '항생제 치료',
  '경과 관찰', '전문의 의뢰', '금연 권고', '체중 감량 권고',
  '저염식 식단 유지', '혈당 모니터링', '혈압 모니터링',
];

export const COMMON_MEDICATIONS = [
  '아세트아미노펜(타이레놀) 500mg 1일 3회 식후',
  '이부프로펜 400mg 1일 3회 식후',
  '아목시실린 500mg 1일 3회 식후',
  '세팔렉신 500mg 1일 4회 식후',
  '아지트로마이신 500mg 1일 1회',
  '로라타딘(클라리틴) 10mg 1일 1회',
  '세티리진 10mg 1일 1회 취침 전',
  '오메프라졸 20mg 1일 1회 식전',
  '판토프라졸 40mg 1일 1회 식전',
  '메트포르민 500mg 1일 2회 식후',
  '글리메피리드 2mg 1일 1회 아침 식전',
  '암로디핀 5mg 1일 1회',
  '리시노프릴 10mg 1일 1회',
  '아토르바스타틴 20mg 1일 1회 취침 전',
  '레보티록신 50mcg 1일 1회 공복',
];
