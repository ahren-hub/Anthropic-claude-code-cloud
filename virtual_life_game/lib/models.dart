class PlayerStats {
  double happiness; // 0.0 to 100.0
  double health; // 0.0 to 100.0
  double stress; // 0.0 to 100.0
  double looks; // 0.0 to 100.0

  PlayerStats({
    required this.happiness,
    required this.health,
    required this.stress,
    required this.looks,
  });

  PlayerStats copyWith({
    double? happiness,
    double? health,
    double? stress,
    double? looks,
  }) {
    return PlayerStats(
      happiness: happiness ?? this.happiness,
      health: health ?? this.health,
      stress: stress ?? this.stress,
      looks: looks ?? this.looks,
    );
  }
}

class Job {
  final String id;
  final String title;
  final String emoji;
  final double monthlySalary;
  final int energyCost;
  final double monthlyStressGain;
  final String description;
  int performance; // 0 to 100

  Job({
    required this.id,
    required this.title,
    required this.emoji,
    required this.monthlySalary,
    required this.energyCost,
    required this.monthlyStressGain,
    required this.description,
    this.performance = 50,
  });

  Job copyWith({int? performance}) {
    return Job(
      id: id,
      title: title,
      emoji: emoji,
      monthlySalary: monthlySalary,
      energyCost: energyCost,
      monthlyStressGain: monthlyStressGain,
      description: description,
      performance: performance ?? this.performance,
    );
  }
}

class Activity {
  final String id;
  final String name;
  final String emoji;
  final String description;
  final int energyCost;
  final double cashChange;
  final double happinessChange;
  final double healthChange;
  final double stressChange;
  final double looksChange;
  final bool requiresJob;
  final bool allowMultiple;

  const Activity({
    required this.id,
    required this.name,
    required this.emoji,
    required this.description,
    required this.energyCost,
    this.cashChange = 0,
    this.happinessChange = 0,
    this.healthChange = 0,
    this.stressChange = 0,
    this.looksChange = 0,
    this.requiresJob = false,
    this.allowMultiple = false,
  });
}

class GameState {
  final int totalMonths;
  final double cash;
  final double debt;
  final int maxEnergy;
  final int remainingEnergy;
  final PlayerStats stats;
  final Job? currentJob;
  final List<String> logHistory;
  final Set<String> usedActivitiesThisMonth;

  GameState({
    required this.totalMonths,
    required this.cash,
    required this.debt,
    required this.maxEnergy,
    required this.remainingEnergy,
    required this.stats,
    this.currentJob,
    required this.logHistory,
    Set<String>? usedActivitiesThisMonth,
  }) : usedActivitiesThisMonth = usedActivitiesThisMonth ?? {};

  int get ageYears => 18 + (totalMonths ~/ 12);
  int get ageMonths => totalMonths % 12;
  String get formattedAge => '${ageYears}y ${ageMonths}m';
  double get netWorth => cash - debt;

  bool get isDead => stats.health <= 0;
  bool get isBankrupt => debt >= 100000 && cash <= 0;
  bool get isGameOver => isDead || isBankrupt;
  bool get hasWon => ageYears >= 65 && netWorth >= 250000 && stats.happiness >= 50;
}
