# Tagzo AI - UI 이미지 → 컴포넌트 코드 변환

UI 이미지를 올리면 HTML · React · Vue 컴포넌트 코드를 즉시 생성해주는 Design-to-Code 서비스

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## 주요 기능

- **Design to Code**: UI 이미지를 업로드하면 즉시 컴포넌트 코드 생성
- **3종 프레임워크 동시 출력**: HTML · React · Vue 3 코드를 한 번에 생성
- **실시간 속성 편집기**: 미리보기에서 요소 클릭 → 색상·크기 실시간 수정
- **한/영 UI 지원**: 한국어 · 영어 전환 지원
- **Explore 갤러리**: 변환 결과 탐색 페이지

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| AI | Anthropic Claude API (claude-opus-4-6) |
| 코드 하이라이팅 | highlight.js |
| 코드 포매팅 | js-beautify |

## 시작하기

### 필수 요구사항

- Node.js 20+
- Anthropic API 키 ([console.anthropic.com](https://console.anthropic.com)에서 발급)

### 로컬 개발 환경 설정

1. **환경 변수 설정**

```bash
# 프로젝트 루트에 .env.local 생성
ANTHROPIC_API_KEY=your_api_key_here
```

2. **의존성 설치 및 실행**

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인

## 프로젝트 구조

```
tagzo-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 홈 (Hero + Upload + How it works + FAQ)
│   │   ├── result/page.tsx       # 결과 페이지 (미리보기 + 속성 편집기 + 코드 탭)
│   │   ├── explore/page.tsx      # 갤러리 탐색 페이지
│   │   └── api/
│   │       ├── analyze/route.ts  # 이미지 → 코드 변환 (Claude API)
│   │       ├── convert/route.ts  # 코드 변환 처리
│   │       └── gallery/route.ts  # 갤러리 데이터
│   ├── components/
│   │   ├── Header.tsx            # 헤더 (로고, 언어 전환, 테마)
│   │   ├── UploadZone.tsx        # 드래그&드롭 이미지 업로드
│   │   ├── HomeContent.tsx       # Hero 텍스트, How it works, Footer
│   │   ├── FaqSection.tsx        # FAQ 아코디언
│   │   ├── ExploreGrid.tsx       # 갤러리 그리드
│   │   ├── LoginModal.tsx        # 로그인 모달
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── providers/
│   │   ├── LangProvider.tsx      # 한/영 언어 컨텍스트 + 번역 텍스트
│   │   └── ThemeProvider.tsx     # 다크/라이트 테마
│   └── lib/
│       ├── rateLimit.ts          # IP·핑거프린트 기반 요청 제한
│       └── utils.ts              # 유틸리티
├── public/
│   ├── step01.png                # How it works 스텝 이미지
│   ├── step02.png
│   └── step03.png
└── .env.local                    # 환경 변수 (git 제외)
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `ANTHROPIC_API_KEY` | ✅ 필수 | Anthropic Claude API 키 |

## 개발 스크립트

```bash
npm run dev    # 개발 서버
npm run build  # 프로덕션 빌드
npm start      # 프로덕션 실행
npm run lint   # ESLint 검사
```

## 라이선스

MIT
