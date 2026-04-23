export const validateRequest = (schema) => (req, res, next) => {
  const parseResult = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parseResult.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { body, query, params } = parseResult.data;
  req.validated = { body, query, params };
  req.body = body;
  Object.assign(req.query, query);
  Object.assign(req.params, params);
  return next();
};
