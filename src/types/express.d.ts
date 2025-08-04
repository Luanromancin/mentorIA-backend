declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        // Adicione outros campos conforme necessário
      };
    }
  }
}

export {};
