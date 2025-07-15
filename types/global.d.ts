declare global {
  var mongoose: {
    conn: ReturnType<typeof import("mongoose")["connect"]> | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

export {};
