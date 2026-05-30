// Augment Express Request to include authenticated user payload
// Keep the type simple to avoid module augmentation issues during TS compilation.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}
