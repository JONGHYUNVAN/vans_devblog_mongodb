// MongoDB 초기화 스크립트
// 이 스크립트는 컨테이너 최초 실행 시에만 실행됩니다

print('========================================');
print('MongoDB 초기화 시작');
print('========================================');

// devblog 데이터베이스로 전환
db = db.getSiblingDB('devblog');

// 컬렉션 생성
db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'author', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: '게시글 제목 (필수)'
        },
        content: {
          bsonType: 'string',
          description: '게시글 내용 (필수)'
        },
        author: {
          bsonType: 'string',
          description: '작성자 (필수)'
        },
        tags: {
          bsonType: 'array',
          description: '태그 배열',
          items: {
            bsonType: 'string'
          }
        },
        published: {
          bsonType: 'bool',
          description: '공개 여부'
        },
        createdAt: {
          bsonType: 'date',
          description: '생성일 (필수)'
        },
        updatedAt: {
          bsonType: 'date',
          description: '수정일'
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'createdAt'],
      properties: {
        username: {
          bsonType: 'string',
          description: '사용자명 (필수)'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: '이메일 (필수)'
        },
        role: {
          enum: ['admin', 'editor', 'viewer'],
          description: '사용자 역할'
        },
        createdAt: {
          bsonType: 'date',
          description: '가입일 (필수)'
        }
      }
    }
  }
});

db.createCollection('comments');
db.createCollection('categories');

// 인덱스 생성
db.posts.createIndex({ title: 'text', content: 'text' }, { name: 'posts_text_search' });
db.posts.createIndex({ createdAt: -1 }, { name: 'posts_created_desc' });
db.posts.createIndex({ author: 1 }, { name: 'posts_author' });
db.posts.createIndex({ tags: 1 }, { name: 'posts_tags' });

db.users.createIndex({ username: 1 }, { unique: true, name: 'users_username_unique' });
db.users.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });

db.comments.createIndex({ postId: 1, createdAt: -1 }, { name: 'comments_post_created' });

db.categories.createIndex({ name: 1 }, { unique: true, name: 'categories_name_unique' });

// 초기 데이터 삽입 (샘플)
db.categories.insertMany([
  { name: 'Backend', slug: 'backend', description: '백엔드 개발 관련 글', createdAt: new Date() },
  { name: 'Frontend', slug: 'frontend', description: '프론트엔드 개발 관련 글', createdAt: new Date() },
  { name: 'DevOps', slug: 'devops', description: 'DevOps 및 인프라 관련 글', createdAt: new Date() },
  { name: 'Database', slug: 'database', description: '데이터베이스 관련 글', createdAt: new Date() }
]);

db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date()
});

db.posts.insertOne({
  title: 'Cloudtype에 MongoDB 8.0 배포하기',
  content: 'Dockerfile을 사용하여 Cloudtype에 최신 MongoDB를 배포하는 방법을 소개합니다.',
  author: 'admin',
  tags: ['mongodb', 'cloudtype', 'docker', 'deployment'],
  published: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('========================================');
print('MongoDB 초기화 완료');
print('데이터베이스: devblog');
print('컬렉션: posts, users, comments, categories');
print('========================================');

