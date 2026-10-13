import { describe, expect, it } from "vitest";
import { COME_BACK_AT, stepOutAdvice } from "./stepOut";

describe("UT-24 stepOutAdvice: when a patient may leave the waiting room", () => {
  it("says you are next when nobody is ahead", () => {
    expect(stepOutAdvice(0)).toBe("next");
  });

  it("asks you to come back when 1 or 2 patients are ahead", () => {
    expect(stepOutAdvice(1)).toBe("come-back");
    expect(stepOutAdvice(2)).toBe("come-back");
  });

  it("lets you step out with more than 2 ahead", () => {
    expect(stepOutAdvice(3)).toBe("step-out");
    expect(stepOutAdvice(12)).toBe("step-out");
  });

  it("changes exactly at the come-back point", () => {
    expect(COME_BACK_AT).toBe(2);
    expect(stepOutAdvice(COME_BACK_AT)).toBe("come-back");
    expect(stepOutAdvice(COME_BACK_AT + 1)).toBe("step-out");
  });

  it("treats an impossible negative count as next, never as step out", () => {
    expect(stepOutAdvice(-1)).toBe("next");
  });
});
