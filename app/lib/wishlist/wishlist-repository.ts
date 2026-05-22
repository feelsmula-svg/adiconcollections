import "server-only";

export interface WishlistRepository {
  listIds(userId: string): Promise<string[]>;
  toggle(userId: string, productId: string): Promise<string[]>;
  add(userId: string, productId: string): Promise<string[]>;
  remove(userId: string, productId: string): Promise<string[]>;
  clear(userId: string): Promise<void>;
}

let repoPromise: Promise<WishlistRepository> | null = null;

export async function getWishlistRepository(): Promise<WishlistRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoWishlistRepository } = await import(
          "./repositories/mongo-wishlist-repository"
        );
        return new MongoWishlistRepository();
      }
      const { JsonWishlistRepository } = await import(
        "./repositories/json-wishlist-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[wishlist] JsonWishlistRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonWishlistRepository();
    })();
  }
  return repoPromise;
}
