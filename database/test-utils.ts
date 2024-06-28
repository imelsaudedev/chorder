export function mockCollections(getDB: () => Promise<any>, collections: any) {
  const db = {
    collection: jest.fn().mockImplementation((name: string) => collections[name]),
  };
  const client = {
    db: jest.fn().mockResolvedValue(db),
  };
  (getDB as jest.Mock).mockResolvedValue({ client, db: db });
}
