/**
 * يلتقط أخطاء async ويمررها إلى معالج Express دون إسقاط العملية.
 */
export function asyncHandler(fn) {
  return function asyncHandlerWrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
