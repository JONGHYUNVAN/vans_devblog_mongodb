# Cloudtype 배포 가이드

## 🚀 빠른 배포 체크리스트

### ✅ 배포 전 준비

- [ ] GitHub 계정 준비
- [ ] Cloudtype 계정 생성 및 로그인
- [ ] MongoDB 관리자 비밀번호 결정 (강력한 비밀번호)

### 📦 1단계: GitHub 저장소 푸시

```bash
# 현재 디렉토리에서 실행
git init
git add .
git commit -m "MongoDB 8.0 초기 설정"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### ☁️ 2단계: Cloudtype 배포

#### 2-1. 서비스 생성
1. https://cloudtype.io 접속 후 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성
3. `+` 버튼 클릭 → "GitHub 저장소 배포하기"

#### 2-2. 저장소 연결
1. GitHub 계정 연동 (최초 1회)
2. 방금 푸시한 저장소 선택
3. 브랜치: `main` 선택

#### 2-3. 기본 설정
```
서비스명: devblog-mongodb
배포 방식: Dockerfile (자동 감지)
포트: 27017
```

#### 2-4. 환경 변수 설정 (중요!)
**설정 → 환경 변수 → 추가**

```plaintext
이름: MONGO_INITDB_ROOT_USERNAME
값: admin

이름: MONGO_INITDB_ROOT_PASSWORD  
값: [여기에-강력한-비밀번호-입력]

이름: MONGO_INITDB_DATABASE
값: devblog
```

⚠️ **비밀번호 예시**: `MyS3cur3P@ssw0rd!2024` (최소 12자, 대소문자+숫자+특수문자)

#### 2-5. 리소스 설정
```
CPU: 0.5 코어 (최소) ~ 1 코어 (권장)
메모리: 512MB (최소) ~ 1GB (권장)
디스크: 2GB 이상
```

#### 2-6. 볼륨 마운트 설정 (필수!)
**설정 → 스토리지 → 영구 디스크 추가**

| 마운트 경로 | 크기 | 설명 |
|------------|------|------|
| `/data/db` | 2GB 이상 | MongoDB 데이터 |
| `/data/configdb` | 100MB | MongoDB 설정 |

⚠️ **중요**: 이 설정이 없으면 재배포 시 모든 데이터가 삭제됩니다!

#### 2-7. 배포 실행
1. "배포하기" 버튼 클릭
2. 빌드 진행 (2~3분)
3. 배포 완료 대기 (1~2분)

### ✅ 3단계: 배포 확인

#### 상태 확인
1. 서비스 상세 페이지 → "실행 중" 상태 확인
2. 로그 탭 → 에러 없는지 확인

**정상 로그 예시:**
```
MongoDB 초기화 시작
========================================
MongoDB 초기화 완료
데이터베이스: devblog
컬렉션: posts, users, comments, categories
========================================
```

#### 헬스체크 확인
- 자동으로 30초마다 헬스체크 실행
- 상태가 "Healthy"인지 확인

### 🔌 4단계: 연결 테스트

#### 내부 연결 (Cloudtype 프로젝트 내 다른 서비스)

연결 문자열:
```
mongodb://admin:[비밀번호]@devblog-mongodb:27017/devblog?authSource=admin
```

#### 외부 연결 (MongoDB Compass로 테스트)

1. **TCP 외부 접속 활성화**
   - 설정 → TCP 외부 접속 → 허용 활성화
   - 외부 주소 및 포트 확인 (예: `xxx.cloudtype.app:xxxxx`)

2. **MongoDB Compass 연결**
   - MongoDB Compass 다운로드: https://www.mongodb.com/products/compass
   - 새 연결 → 연결 문자열 입력:
   ```
   mongodb://admin:[비밀번호]@[외부주소]:[포트]/devblog?authSource=admin
   ```

3. **연결 확인**
   - devblog 데이터베이스 선택
   - posts, users, comments, categories 컬렉션 확인
   - 샘플 데이터 1건씩 확인

### 🎉 배포 완료!

---

## 📋 배포 후 작업

### 보안 강화

1. **외부 접속 비활성화** (개발 완료 후)
   - 설정 → TCP 외부 접속 → 비활성화

2. **비밀번호 변경** (필요시)
   ```bash
   # MongoDB 컨테이너 접속 후 실행
   use admin
   db.changeUserPassword("admin", "새로운비밀번호")
   ```

### 백업 설정

#### 수동 백업
```bash
# 로컬에서 실행
mongodump --uri="mongodb://admin:[비밀번호]@[주소]:[포트]/devblog?authSource=admin" --out=./backup/$(date +%Y%m%d)
```

#### 자동 백업 스크립트 (선택)
로컬 또는 CI/CD에서 정기 실행:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="${MONGODB_URI}" --out="./backups/${DATE}"
echo "Backup completed: ${DATE}"
```

### 모니터링

1. **Cloudtype 대시보드**
   - CPU/메모리 사용률 확인
   - 디스크 사용량 확인

2. **로그 모니터링**
   - 에러 로그 정기 확인
   - 성능 저하 징후 확인

---

## ❗ 문제 해결

### 문제 1: 연결 실패

**증상**: 애플리케이션에서 MongoDB 연결 실패

**해결 방법**:
1. 환경 변수 확인 (오타, 공백)
2. 서비스명 확인 (`devblog-mongodb`와 일치?)
3. 네트워크 확인 (같은 Cloudtype 프로젝트 내?)
4. 로그에서 에러 메시지 확인

### 문제 2: 데이터가 사라짐

**증상**: 재배포 후 데이터 손실

**해결 방법**:
1. 볼륨 마운트 설정 확인
2. `/data/db`, `/data/configdb`가 영구 디스크에 마운트되었는지 확인
3. 백업에서 복구:
   ```bash
   mongorestore --uri="..." ./backup/devblog
   ```

### 문제 3: 성능 저하

**증상**: 쿼리 속도 느림

**해결 방법**:
1. 인덱스 확인: `db.collection.getIndexes()`
2. 느린 쿼리 분석: `db.collection.explain("executionStats").find(...)`
3. 리소스 증설 (CPU/메모리)

### 문제 4: 디스크 부족

**증상**: 데이터 저장 실패

**해결 방법**:
1. Cloudtype 대시보드에서 디스크 사용량 확인
2. 설정 → 스토리지 → 디스크 크기 증설
3. 불필요한 데이터 정리

---

## 📞 도움말

### 유용한 명령어

#### MongoDB Shell 접속
```bash
# Cloudtype 터미널에서
mongosh -u admin -p [비밀번호] --authenticationDatabase admin
```

#### 데이터베이스 목록
```javascript
show dbs
```

#### 컬렉션 목록
```javascript
use devblog
show collections
```

#### 데이터 조회
```javascript
db.posts.find().pretty()
db.users.find().pretty()
```

#### 인덱스 확인
```javascript
db.posts.getIndexes()
```

### 참고 링크

- [Cloudtype 공식 문서](https://docs.cloudtype.io)
- [MongoDB 8.0 문서](https://www.mongodb.com/docs/manual/)
- [Dockerfile 레퍼런스](https://docs.docker.com/engine/reference/builder/)

---

## 💡 팁

1. **개발/테스트 환경**: Cloudtype MongoDB 사용
2. **프로덕션 환경**: MongoDB Atlas 권장 (무료 티어 512MB)
3. **정기 백업**: 최소 주 1회 백업 권장
4. **보안**: 외부 접속은 개발 시에만 활성화
5. **모니터링**: 주간 리소스 사용량 체크

배포 과정에서 문제가 있으면 Cloudtype 지원팀에 문의하세요!

