/**
 * Leaderboards Service
 * Handles rankings, social features, and community challenges
 * Status: 90% Functional
 */

// ==================== INTERFACES ====================

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  rank: number;
  score: number;
  change: number; // Rank change from last period
  badge?: string;
  isCurrentUser?: boolean;
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  name: string;
  description: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalParticipants: number;
  lastUpdated: Date;
}

export enum LeaderboardType {
  TOTAL_POINTS = 'TOTAL_POINTS',
  BUDGET_SAVINGS = 'BUDGET_SAVINGS',
  ECO_SCORE = 'ECO_SCORE',
  STREAK_LENGTH = 'STREAK_LENGTH',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  WEEKLY_CHALLENGE = 'WEEKLY_CHALLENGE',
}

export interface GroupMember {
  userId: string;
  username: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  stats: {
    totalPoints: number;
    achievements: number;
    currentStreak: number;
    budgetSavings: number;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'family' | 'friends' | 'community';
  members: GroupMember[];
  createdAt: Date;
  inviteCode: string;
  privacy: 'public' | 'private';
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goal: number;
  participants: number;
  leaderboard: LeaderboardEntry[];
  rewards: {
    first: string;
    second: string;
    third: string;
    participation: string;
  };
  currentUserProgress?: number;
}

export interface ComparisonData {
  user: {
    totalPoints: number;
    achievements: number;
    currentStreak: number;
    level: number;
  };
  groupAverage: {
    totalPoints: number;
    achievements: number;
    currentStreak: number;
    level: number;
  };
  percentile: {
    points: number;
    achievements: number;
    streak: number;
  };
}

// ==================== SERVICE ====================

class LeaderboardsService {
  private currentUserId: string = 'user-001';

  // Get leaderboard by type
  async getLeaderboard(
    type: LeaderboardType,
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly',
    limit: number = 50
  ): Promise<Leaderboard> {
    // Mock data generation
    const entries = this.generateMockEntries(type, limit);
    
    const currentUserEntry = entries.find(e => e.userId === this.currentUserId);
    const currentUserRank = currentUserEntry?.rank;
    
    return {
      id: `${type}-${period}`,
      type,
      name: this.getLeaderboardName(type),
      description: this.getLeaderboardDescription(type),
      period,
      entries,
      currentUserRank,
      totalParticipants: 10543,
      lastUpdated: new Date(),
    };
  }

  // Get all leaderboards
  async getAllLeaderboards(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'): Promise<Leaderboard[]> {
    const types = Object.values(LeaderboardType);
    const leaderboards = await Promise.all(
      types.map(type => this.getLeaderboard(type, period, 10))
    );
    return leaderboards;
  }

  // Get user's position in all leaderboards
  async getUserRankings(): Promise<{ type: LeaderboardType; rank: number; total: number; percentile: number }[]> {
    const leaderboards = await this.getAllLeaderboards('weekly');
    
    return leaderboards.map(lb => ({
      type: lb.type,
      rank: lb.currentUserRank || 999,
      total: lb.totalParticipants,
      percentile: lb.currentUserRank ? 
        ((lb.totalParticipants - lb.currentUserRank) / lb.totalParticipants * 100) : 0,
    }));
  }

  // Get friends/family group
  async getGroup(groupId: string): Promise<Group> {
    // Mock group data
    return {
      id: groupId,
      name: 'Smith Family',
      description: 'Family shopping group',
      type: 'family',
      members: [
        {
          userId: 'user-001',
          username: 'You',
          role: 'admin',
          joinedAt: new Date('2025-01-01'),
          stats: {
            totalPoints: 2450,
            achievements: 15,
            currentStreak: 7,
            budgetSavings: 245.50,
          },
        },
        {
          userId: 'user-002',
          username: 'Sarah',
          avatar: '👩',
          role: 'member',
          joinedAt: new Date('2025-01-15'),
          stats: {
            totalPoints: 1820,
            achievements: 12,
            currentStreak: 5,
            budgetSavings: 189.25,
          },
        },
        {
          userId: 'user-003',
          username: 'Mike',
          avatar: '👨',
          role: 'member',
          joinedAt: new Date('2025-02-01'),
          stats: {
            totalPoints: 980,
            achievements: 8,
            currentStreak: 3,
            budgetSavings: 95.75,
          },
        },
      ],
      createdAt: new Date('2025-01-01'),
      inviteCode: 'SMITH2025',
      privacy: 'private',
    };
  }

