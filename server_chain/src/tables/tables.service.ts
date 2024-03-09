import { Injectable } from '@nestjs/common';

@Injectable()
export class TablesService {
  createTable(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('createTable');
    });
  }

  deleteTable(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('deleteTable');
    });
  }

  updateTableName(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('updateTableName');
    });
  }

  addColumn(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('addColumn');
    });
  }

  deleteColumn(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('deleteColumn');
    });
  }

  renameColumn(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('renameColumn');
    });
  }

  getColumns(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('getColumns');
    });
  }

  getTables(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('getTables');
    });
  }

  getTable(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('getTable');
    });
  }

  getTableValue(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('getTableValue');
    });
  }

  joinTables(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('joinTables');
    });
  }

  executeSelectQuery(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('executeSelectQuery');
    });
  }

  insertData(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('insertData');
    });
  }

  deleteData(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('deleteData');
    });
  }

  updateData(): Promise<string> {
    return new Promise((resolve, reject) => {
      resolve('updateData');
    });
  }
}
