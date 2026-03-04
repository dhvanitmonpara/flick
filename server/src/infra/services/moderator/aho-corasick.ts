export type PatternPayload = {
  word: string;
  severity: "mild" | "moderate" | "severe";
  strictMode: boolean;
  pattern: string;
};

export type AhoMatch = {
  start: number;
  end: number;
  payload: PatternPayload;
};

type Node = {
  next: Map<string, number>;
  fail: number;
  outputs: PatternPayload[];
};

export class AhoCorasick {
  private readonly nodes: Node[] = [{ next: new Map(), fail: 0, outputs: [] }];

  constructor(patterns: PatternPayload[]) {
    for (const payload of patterns) {
      if (!payload.pattern.length) {
        continue;
      }
      this.insert(payload.pattern, payload);
    }

    this.buildFailures();
  }

  private insert(pattern: string, payload: PatternPayload): void {
    let state = 0;

    for (const char of pattern) {
      const next = this.nodes[state].next.get(char);
      if (next !== undefined) {
        state = next;
        continue;
      }

      const nodeIndex = this.nodes.length;
      this.nodes.push({ next: new Map(), fail: 0, outputs: [] });
      this.nodes[state].next.set(char, nodeIndex);
      state = nodeIndex;
    }

    this.nodes[state].outputs.push(payload);
  }

  private buildFailures(): void {
    const queue: number[] = [];

    for (const [, next] of this.nodes[0].next) {
      this.nodes[next].fail = 0;
      queue.push(next);
    }

    while (queue.length > 0) {
      const state = queue.shift();
      if (state === undefined) {
        break;
      }

      for (const [char, target] of this.nodes[state].next) {
        queue.push(target);

        let fallback = this.nodes[state].fail;
        while (fallback !== 0 && !this.nodes[fallback].next.has(char)) {
          fallback = this.nodes[fallback].fail;
        }

        const failTarget = this.nodes[fallback].next.get(char) ?? 0;
        this.nodes[target].fail = failTarget;
        this.nodes[target].outputs.push(...this.nodes[failTarget].outputs);
      }
    }
  }

  search(text: string): AhoMatch[] {
    const matches: AhoMatch[] = [];
    let state = 0;

    for (let index = 0; index < text.length; index++) {
      const char = text[index] ?? "";

      while (state !== 0 && !this.nodes[state].next.has(char)) {
        state = this.nodes[state].fail;
      }

      state = this.nodes[state].next.get(char) ?? 0;

      if (this.nodes[state].outputs.length === 0) {
        continue;
      }

      for (const payload of this.nodes[state].outputs) {
        const end = index + 1;
        const start = end - payload.pattern.length;

        if (start < 0) {
          continue;
        }

        matches.push({
          start,
          end,
          payload,
        });
      }
    }

    return matches;
  }
}
