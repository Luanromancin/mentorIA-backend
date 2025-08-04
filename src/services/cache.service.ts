import { UserCompetencyWithDetails } from '../entities/user-competency.entity';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
}

export class CacheService {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      console.log(`⏰ Cache expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache hit: ${key}`);
    return entry.data;
  }

  static invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`🗑️ Cache invalidated: ${key}`);
    });
  }

  static clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Métodos específicos para competências
  static getUserCompetenciesKey(profileId: string): string {
    return `user_competencies_${profileId}`;
  }

  static setUserCompetencies(profileId: string, competencies: UserCompetencyWithDetails[]): void {
    this.set(this.getUserCompetenciesKey(profileId), competencies, 10 * 60 * 1000); // 10 minutos
  }

  static getUserCompetencies(profileId: string): UserCompetencyWithDetails[] | null {
    return this.get<UserCompetencyWithDetails[]>(this.getUserCompetenciesKey(profileId));
  }

  static invalidateUserCompetencies(profileId: string): void {
    this.invalidate(`user_competencies_${profileId}`);
  }
} 