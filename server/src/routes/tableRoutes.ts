import { TableController } from "./../controllers/table/tableControllers";
import { Router } from "express";

const router = Router();

const controller = new TableController();

router.post("/createTable", controller.createTable);
router.delete("/deleteTable/:tableName", controller.deleteTable);
router.put("/updateTableName", controller.updateTableName);

router.post("/addColumn", controller.addColumn);
router.delete("/deleteColumn", controller.deleteColumn);
router.put("/renameColumn", controller.renameColumn);
router.get("/getColumns/:tableName", controller.getColumns);

router.get("/getTables/:schema", controller.getTables);
router.get("/getTable/:tableName", controller.getTable);
router.get("/getTableValue/:tableName/:columnName/:columnValue", controller.getTableValue);
router.post("/joinTables", controller.joinTables);
router.post("/executeSelectQuery", controller.executeSelectQuery);

router.post("/insertData", controller.insertData);
router.delete("/deleteData", controller.deleteData);
router.put("/updateData", controller.updateData);

export default router;
