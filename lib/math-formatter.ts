/**
 * 수학 표현식 포맷팅 유틸리티
 * LaTeX 형식을 인간이 읽을 수 있는 형식으로 변환
 */

/**
 * LaTeX frac{a}{b} 형식을 a/b 형식으로 변환
 * 예: frac{20}{100} → 20/100 (또는 1/5로 단순화)
 */
export function convertFractionFormat(text: string): string {
  const fracPattern = /\\frac\{([^}]+)\}\{([^}]+)\}/g;

  return text.replace(fracPattern, (match, numerator, denominator) => {
    const num = parseInt(numerator, 10);
    const den = parseInt(denominator, 10);

    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      const gcd = findGCD(num, den);
      const simplifiedNum = num / gcd;
      const simplifiedDen = den / gcd;

      if (simplifiedDen === 1) {
        return simplifiedNum.toString();
      }
      return `${simplifiedNum}/${simplifiedDen}`;
    }

    return `${numerator}/${denominator}`;
  });
}

/**
 * 최대공약수 계산 (유클리드 호제법)
 */
function findGCD(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

/**
 * LaTeX 수학 기호를 일반 텍스트로 변환
 */
export function convertMathSymbols(text: string): string {
  let result = text;

  // 분수 변환
  result = convertFractionFormat(result);

  // 일반적인 LaTeX 기호 변환
  const symbolMap: Record<string, string> = {
    "\\times": "×",
    "\\div": "÷",
    "\\pm": "±",
    "\\approx": "≈",
    "\\neq": "≠",
    "\\leq": "≤",
    "\\geq": "≥",
    "\\infty": "∞",
    "\\sqrt": "√",
    "\\pi": "π",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\theta": "θ",
  };

  Object.entries(symbolMap).forEach(([latex, symbol]) => {
    result = result.replace(new RegExp(latex, "g"), symbol);
  });

  // ^{...} 형식의 지수 변환
  result = result.replace(/\^\{([^}]+)\}/g, (match, exponent) => {
    if (exponent.length <= 2) {
      return `^${exponent}`;
    }
    return match;
  });

  // _{...} 형식의 아래첨자 변환
  result = result.replace(/_\{([^}]+)\}/g, (match, subscript) => {
    if (subscript.length <= 2) {
      return `_${subscript}`;
    }
    return match;
  });

  return result;
}

/**
 * 마크다운 제목 제거 (###, ##, #)
 */
export function removeMarkdownHeadings(text: string): string {
  return text.replace(/^#+\s+/gm, "");
}

/**
 * 마크다운 포맷팅 정리 (굵은 텍스트, 이탤릭, 코드 등)
 */
export function cleanMarkdownFormatting(text: string): string {
  let result = text;

  // 제목 제거
  result = result.replace(/^#+\s+/gm, "");

  // 굵은 텍스트 (**text** → text)
  result = result.replace(/\*\*(.*?)\*\*/g, "$1");
  result = result.replace(/__(.+?)__/g, "$1");

  // 이탤릭 (*text* → text)
  result = result.replace(/\*(.*?)\*/g, "$1");
  result = result.replace(/_(.+?)_/g, "$1");

  // 코드 (`code` → code)
  result = result.replace(/`(.*?)`/g, "$1");

  // 링크 ([text](url) → text)
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, "$1");

  // 이미지 제거
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, "");

  // 리스트 마커 제거 (줄 시작의 -, *, +, •)
  result = result.replace(/^[\s\*\-\+\•]+/gm, "");

  // 달러 기호 제거 ($...$)
  result = result.replace(/\$([^$]+)\$/g, "$1");

  // 중괄호 정리 ({...} → ...)
  result = result.replace(/\{([^}]+)\}/g, "$1");

  // 연속된 공백 정리
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

  return result.trim();
}

/**
 * 마크다운 텍스트에서 LaTeX 코드 블록 정리
 */
export function cleanMarkdownMath(markdown: string): string {
  let result = markdown;

  // 인라인 수학 표현 ($...$) 처리
  result = result.replace(/\$([^$]+)\$/g, (match, math) => {
    return convertMathSymbols(math);
  });

  // 블록 수학 표현 ($$...$$) 처리
  result = result.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    return convertMathSymbols(math);
  });

  // 전체 텍스트에서 LaTeX 기호 변환
  result = convertMathSymbols(result);

  return result;
}

/**
 * 풀이 텍스트 정리 및 포맷팅 (마크다운 + 수학 기호 모두 정리)
 */
export function formatSolution(solution: string): string {
  let result = solution;

  // 1. 마크다운 제목 제거
  result = removeMarkdownHeadings(result);

  // 2. 마크다운 포맷팅 정리
  result = cleanMarkdownFormatting(result);

  // 3. 수학 기호 변환
  result = cleanMarkdownMath(result);

  // 4. 불필요한 공백 정리
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

  // 5. 앞뒤 공백 제거
  result = result.trim();

  return result;
}
