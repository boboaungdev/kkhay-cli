#!/usr/bin/env node

import("../dist/index.js").catch((err) => {
  console.error("Failed to run K Khay CLI:", err.message);
  process.exit(1);
});

