export type ResultState = {
  status: "idle" | "ok" | "error";
  heading?: string;
  content?: string;
};
