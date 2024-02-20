jest.mock("../src/config/supabase/client", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({
      data: { trigger: "mockTriggerUrl", table: "testTable" }, // Mock response shape as per your needs
      error: null,
    }),
  },
}));

jest.mock("../src/config/database/database", () => ({
  getOrCreatePool: jest.fn().mockResolvedValue({
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], command: "", rowCount: 0 }),
      release: jest.fn(),
    }),
  }),
}));

import express, { Express } from "express";
import bodyParser from "body-parser";
import request from "supertest";
import tableRoutes from "../src/routes/tableRoutes";
import checkApiMiddleWare from "../src/middleware/checkApi";

let app: Express = express();
app.use(bodyParser.json());
app.use("/table", tableRoutes);

describe("TableController", () => {
  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use(checkApiMiddleWare);
    app.use("/table", tableRoutes);
  });

  describe("POST /table/createTable", () => {
    it("fail: 401", async () => {
      const response = await request(app)
        .post("/table/createTable")
        .send({
          tableName: "testTable",
          columns: [{ name: "id", type: "INT", constraints: "PRIMARY KEY" }],
        });
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });

    it("success", async () => {
      const response = await request(app)
        .post("/table/createTable")
        .send({
          tableName: "testTable",
          columns: [{ name: "id", type: "INT", constraints: "PRIMARY KEY" }],
        })
        .set("x-api-key", "validApiKey");

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("[]");
    });

    it("fail: bad request", async () => {
      const response = await request(app)
        .post("/table/createTable")
        .send({
          test: "testTable",
          columns: [{ name: "id", type: "TEST", constraints: "PRIMARY KEY" }],
        })
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid input");
    });
  });

  describe("DELETE /table/deleteTable/test", () => {
    it("success", async () => {
      const response = await request(app)
        .delete("/table/deleteTable/test")
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("[]");
    });

    it("fail: unauthorized", async () => {
      const response = await request(app)
        .delete("/table/deleteTable/test");
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });
  });

  describe("PUT /table/updateTableName", () => {
    it("success", async () => {
      const response = await request(app)
        .put("/table/updateTableName")
        .send({"oldTableName": "ha", "newTableName": "new"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("[]");
    });

    it("fail: unauthorized", async () => {
      const response = await request(app)
        .put("/table/updateTableName")
        .send({"oldTableName": "ha", "newTableName": "new"});
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });

    it("fail: bad request", async () => {
      const response = await request(app)
        .put("/table/updateTableName")
        .send({"invalidName": "ha", "newTableName": "new"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid input");
    });
  });

  describe("PUT /table/addColumn", () => {
    it("success", async () => {
      const response = await request(app)
        .post("/table/addColumn")
        .send({"tableName": "ha", "columnName": "saadat", "columnType": "INT"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("[]");
    });

    it("fail: unauthorized", async () => {
      const response = await request(app)
        .post("/table/addColumn")
        .send({"tableName": "ha", "columnName": "saadat", "columnType": "INT"});
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });

    it("fail: bad request", async () => {
      const response = await request(app)
        .post("/table/addColumn")
        .send({"tableNameInvalid": "ha", "columnName": "saadat", "columnType": "INT"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid input");
    });
  });

  describe("DELETE /table/deleteColumn", () => {
    it("success", async () => {
      const response = await request(app)
        .delete("/table/deleteColumn")
        .send({"tableName": "ha", "columnName": "saadat"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(200);
    });

    it("fail: unauthorized", async () => {
      const response = await request(app)
        .delete("/table/deleteColumn")
        .send({"tableName": "ha", "columnName": "saadat"});
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });

    it("fail: bad request", async () => {
      const response = await request(app)
        .delete("/table/deleteColumn")
        .send({"tableNameInvalid": "ha", "columnName": "saadat"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid input");
    });
  });

  describe("PUT /table/renameColumn", () => {
    it("success", async () => {
      const response = await request(app)
        .put("/table/renameColumn")
        .send({"tableName": "ha", "oldColumnName": "saadat", "newColumnName": "saadat"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("[]");
    });

    it("fail: unauthorized", async () => {
      const response = await request(app)
        .put("/table/renameColumn")
        .send({"tableName": "ha", "oldColumnName": "saadat", "newColumnName": "saadat"});
      expect(response.statusCode).toBe(401);
      expect(response.text).toBe("API key is required.");
    });

    it("fail: bad request", async () => {
      const response = await request(app)
        .put("/table/renameColumn")
        .send({"tableNameInvalid": "ha", "oldColumnName": "saadat", "newColumnName": "saadat"})
        .set("x-api-key", "validApiKey");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid input");
    });

    describe("GET /table/getColumns/testTable", () => {
      it("success", async () => {
        const response = await request(app)
          .get("/table/getColumns/testTable")
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("[]");
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .get("/table/getColumns/testTable");
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("GET /table/getTables/:schema", () => {
      it("success", async () => {
        const response = await request(app)
          .get("/table/getTables/public")
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .get("/table/getTables/public");
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("GET /table/getTable/:tableName", () => {
      it("success", async () => {
        const response = await request(app)
          .get("/table/getTable/users")
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .get("/table/getTable/users");
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");

      });
    });

    describe("GET /getTableValue/:tableName/:columnName/:columnValue", () => {
      it("success", async () => {
        const response = await request(app)
          .get("/table/getTableValue/users/name/testName")
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .get("/table/getTableValue/users/name/testName");
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("POST /getTableValue/:tableName/:columnName/:columnValue", () => {
      it("success", async () => {
        const response = await request(app)
          .post("/table/executeSelectQuery")
          .send({"query": "SELECT * FROM users;"})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("[]");
      });

      it("fail: bad request", async () => {
        const response = await request(app)
          .post("/table/executeSelectQuery")
          .send({"query": "INSERT INTO users values"})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid query: only SELECT queries are allowed.");
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .post("/table/executeSelectQuery")
          .send({"query": "SELECT * FROM users;"});
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("POST /table/insertData", () => {
      it("success", async () => {
        const response = await request(app)
          .post("/table/insertData")
          .send({"tableName": "users", "data": {"ha": "he"}})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("[]");
      });

      it("fail: bad request", async () => {
        const response = await request(app)
          .post("/table/insertData")
          .send({"invalidBody": "INSERT INTO users values"})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid input");
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .post("/table/insertData")
          .send({"tableName": "users", "data": {"ha": "he"}});
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("DELETE /table/deleteData", () => {
      it("success", async () => {
        const response = await request(app)
          .delete("/table/deleteData")
          .send({"tableName": "users", "condition": "ha"})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("[]");
      });

      it("fail: bad request", async () => {
        const response = await request(app)
          .delete("/table/deleteData")
          .send({"invalidBody": "users", "condition": "ha"})
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid input");
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .delete("/table/deleteData")
          .send({"tableName": "users", "condition": "ha"});
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });

    describe("POST /table/joinTables", () => {
      it("success", async () => {
        const response = await request(app)
          .post("/table/joinTables")
          .send({"tables": ["users", "posts"], "joinColumns": ["id", "id"], "joinType": "LEFT", "filter": "HAHA" })
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("[]");
      });

      it("fail: bad request", async () => {
        const response = await request(app)
          .post("/table/joinTables")
          .send({"invalid": ["users", "posts"], "joinColumns": ["id", "id"], "joinType": "LEFT", "filter": "HAHA" })
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid input for joining tables");
      });

      it("fail: more than two tables", async () => {
        const response = await request(app)
          .post("/table/joinTables")
          .send({"users": ["users", "posts", "extra"], "joinColumns": ["id", "id"], "joinType": "LEFT", "filter": "HAHA" })
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid input for joining tables");
      });

      it("fail: more than two join columns", async () => {
        const response = await request(app)
          .post("/table/joinTables")
          .send({"users": ["users", "posts"], "joinColumns": ["id", "id", "extra"], "joinType": "LEFT", "filter": "HAHA" })
          .set("x-api-key", "validApiKey");
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid input for joining tables");
      });

      it("fail: unauthorized", async () => {
        const response = await request(app)
          .post("/table/joinTables")
          .send({"invalid": ["users", "posts"], "joinColumns": ["id", "id"], "joinType": "LEFT", "filter": "HAHA" });
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("API key is required.");
      });
    });
  });
});
