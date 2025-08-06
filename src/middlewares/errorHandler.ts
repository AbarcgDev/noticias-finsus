import { Context, ErrorHandler } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

const onError: ErrorHandler = (err: Error, c: Context) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== 200
    ? currentStatus as ContentfulStatusCode
    : 500
  return c.json(
    {
      message: `${err.message}`
    }, statusCode)
}

export default onError;
