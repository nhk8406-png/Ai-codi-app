# MediRecord - AI 기반 의료기록 자동화 시스템

Next.js + TypeScript로 구축된 의료기록 자동화 프로그램입니다.

## 주요 기능

- **환자 관리**: 환자 등록, 조회, 수정, 삭제
- **진료 기록**: 진료 기록 작성 및 관리, AI 자동 작성
- **예약 관리**: 예약 스케줄링 및 상태 관리
- **AI 자동 작성**: Claude AI를 이용한 진료 기록 자동 생성 및 환자 설명 요약

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Anthropic API 키를 입력하세요:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Anthropic Claude API
- **데이터 저장**: JSON 파일 기반 (로컬)

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 대시보드
│   ├── patients/             # 환자 관리 페이지
│   ├── records/              # 진료 기록 페이지
│   ├── appointments/         # 예약 관리 페이지
│   └── api/                  # API 라우트
├── components/
│   ├── layout/               # 사이드바 등 레이아웃
│   ├── patients/             # 환자 관련 컴포넌트
│   ├── records/              # 진료 기록 컴포넌트
│   ├── appointments/         # 예약 컴포넌트
│   └── ui/                   # 공용 UI 컴포넌트
├── lib/
│   ├── db.ts                 # JSON 파일 DB 유틸리티
│   └── utils.ts              # 공용 유틸리티 함수
└── types/
    └── index.ts              # TypeScript 타입 정의
data/                         # JSON 데이터 파일
```
