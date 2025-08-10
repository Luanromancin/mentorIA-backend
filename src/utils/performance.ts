export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
    console.log(`⏱️ Iniciando: ${operation}`);
  }

  static endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`⚠️ Timer não encontrado para: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    // Armazenar métrica
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    console.log(`⏱️ ${operation}: ${duration}ms`);
    return duration;
  }

  static getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  static getMetrics(): Record<
    string,
    { avg: number; count: number; last: number }
  > {
    const result: Record<string, { avg: number; count: number; last: number }> =
      {};

    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = {
        avg: this.getAverageTime(operation),
        count: times.length,
        last: times[times.length - 1] || 0,
      };
    }

    return result;
  }

  static logMetrics(): void {
    const metrics = this.getMetrics();
    console.log('📊 Métricas de Performance:');
    for (const [operation, data] of Object.entries(metrics)) {
      console.log(
        `  ${operation}: ${data.avg.toFixed(2)}ms (média), ${
          data.count
        } execuções, último: ${data.last}ms`
      );
    }
  }
}
