import { execSync } from "child_process";

export interface Result {
  data: {
    createdAt?: string;
    updatedAt?: string;
  };
  errors: Array<{
    type: "error" | "warn";
    code: string;
    message: string;
  }>;
}

export default (path: string): Result => {
  const data: Result["data"] = {};
  const errors: Result["errors"] = [];
  try {
    data.createdAt = execSync(`git log --format=%aD ${path} | tail -1`)
      .toString()
      .trim();
    data.updatedAt = execSync(`git log -1 --format=%aD ${path} | tail -1`)
      .toString()
      .trim();
  } catch (e) {
    errors.push({
      type: "error",
      code: "FileMeta_Error",
      message: (e as Error).message,
    });
  }
  return {
    data,
    errors,
  };
};
