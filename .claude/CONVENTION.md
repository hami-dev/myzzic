# 코드 컨벤션

## 파일명

- 컴포넌트: PascalCase (`PetCard.tsx`)
- 훅/유틸: camelCase (`usePet.ts`, `formatDate.ts`)

## React 컴포넌트 작성 순서

```tsx
export default function MyComponent() {
  // 1. context / router / ref
  // 2. state (useState)
  // 3. 파생 상태 (useMemo, useCallback)
  // 4. 사이드이펙트 (useEffect)
  // 5. 핸들러 함수
  // 6. return (JSX)
}
```

## await 스타일

함수 인자 안에 await를 중첩하지 않는다. 반드시 변수에 먼저 받는다.

```ts
// bad
setCategories(await localSupplyStorage.getCategories())

// good
const categories = await localSupplyStorage.getCategories()
setCategories(categories)
```
