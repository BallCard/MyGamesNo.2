import { describe, expect, test } from "vitest";

import { createMergeQueue, enqueueMergePair, shiftNextMerge } from "../../src/game/systems/mergeQueue";

describe("merge queue", () => {
  test("dedupes the same pair and processes later in FIFO order", () => {
    const queue = createMergeQueue();

    const afterFirst = enqueueMergePair(queue, "a", "b", 4, 40);
    const afterDuplicate = enqueueMergePair(afterFirst, "b", "a", 4, 40);
    const afterSecond = enqueueMergePair(afterDuplicate, "c", "d", 5, 80);

    expect(afterSecond.items).toHaveLength(2);
    expect(shiftNextMerge(afterSecond).next).toMatchObject({ leftId: "a", rightId: "b", resultLevel: 4 });
    expect(shiftNextMerge(shiftNextMerge(afterSecond).queue).next).toMatchObject({ leftId: "c", rightId: "d", resultLevel: 5 });
  });
});