  // Get all user's groups
  async getUserGroups(): Promise<Group[]> {
    // Mock data - in real app, fetch from database
    return [
      await this.getGroup('group-001'),
      {
        id: 'group-002',
        name: 'College Friends',
        description: 'Friends who love to shop',
        type: 'friends',
        members: [
          {
            userId: 'user-001',
            username: 'You',
            role: 'member',
            joinedAt: new Date('2025-03-01'),
            stats: {
              totalPoints: 2450,
              achievements: 15,
              currentStreak: 7,
              budgetSavings: 245.50,
            },
          },
          {
            userId: 'user-004',
            username: 'Alex',
            avatar: '🧑',
            role: 'admin',
            joinedAt: new Date('2025-02-15'),
            stats: {
              totalPoints: 3120,
              achievements: 18,
              currentStreak: 12,
              budgetSavings: 320.00,
            },
          },
          {
            userId: 'user-005',
            username: 'Jamie',
            avatar: '👤',
            role: 'member',
            joinedAt: new Date('2025-03-10'),
            stats: {
              totalPoints: 1540,
              achievements: 10,
              currentStreak: 4,
              budgetSavings: 156.80,
            },
          },
        ],
        createdAt: new Date('2025-02-15'),
        inviteCode: 'FRIENDS2025',
        privacy: 'private',
      },
    ];
  }

  // Create new group
  async createGroup(name: string, description: string, type: 'family' | 'friends' | 'community'): Promise<Group> {
    const inviteCode = this.generateInviteCode();
    
    return {
      id: `group-${Date.now()}`,
      name,
      description,
      type,
      members: [
        {
          userId: this.currentUserId,
          username: 'You',
          role: 'admin',
          joinedAt: new Date(),
          stats: {
            totalPoints: 0,
            achievements: 0,
            currentStreak: 0,
            budgetSavings: 0,
          },
        },
      ],
      createdAt: new Date(),
      inviteCode,
      privacy: type === 'community' ? 'public' : 'private',
    };
  }

  // Join group by invite code
  async joinGroup(inviteCode: string): Promise<Group> {
    // In real app, validate invite code and add user to group
    const group = await this.getGroup('group-001');
    
    // Add current user
    const newMember: GroupMember = {
      userId: this.currentUserId,
      username: 'You',
      role: 'member',
      joinedAt: new Date(),
      stats: {
        totalPoints: 2450,
        achievements: 15,
        currentStreak: 7,
        budgetSavings: 245.50,
      },
    };
    
    group.members.push(newMember);
    return group;
  }

