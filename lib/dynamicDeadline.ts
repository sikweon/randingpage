/**
 * 동적 마감일 계산
 *
 * 어드민에 마감일이 비어있을 때 호출되어
 * "기한: MM월DD일(요일) 오후5시 마감" 형식의 문자열을 반환한다.
 *
 * - 기준 시각: Asia/Seoul (한국 시간)
 * - 표시 날짜: 한국 시간 기준 "오늘 + 1일"
 *   → 매일 자정(KST)이 지나면 자동으로 하루 미뤄짐
 * - 광고 랜딩의 "마감 임박" 트릭을 자동화하기 위한 유틸
 *
 * 수동 마감일을 박고 싶으면 어드민의 "이벤트 기한" 필드에 직접 입력하면 됨.
 * (그 경우 이 함수는 호출되지 않음)
 */
export function formatDynamicDeadline(): string {
  // 현재 시각 + 24시간 = 한국 시간 기준 "내일"의 어느 시점
  // (Asia/Seoul 로 포맷하면 한국 시간 내일 날짜가 추출됨)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const parts = formatter.formatToParts(tomorrow);
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";

  return `기한: ${month}월${day}일(${weekday}) 오후5시 마감`;
}

/**
 * 어드민 입력값을 표시용 문자열로 변환.
 * - 비어있으면 자동 계산값 (오늘 + 1일)
 * - 값이 있으면 그 값 그대로 (수동 모드)
 */
export function resolveDeadlineText(manualValue: string | undefined): string {
  const trimmed = manualValue?.trim() ?? "";
  if (trimmed.length === 0) {
    return formatDynamicDeadline();
  }
  return trimmed;
}
