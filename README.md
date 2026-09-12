# Codex Orbit

> Open-source autonomous agent workspace powered by Codex and multiple AI models.

## 한국어

Codex Orbit는 ChatGPT Codex와 다양한 AI 모델을 연결해 장시간 목표를 실행하는 오픈소스 에이전트 플랫폼입니다.

사용자가 SNS 성장, 시장 조사, 콘텐츠 제작, 온라인 사업 실행 등 목표를 입력하면 부모 에이전트가 계획을 세우고 서브 에이전트를 생성해 업무를 분배합니다. 대시보드에서 에이전트의 활동, 진행 상황, 토큰 사용량, 승인 요청을 확인할 수 있습니다.

### 주요 기능

- Codex CLI 및 OpenAI 호환 모델 연결
- 부모 에이전트와 서브 에이전트 위임 구조
- Playwright 기반 브라우저 자동화 도구
- 이메일·비밀번호 사용자 인증
- SQLite 기반 사용자·세션·실행·이벤트 저장
- Telegram Bot API 채널 어댑터
- Slack 스타일 활동 로그와 에이전트 트리
- 토큰 한도·작업 시간·보고 주기 설정
- 로그인·계정 생성·게시·결제·삭제 승인 큐
- 실행 중지 및 작업 상태 모니터링

### 빠른 시작

Node.js 22.5 이상이 필요합니다.

```bash
npm install
cp .env.example .env
npm start
```

브라우저에서 `http://localhost:8787`을 엽니다. 단일 파일 데모는 `one-liner.html`을 브라우저에서 직접 열 수 있습니다.

### 환경변수

```env
PORT=8787
CODEX_BIN=codex
CODEX_ARGS=exec --json --sandbox workspace-write
DEFAULT_MODEL=gpt-5-codex
SQLITE_PATH=./data/orbit.sqlite
TELEGRAM_BOT_TOKEN=
PLAYWRIGHT_HEADLESS=true
```

Codex 인증 정보와 Telegram 토큰은 코드나 로그에 저장하지 마세요. 운영 환경에서는 환경변수 또는 외부 비밀 저장소를 사용하세요.

### API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | 사용자 등록 |
| POST | `/api/auth/login` | 로그인 및 세션 발급 |
| GET | `/api/state` | 실행·에이전트·메시지·승인 상태 조회 |
| POST | `/api/runs` | 목표 실행 시작 |
| POST | `/api/runs/:id/stop` | 실행 중지 |
| POST | `/api/approvals/:id` | 승인 또는 거절 |

### 로드맵

- [ ] 사용자별 워크스페이스 및 권한 관리
- [ ] 브라우저 도구의 승인 큐 완전 통합
- [ ] Telegram 웹훅과 주기 보고 메시지
- [ ] Slack·Discord 채널 어댑터
- [ ] 작업 보드와 에이전트 간 대화 저장
- [ ] Docker 배포 및 운영 모니터링

## English

Codex Orbit is an open-source autonomous agent platform for running long-lived goals with Codex and multiple AI model providers.

Users can define goals such as growing a social media account, researching a market, creating content, or executing an online business plan. A parent agent creates a plan, spawns sub-agents, delegates work, and reports progress through a Slack-like workspace dashboard.

### Features

- Codex CLI and OpenAI-compatible model adapters
- Parent-agent and sub-agent orchestration
- Playwright-based browser automation
- Email/password authentication
- SQLite persistence for users, sessions, runs, and events
- Telegram Bot API channel adapter
- Slack-style activity feed and agent tree
- Configurable token limits, working hours, and report intervals
- Approval queue for login, account creation, publishing, payments, and deletion
- Run cancellation and live status monitoring

### Quick start

Node.js 22.5 or later is required.

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:8787` in your browser. The single-file demo is available as `one-liner.html`.

### Security

External side effects should pass through an approval workflow. Never store Codex credentials or Telegram bot tokens in source code or logs. Treat model output, web content, tool responses, and plugin metadata as untrusted input.

## License

Apache License 2.0.