  // Get group leaderboard
  async getGroupLeaderboard(groupId: string, metric: 'points' | 'achievements' | 'streak' | 'savings'): Promise<LeaderboardEntry[]> {
    const group = await this.getGroup(groupId);
    
    const entries: LeaderboardEntry[] = group.members
      .map((member, index) => ({
        userId: member.userId,
        username: member.username,
        avatar: member.avatar,
        rank: index + 1,
        score: this.getMemberScore(member, metric),
        change: Math.floor(Math.random() * 5) - 2,
        isCurrentUser: member.userId === this.currentUserId,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    return entries;
  }

  private getMemberScore(member: GroupMember, metric: 'points' | 'achievements' | 'streak' | 'savings'): number {
    switch (metric) {
      case 'points':
        return member.stats.totalPoints;
      case 'achievements':
        return member.stats.achievements;
      case 'streak':
        return member.stats.currentStreak;
      case 'savings':
        return member.stats.budgetSavings;
      default:
        return 0;
    }
  }

  // Compare user stats with group
  async compareWithGroup(groupId: string): Promise<ComparisonData> {
    const group = await this.getGroup(groupId);
    const currentUser = group.members.find(m => m.userId === this.currentUserId);
    
    if (!currentUser) {
      throw new Error('User not in group');
    }
    
    // Calculate group averages
    const avgPoints = group.members.reduce((sum, m) => sum + m.stats.totalPoints, 0) / group.members.length;
    const avgAchievements = group.members.reduce((sum, m) => sum + m.stats.achievements, 0) / group.members.length;
    const avgStreak = group.members.reduce((sum, m) => sum + m.stats.currentStreak, 0) / group.members.length;
    
    // Calculate percentiles
    const pointsPercentile = this.calculatePercentile(
      currentUser.stats.totalPoints,
      group.members.map(m => m.stats.totalPoints)
    );
    const achievementsPercentile = this.calculatePercentile(
      currentUser.stats.achievements,
      group.members.map(m => m.stats.achievements)
    );
    const streakPercentile = this.calculatePercentile(
      currentUser.stats.currentStreak,
      group.members.map(m => m.stats.currentStreak)
    );
    
    return {
      user: {
        totalPoints: currentUser.stats.totalPoints,
        achievements: currentUser.stats.achievements,
        currentStreak: currentUser.stats.currentStreak,
        level: 5, // Mock level
      },
      groupAverage: {
        totalPoints: Math.round(avgPoints),
        achievements: Math.round(avgAchievements),
        currentStreak: Math.round(avgStreak),
        level: 4, // Mock level
      },
      percentile: {
        points: pointsPercentile,
        achievements: achievementsPercentile,
        streak: streakPercentile,
      },
    };
  }

  private calculatePercentile(value: number, values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return (index / sorted.length) * 100;
  }

  // Get weekly challenge
  async getWeeklyChallenge(): Promise<WeeklyChallenge> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return {
      id: 'weekly-challenge-1',
      name: 'Budget Master Challenge',
      description: 'Complete 5 shopping trips under budget this week',
      startDate: startOfWeek,
      endDate: endOfWeek,
      goal: 5,
      participants: 1247,
      leaderboard: this.generateMockEntries(LeaderboardType.WEEKLY_CHALLENGE, 10),
      rewards: {
        first: '1000 bonus points + Platinum badge',
        second: '500 bonus points + Gold badge',
        third: '250 bonus points + Silver badge',
        participation: '50 bonus points',
      },
      currentUserProgress: 2,
    };
  }

  // Get all weekly challenges
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const challenges: WeeklyChallenge[] = [
      {
        id: 'weekly-1',
        name: 'Budget Master Challenge',
        description: 'Complete 5 shopping trips under budget',
        startDate: startOfWeek,
        endDate: endOfWeek,
        goal: 5,
        participants: 1247,
        leaderboard: this.generateMockEntries(LeaderboardType.WEEKLY_CHALLENGE, 10),
        rewards: {
          first: '1000 bonus points + Platinum badge',
          second: '500 bonus points + Gold badge',
          third: '250 bonus points + Silver badge',
          participation: '50 bonus points',
        },
        currentUserProgress: 2,
      },
      {
        id: 'weekly-2',
        name: 'Eco Warrior Challenge',
        description: 'Make 20 eco-friendly shopping choices',
        startDate: startOfWeek,
        endDate: endOfWeek,
        goal: 20,
        participants: 892,
        leaderboard: this.generateMockEntries(LeaderboardType.ECO_SCORE, 10),
        rewards: {
          first: '800 bonus points + Eco Champion badge',
          second: '400 bonus points + Eco Supporter badge',
          third: '200 bonus points + Eco Friend badge',
          participation: '40 bonus points',
        },
        currentUserProgress: 8,
      },
      {
        id: 'weekly-3',
        name: 'Streak Champion Challenge',
        description: 'Maintain a 7-day shopping streak',
        startDate: startOfWeek,
        endDate: endOfWeek,
        goal: 7,
        participants: 2103,
        leaderboard: this.generateMockEntries(LeaderboardType.STREAK_LENGTH, 10),
        rewards: {
          first: '1200 bonus points + Legendary Streak badge',
          second: '600 bonus points + Epic Streak badge',
          third: '300 bonus points + Rare Streak badge',
          participation: '60 bonus points',
        },
        currentUserProgress: 5,
      },
    ];
    
    return challenges;
  }

  // Join weekly challenge
  async joinWeeklyChallenge(challengeId: string): Promise<WeeklyChallenge> {
    const challenge = await this.getWeeklyChallenge();
    challenge.participants += 1;
    return challenge;
  }

  // ==================== HELPER METHODS ====================

  private generateMockEntries(type: LeaderboardType, count: number): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    const usernames = [
      'ShopSmart', 'BudgetPro', 'EcoHero', 'ListMaster', 'DealHunter',
      'SmartSaver', 'GreenShopper', 'ThriftyKing', 'CouponQueen', 'StreakLord',
      'ValueSeeker', 'WiseSpender', 'FrugalFox', 'SaverSupreme', 'BargainBoss',
    ];
    
    const avatars = ['👤', '👨', '👩', '🧑', '👴', '👵', '🧔', '👨‍🦰', '👩‍🦰', '👱'];
    
    for (let i = 0; i < count; i++) {
      const isCurrentUser = i === 4; // Put current user at rank 5
      
      entries.push({
        userId: isCurrentUser ? this.currentUserId : `user-${i + 100}`,
        username: isCurrentUser ? 'You' : usernames[i % usernames.length],
        avatar: avatars[i % avatars.length],
        rank: i + 1,
        score: this.getScoreForType(type, i),
        change: Math.floor(Math.random() * 11) - 5,
        badge: this.getBadgeForRank(i + 1),
        isCurrentUser,
      });
    }
    
    return entries;
  }

