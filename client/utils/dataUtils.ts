// utils/dataUtils.js
export const compareArrays = (primaryColumn: any, arr1: any[], arr2: any[]) => {
  const key = primaryColumn;

  const map1 = new Map<string, any>(arr1.map((item) => [item[key], item]));
  const map2 = new Map<string, any>(arr2.map((item) => [item[key], item]));

  const created: any[] = [];
  const updated: any[] = [];
  const deleted: any[] = [];

  map2.forEach((item, id) => {
    if (!map1.has(id)) {
      created.push(item);
    } else if (JSON.stringify(map1.get(id)) !== JSON.stringify(item)) {
      updated.push(item);
    }
  });

  // Check for created items
  map1.forEach((_, id) => {
    if (!map2.has(id)) {
      deleted.push(map1.get(id));
    }
  });

  return { created, updated, deleted };
};

export const sortByKey = (array: any[], key: string, order = "asc") => {
  return array?.sort((a, b) => {
    let x = a[key];
    let y = b[key];

    // For date or string comparison
    if (typeof x === "string" && typeof y === "string") {
      x = x.toLowerCase();
      y = y.toLowerCase();
    }

    if (order === "asc") {
      return x < y ? -1 : x > y ? 1 : 0;
    } else {
      // descending order
      return x > y ? -1 : x < y ? 1 : 0;
    }
  });
};
