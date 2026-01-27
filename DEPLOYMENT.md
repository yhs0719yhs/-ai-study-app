# 배포 가이드

## GitHub 저장소 연동

### 1단계: GitHub 저장소 생성

```bash
# GitHub에 로그인하고 새 저장소 생성
# 저장소명: ai-study-app
# 공개/비공개: 선택 사항
```

### 2단계: 로컬 저장소 초기화

```bash
cd /home/ubuntu/ai-study-app

# Git 초기화
git init
git add .
git commit -m "Initial commit: AI Study Assistant App"

# 원격 저장소 추가
git remote add origin https://github.com/yhs0719yhs/ai-study-app.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 3단계: GitHub 인증 설정

```bash
# GitHub CLI 로그인
gh auth login

# 프롬프트에서:
# - Protocol: HTTPS 선택
# - 인증 방법: 웹 브라우저를 통한 로그인 선택
# - 이메일: yhs0719yhs@gmail.com
```

---

## Vercel 배포

### 1단계: Vercel 계정 연동

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login

# 프롬프트에서 GitHub 계정으로 로그인
```

### 2단계: 프로젝트 배포

```bash
# 프로젝트 디렉토리에서
cd /home/ubuntu/ai-study-app

# Vercel에 배포
vercel

# 프롬프트에서:
# - 프로젝트 이름: ai-study-app
# - 프레임워크: Other (Node.js)
# - 빌드 명령어: pnpm build
# - 출력 디렉토리: dist
```

### 3단계: 환경 변수 설정

Vercel 대시보드에서:

1. Settings → Environment Variables로 이동
2. 다음 변수들 추가:

```
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xnzyjkeephpcltuofevq.supabase.co
SUPABASE_ANON_KEY=sb_publishable_8STfscULxQGXr9HA8dDSrQ_MR8SLvD1
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
OAUTH_SERVER_URL=https://api.manus.im
```

### 4단계: 자동 배포 설정

GitHub 저장소의 main 브랜치에 푸시하면 Vercel이 자동으로 배포합니다.

---

## Supabase 데이터베이스 설정

### 1단계: Supabase 프로젝트 생성

1. https://supabase.com에 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 Anon Key 복사

### 2단계: 데이터베이스 테이블 생성

Supabase SQL 에디터에서 다음 쿼리 실행:

```sql
-- Users 테이블 (기존)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  login_method VARCHAR(64),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems 테이블
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  user_id INT,
  image_url VARCHAR(500) NOT NULL,
  problem_type VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  solution TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Goals 테이블
CREATE TABLE IF NOT EXISTS learning_goals (
  id SERIAL PRIMARY KEY,
  user_id INT,
  goal_type VARCHAR(20) NOT NULL,
  target_count INT NOT NULL,
  current_count INT DEFAULT 0,
  subject VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statistics 테이블
CREATE TABLE IF NOT EXISTS statistics (
  id SERIAL PRIMARY KEY,
  user_id INT,
  total_problems INT DEFAULT 0,
  top_problem_types TEXT,
  recent_trend TEXT,
  subject_distribution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 활성화 (선택사항)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
```

---

## 로컬 개발 환경 설정

### 1단계: 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 다음 값들을 입력:
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://xnzyjkeephpcltuofevq.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
VERCEL_DEPLOYMENT_URL=https://ai-server-backend-ai9b.vercel.app
```

### 2단계: 의존성 설치

```bash
pnpm install
```

### 3단계: 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev

# 또는 분리된 터미널에서:
# 터미널 1: 메트로 번들러
pnpm dev:metro

# 터미널 2: 백엔드 서버
pnpm dev:server
```

---

## 배포 체크리스트

- [ ] GitHub 저장소 생성 및 코드 푸시
- [ ] Vercel 계정 연동
- [ ] Vercel에 프로젝트 배포
- [ ] 환경 변수 설정 (Vercel)
- [ ] Supabase 데이터베이스 테이블 생성
- [ ] OpenAI API 키 설정
- [ ] 배포된 앱 테스트

---

## 문제 해결

### OpenAI API 오류
- API 키가 올바른지 확인
- 계정에 충분한 크레딧이 있는지 확인
- API 사용량 제한 확인

### Supabase 연결 오류
- URL과 Anon Key가 올바른지 확인
- 데이터베이스 테이블이 생성되었는지 확인
- RLS 정책 확인

### Vercel 배포 오류
- 빌드 로그 확인
- 환경 변수 설정 확인
- 의존성 설치 확인