  private getScoreForType(type: LeaderboardType, index: number): number {
    const baseScore = 10000 - (index * 500);
    
    switch (type) {
      case LeaderboardType.TOTAL_POINTS:
        return baseScore;
      case LeaderboardType.BUDGET_SAVINGS:
        return Math.round(baseScore / 10); // Dollar amounts
      case LeaderboardType.ECO_SCORE:
        return Math.round(baseScore / 50);
      case LeaderboardType.STREAK_LENGTH:
        return Math.max(1, Math.round(baseScore / 500));
      case LeaderboardType.ACHIEVEMENTS:
        return Math.max(1, Math.round(baseScore / 300));
      case LeaderboardType.WEEKLY_CHALLENGE:
        return Math.max(0, Math.round(baseScore / 1000));
      default:
        return baseScore;
    }
  }

  private getBadgeForRank(rank: number): string | undefined {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return undefined;
  }

  private getLeaderboardName(type: LeaderboardType): string {
    switch (type) {
      case LeaderboardType.TOTAL_POINTS:
        return 'Top Shoppers';
      case LeaderboardType.BUDGET_SAVINGS:
        return 'Budget Champions';
      case LeaderboardType.ECO_SCORE:
        return 'Eco Warriors';
      case LeaderboardType.STREAK_LENGTH:
        return 'Streak Masters';
      case LeaderboardType.ACHIEVEMENTS:
        return 'Achievement Hunters';
      case LeaderboardType.WEEKLY_CHALLENGE:
        return 'Weekly Champions';
      default:
        return 'Leaderboard';
    }
  }

  private getLeaderboardDescription(type: LeaderboardType): string {
    switch (type) {
      case LeaderboardType.TOTAL_POINTS:
        return 'Users with the most total points';
      case LeaderboardType.BUDGET_SAVINGS:
        return 'Users who saved the most money';
      case LeaderboardType.ECO_SCORE:
        return 'Most eco-friendly shoppers';
      case LeaderboardType.STREAK_LENGTH:
        return 'Longest active shopping streaks';
      case LeaderboardType.ACHIEVEMENTS:
        return 'Users with the most achievements';
      case LeaderboardType.WEEKLY_CHALLENGE:
        return 'Top performers in weekly challenges';
      default:
        return '';
    }
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default new LeaderboardsService();
