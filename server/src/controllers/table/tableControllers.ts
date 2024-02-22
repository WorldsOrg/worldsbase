import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { databaseService } from "../../services/table/databaseService";
import { triggerService } from "../../services/table/triggerService";

export class TableController {
  deleteTable = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    if (!tableName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid table name");
      return;
    }
    const result = await databaseService.executeQuery(`DROP TABLE IF EXISTS ${tableName};`);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`Table ${tableName} deleted successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  createTable = async (req: Request, res: Response) => {
    const { tableName, columns } = req.body;
    if (!tableName || !columns || !Array.isArray(columns)) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    console.log(columns);
    const columnDefinitions = columns.map((col) => `${col.name} ${col.type} ${col.constraints || ""}`).join(", ");

    const result = await databaseService.executeQuery(`CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`Table ${tableName} created successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  updateTableName = async (req: Request, res: Response) => {
    const { oldTableName, newTableName } = req.body;
    if (!oldTableName || !newTableName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const result = await databaseService.executeQuery(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName};`);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`Table ${oldTableName} updated to ${newTableName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  addColumn = async (req: Request, res: Response) => {
    const { tableName, columnName, columnType } = req.body;
    if (!tableName || !columnName || !columnType) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`${columnName} added to ${tableName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  deleteColumn = async (req: Request, res: Response) => {
    const { tableName, columnName } = req.body;
    if (!tableName || !columnName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`${columnName} deleted from ${tableName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  renameColumn = async (req: Request, res: Response) => {
    const { tableName, oldColumnName, newColumnName } = req.body;
    if (!tableName || !oldColumnName || !newColumnName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query = `ALTER TABLE ${tableName} RENAME COLUMN ${oldColumnName} TO ${newColumnName};`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`${oldColumnName} updated to ${newColumnName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  getColumns = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    if (!tableName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query =
      "SELECT c.column_name, c.data_type, CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key FROM information_schema.columns AS c LEFT JOIN information_schema.key_column_usage AS kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name LEFT JOIN information_schema.table_constraints AS tc ON kcu.table_name = tc.table_name AND kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY' WHERE c.table_name = $1 AND c.table_schema = 'public';";

    const result = await databaseService.executeQuery(query, [tableName]);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(result.data);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  getTables = async (req: Request, res: Response) => {
    const { schema } = req.params;
    if (!schema) {
      res.status(StatusCodes.BAD_REQUEST).send("Schema is required");
      return;
    }
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}';`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(result.data);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  getTable = async (req: Request, res: Response) => {
    const { tableName } = req.params;
    if (!tableName) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid table name");
      return;
    }
    const query = `SELECT * FROM ${tableName};`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(result.data);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  getTableValue = async (req: Request, res: Response) => {
    const { tableName, columnName, columnValue } = req.params;
    if (!tableName || !columnName || !columnValue) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query = `SELECT * FROM ${tableName} WHERE ${columnName} = $1;`;
    const result = await databaseService.executeQuery(query, [columnValue]);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(result.data);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  executeSelectQuery = async (req: Request, res: Response) => {
    const { query } = req.body;
    if ((query && !query.toLowerCase().startsWith("select")) || /;\s*drop\s|;\s*delete\s|;\s*insert\s|;\s*update\s/.test(query.toLowerCase())) {
      return res.status(400).send("Invalid query: only SELECT queries are allowed.");
    }
    const result = await databaseService.executeQuery(query, []);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(result.data);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  joinTables = async (req: Request, res: Response) => {
    const { tables, joinColumns, joinType, filter } = req.body;
    if (!tables || !joinColumns || tables.length !== 2 || joinColumns.length !== 2) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input for joining tables");
      return;
    }
    const joinQuery = `FROM ${tables[0]} ${joinType} JOIN ${tables[1]} ON ${tables[0]}.${joinColumns[0]} = ${tables[1]}.${joinColumns[1]}`;
    let query = `SELECT * ${joinQuery}`;

    if (filter && filter.column && filter.value !== undefined) {
      query += ` WHERE ${filter.column} = $1`;
    }

    query += ";";

    const result = await databaseService.executeQuery(query, filter ? [filter.value] : []);
    if (result.status === StatusCodes.OK) {
      res.status(StatusCodes.OK).send(`Tables ${tables[0]}, ${tables[1]} joined successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  insertData = async (req: Request, res: Response) => {
    const { tableName, data } = req.body;
    if (!tableName || !data) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${valuePlaceholders});`;
    const result = await databaseService.executeQuery(query, values);
    if (result.status === StatusCodes.OK) {
      triggerService.sendTrigger(tableName, null, data);
      res.status(StatusCodes.OK).send(`Data inserted to ${tableName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  deleteData = async (req: Request, res: Response) => {
    const { tableName, condition } = req.body;
    if (!tableName || !condition) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    const query = `DELETE FROM ${tableName} WHERE ${condition};`;
    const result = await databaseService.executeQuery(query);
    if (result.status === StatusCodes.OK) {
      triggerService.sendTrigger(tableName, condition, null);
      res.status(StatusCodes.OK).send(`Data deleted from ${tableName} successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };

  updateData = async (req: Request, res: Response) => {
    const { tableName, data, condition } = req.body;

    if (!tableName || !data || !condition) {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid input");
      return;
    }
    // Create an array to hold the values for the placeholders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] | undefined = [];

    // Generate the SET part of the SQL query, and populate the values array
    const updates = Object.entries(data)
      .map(([key, value], index) => {
        values.push(value); // Push each value into the array
        return `${key} = $${index + 1}`; // Use index for placeholder
      })
      .join(", ");

    // Construct the full SQL query
    const query = `UPDATE ${tableName} SET ${updates} WHERE ${condition};`;

    // Execute the database request
    const result = await databaseService.executeQuery(query, values);
    if (result.status === StatusCodes.OK) {
      triggerService.sendTrigger(tableName, condition, data);
      res.status(StatusCodes.OK).send(`Table ${tableName} updated successfully`);
    } else {
      res.status(result.status).send(result.error);
    }
  };
}
