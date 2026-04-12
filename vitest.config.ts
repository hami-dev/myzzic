import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 전역 API(describe, it, expect 등)를 import 없이 사용 가능하게 설정
    globals: true,
    // Node.js 환경에서 실행 (브라우저 DOM이 필요 없는 유틸 테스트)
    environment: 'node',
  },
  resolve: {
    // tsconfig의 @/* 경로 별칭을 Vitest에서도 인식하도록 설정
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
