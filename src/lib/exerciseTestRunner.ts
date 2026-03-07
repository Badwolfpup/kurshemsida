export interface ParsedAssert {
  comment: string;
  code: string;
}

export interface TestResult {
  comment: string;
  code: string;
  passed: boolean;
  error?: string;
}

export function parseAsserts(assertsJson: string | null): ParsedAssert[] {
  if (!assertsJson) return [];
  try {
    return JSON.parse(assertsJson) as ParsedAssert[];
  } catch {
    return [];
  }
}

export function runTests(userCode: string, asserts: ParsedAssert[]): TestResult[] {
  return asserts.map((a) => {
    try {
      const wrapped = new Function(`
        ${userCode}
        let __passed = true;
        let __error = "";

        function expect(actual) {
          return {
            toBe(expected) {
              if (actual !== expected) {
                __passed = false;
                __error = "Förväntat " + JSON.stringify(expected) + " men fick " + JSON.stringify(actual);
              }
            },
            toEqual(expected) {
              if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                __passed = false;
                __error = "Förväntat " + JSON.stringify(expected) + " men fick " + JSON.stringify(actual);
              }
            },
            toBeTruthy() {
              if (!actual) { __passed = false; __error = "Förväntat truthy men fick " + JSON.stringify(actual); }
            },
            toBeFalsy() {
              if (actual) { __passed = false; __error = "Förväntat falsy men fick " + JSON.stringify(actual); }
            },
            toContain(item) {
              if (typeof actual === "string" ? !actual.includes(item) : !Array.isArray(actual) || !actual.includes(item)) {
                __passed = false;
                __error = JSON.stringify(actual) + " innehåller inte " + JSON.stringify(item);
              }
            },
            toThrow() {
              if (typeof actual !== "function") { __passed = false; __error = "Förväntat en funktion"; return; }
              try { actual(); __passed = false; __error = "Förväntat att ett fel skulle kastas"; } catch(e) {}
            }
          };
        }

        const originalAssert = console.assert;
        console.assert = function(condition, ...args) {
          if (!condition) {
            __passed = false;
            __error = args.join(" ");
          }
        };

        try {
          ${a.code}
        } catch(e) {
          __passed = false;
          __error = e.message;
        }
        console.assert = originalAssert;
        return { passed: __passed, error: __error };
      `);
      const result = wrapped();
      return { comment: a.comment, code: a.code, passed: result.passed, error: result.error || undefined };
    } catch (e: any) {
      return { comment: a.comment, code: a.code, passed: false, error: e.message };
    }
  });
}
