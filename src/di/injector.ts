export default class Injector {
  private services: Map<new (...args: unknown[]) => unknown, unknown> = new Map();
  private repositories: Map<new (...args: unknown[]) => unknown, unknown> = new Map();

  public registerService<T>(
    serviceType: new (...args: unknown[]) => T,
    service: T
  ): void {
    this.services.set(serviceType, service);
  }

  public getService<T>(serviceType: new (...args: unknown[]) => T): T {
    const service = this.services.get(serviceType);
    if (!service) {
      throw new Error(`Service ${serviceType.name} not found`);
    }
    return service as T;
  }

  public registerRepository<T>(
    repositoryType: new (...args: unknown[]) => T,
    repository: T
  ): void {
    this.repositories.set(repositoryType, repository);
  }

  public getRepository<T>(repositoryType: new (...args: unknown[]) => T): T {
    const repository = this.repositories.get(repositoryType);
    if (!repository) {
      throw new Error(`Repository ${repositoryType.name} not found`);
    }
    return repository as T;
  }
}
