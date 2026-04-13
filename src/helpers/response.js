export const sendResponse = (res, { statusCode = 200, intOpCode, data = null }) => {
  return res.status(statusCode).json({
    statusCode,
    intOpCode,
    data
  })
}