const request = require("supertest");
const app = require("./testRoute");

describe("GET /test", () => {
  it("should return 'Everything is working fine'", async () => {
    const res = await request(app).get("/test");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Everything is working fine");
  });
});
