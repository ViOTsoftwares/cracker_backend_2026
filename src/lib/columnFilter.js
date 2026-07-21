export const ColumnFilter = (data = {}) => {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error("ColumnFilter JSON parse error", e);
    }
  }
  
  const filter = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!value) return;
    const field = key.replace("fs_", "");

    // TEXT FILTER (fs_)
    if (key.replace("fs_", "") === "status") {
      filter[field] = value;
    } else {
      filter[field] = { $regex: value, $options: "i" };
    }

    // NUMBER FILTER (fn_)
    if (key.startsWith("fn_")) {
      filter[field] = Number(value);
    }

    // EXACT MATCH / OBJECT ID FILTER (fo_)
    if (key.startsWith("fo_")) {
      const field = key.replace("fo_", "");
      filter[field] = value;
    }

    // DATE FILTER (fd_)
    if (key.startsWith("fd_")) {
      const field = key.replace("fd_", "");
      filter[field] = new Date(value);
    }
  });

  return filter;
};
