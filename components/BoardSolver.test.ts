import Solve from "./BoardSolver";

describe("BoardSolver", () => {
  it("one", () => {
    const grid = [
      [1, 1]
    ];
    const capacity = 3;
    const result = Solve(grid, capacity);
    expect(result).toBe(1);  // you can replace this with your expected value
  });

  it("two", () => {
    const grid = [
      [1, 1]
    ];
    const capacity = 2;
    const result = Solve(grid, capacity);
    expect(result).toBe(1);
  });

  it("three", () => {
    const grid = [
      [1, 1]
    ];
    const capacity = 1;
    const result = Solve(grid, capacity);
    expect(result).toBe(2);
  });

  it("four", () => {
    const grid = [
      [1, 1],
      [1, 1]
    ];
    const capacity = 5;
    const result = Solve(grid, capacity);
    expect(result).toBe(1);
  });

  it("five", () => {
    const grid = [
      [1, 1],
      [1, 1]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(1);
  });

  it("six", () => {
    const grid = [
      [1, 1],
      [1, 1]
    ];
    const capacity = 3;
    const result = Solve(grid, capacity);
    expect(result).toBe(2);
  });

  it("seven", () => {
    const grid = [
      [1, 2],
      [1, 1]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(2);
  });

  it("eight", () => {
    const grid = [
      [2, 4],
      [1, 1]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(2);
  });

  it("nine", () => {
    const grid = [
      [1, 4],
      [1, 3]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(3);
  });

  it("ten", () => {
    const grid = [
      [1, 4, 4],
      [2, 2, 1]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(4);
  });

  it("eleven", () => {
    const grid = [
      [2, 4, 4],
      [2, 1, 3]
    ];
    const capacity = 4;
    const result = Solve(grid, capacity);
    expect(result).toBe(4);
  });

  it("twelve", () => {
    const grid = [
      [1, 2, 1],
      [2, 2, 1],
      [1, 1, 1],
      [1, 2, 2]
    ];
    const capacity = 6;
    const result = Solve(grid, capacity);
    expect(result).toBe(3);
  });

  it("thirteen", () => {
    const grid = [
      [2,2,1,1],
      [4,4,2,4],
      [2,1,1,2],
      [3,1,3,3]
    ];
    const capacity = 6;
    const result = Solve(grid, capacity);
    expect(result).toBe(6);
  });

  it("fourteen", () => {
    const grid = [
      [4, 2, 3],
      [2, 2, 2]
    ];
    const capacity = 6;
    const result = Solve(grid, capacity);
    expect(result).toBe(3);
  });
});
