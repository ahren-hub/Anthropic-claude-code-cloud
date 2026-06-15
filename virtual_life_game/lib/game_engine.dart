import 'models.dart';
import 'dart:math';

class GameEngine {
  static const double _rentCost = 1200.0;
  static const double _baseLivingExpenses = 400.0;
  static const double _debtInterestRate = 0.05;

  static GameState createInitialState() {
    return GameState(
      totalMonths: 0,
      cash: 500.0,
      debt: 5000.0,
      maxEnergy: 100,
      remainingEnergy: 100,
      stats: PlayerStats(
        happiness: 60.0,
        health: 80.0,
        stress: 20.0,
        looks: 60.0,
      ),
      logHistory: [
        "🌅 You're 18 and officially on your own. \$500 in your pocket, \$5k in debt, and a whole life ahead. Choose wisely.",
      ],
    );
  }

  static final List<Activity> activities = [
    const Activity(
      id: 'exercise',
      name: 'Exercise',
      emoji: '🏃',
      description: 'Free workout — run, pushups, yoga. Solid returns.',
      energyCost: 20,
      healthChange: 8,
      looksChange: 3,
      stressChange: -8,
      allowMultiple: true,
    ),
    const Activity(
      id: 'gym',
      name: 'Hit the Gym',
      emoji: '💪',
      description: 'Premium gym session. Costs \$60 but serious gains.',
      energyCost: 25,
      cashChange: -60,
      healthChange: 14,
      looksChange: 6,
      stressChange: -5,
    ),
    const Activity(
      id: 'meditate',
      name: 'Meditate',
      emoji: '🧘',
      description: 'Quiet your mind. Best stress reducer per energy spent.',
      energyCost: 10,
      stressChange: -15,
      happinessChange: 5,
      allowMultiple: true,
    ),
    const Activity(
      id: 'night_out',
      name: 'Night Out',
      emoji: '🎉',
      description: 'Hit the town. Great vibes, costs money and sleep.',
      energyCost: 20,
      cashChange: -100,
      happinessChange: 20,
      stressChange: -10,
    ),
    const Activity(
      id: 'date',
      name: 'Date Night',
      emoji: '💘',
      description: 'Wine, dine, and connect. Great for the soul.',
      energyCost: 15,
      cashChange: -80,
      happinessChange: 15,
      stressChange: -8,
    ),
    const Activity(
      id: 'side_hustle',
      name: 'Side Hustle',
      emoji: '💻',
      description: 'Grind for extra cash. Stressful but profitable.',
      energyCost: 35,
      cashChange: 600,
      stressChange: 18,
      happinessChange: -5,
      allowMultiple: true,
    ),
    const Activity(
      id: 'therapy',
      name: 'Therapy',
      emoji: '🛋️',
      description: 'Talk it out. Expensive but genuinely heals.',
      energyCost: 10,
      cashChange: -200,
      stressChange: -20,
      happinessChange: 10,
    ),
    const Activity(
      id: 'volunteer',
      name: 'Volunteer',
      emoji: '🤝',
      description: 'Give back to the community. Warms your soul.',
      energyCost: 20,
      happinessChange: 12,
      stressChange: -5,
    ),
    const Activity(
      id: 'netflix',
      name: 'Binge TV',
      emoji: '📺',
      description: 'Veg out on the couch. Low effort, low reward.',
      energyCost: 5,
      happinessChange: 8,
      stressChange: -5,
      allowMultiple: true,
    ),
    const Activity(
      id: 'study',
      name: 'Study / Upskill',
      emoji: '📚',
      description: 'Invest in yourself. Raises your job ceiling over time.',
      energyCost: 30,
      stressChange: 5,
      happinessChange: -3,
      healthChange: -2,
      allowMultiple: true,
    ),
    const Activity(
      id: 'cook',
      name: 'Cook at Home',
      emoji: '🍳',
      description: 'Skip takeout. Saves \$150 and boosts health.',
      energyCost: 10,
      cashChange: 150,
      healthChange: 5,
      happinessChange: 5,
    ),
    const Activity(
      id: 'self_care',
      name: 'Self Care',
      emoji: '✨',
      description: 'Skincare, grooming, glow-up. Worth every penny.',
      energyCost: 10,
      cashChange: -50,
      looksChange: 8,
      happinessChange: 5,
      stressChange: -5,
    ),
  ];

  static final List<Job> availableJobs = [
    Job(
      id: 'barista',
      title: 'Barista',
      emoji: '☕',
      monthlySalary: 2200,
      energyCost: 30,
      monthlyStressGain: 10,
      description: 'Make coffee, make friends. Low stress, decent tips.',
    ),
    Job(
      id: 'retail',
      title: 'Retail Associate',
      emoji: '🛍️',
      monthlySalary: 2500,
      energyCost: 30,
      monthlyStressGain: 15,
      description: 'Help customers all day. The holiday rush is brutal.',
    ),
    Job(
      id: 'delivery',
      title: 'Delivery Driver',
      emoji: '🚗',
      monthlySalary: 3000,
      energyCost: 35,
      monthlyStressGain: 12,
      description: 'Hit the road. Decent pay, flexible hours.',
    ),
    Job(
      id: 'admin',
      title: 'Office Admin',
      emoji: '🗂️',
      monthlySalary: 3500,
      energyCost: 25,
      monthlyStressGain: 12,
      description: 'Keep the office running. Stable and bearable.',
    ),
    Job(
      id: 'teacher',
      title: 'Teacher',
      emoji: '🎓',
      monthlySalary: 3200,
      energyCost: 30,
      monthlyStressGain: 10,
      description: 'Shape the future. Not rich but deeply fulfilling.',
    ),
    Job(
      id: 'nurse',
      title: 'Nurse',
      emoji: '🏥',
      monthlySalary: 4800,
      energyCost: 40,
      monthlyStressGain: 22,
      description: 'Save lives. Demanding but incredibly meaningful.',
    ),
    Job(
      id: 'marketer',
      title: 'Marketing Specialist',
      emoji: '📣',
      monthlySalary: 5000,
      energyCost: 30,
      monthlyStressGain: 15,
      description: 'Sell the dream. Creative and surprisingly corporate.',
    ),
    Job(
      id: 'developer',
      title: 'Software Developer',
      emoji: '👩‍💻',
      monthlySalary: 7500,
      energyCost: 35,
      monthlyStressGain: 20,
      description: 'Build apps and cry. High pay, high burnout potential.',
    ),
    Job(
      id: 'manager',
      title: 'Manager',
      emoji: '📊',
      monthlySalary: 6500,
      energyCost: 35,
      monthlyStressGain: 25,
      description: 'Lead the team. More money, more problems.',
    ),
    Job(
      id: 'entrepreneur',
      title: 'Entrepreneur',
      emoji: '🚀',
      monthlySalary: 12000,
      energyCost: 50,
      monthlyStressGain: 35,
      description: 'Go all in. Massive upside. Crushing pressure.',
    ),
  ];

  GameState applyActivity(GameState current, Activity activity) {
    if (current.remainingEnergy < activity.energyCost) return current;
    if (activity.requiresJob && current.currentJob == null) return current;
    if (!activity.allowMultiple &&
        current.usedActivitiesThisMonth.contains(activity.id)) {
      return current;
    }

    double newCash = current.cash + activity.cashChange;
    double newDebt = current.debt;
    if (newCash < 0) {
      newDebt += newCash.abs();
      newCash = 0;
    }

    final newStats = PlayerStats(
      happiness:
          (current.stats.happiness + activity.happinessChange).clamp(0.0, 100.0),
      health:
          (current.stats.health + activity.healthChange).clamp(0.0, 100.0),
      stress:
          (current.stats.stress + activity.stressChange).clamp(0.0, 100.0),
      looks: (current.stats.looks + activity.looksChange).clamp(0.0, 100.0),
    );

    final newUsed = Set<String>.from(current.usedActivitiesThisMonth);
    if (!activity.allowMultiple) newUsed.add(activity.id);

    return GameState(
      totalMonths: current.totalMonths,
      cash: newCash,
      debt: newDebt,
      maxEnergy: current.maxEnergy,
      remainingEnergy: current.remainingEnergy - activity.energyCost,
      stats: newStats,
      currentJob: current.currentJob,
      logHistory: current.logHistory,
      usedActivitiesThisMonth: newUsed,
    );
  }

  GameState changeJob(GameState current, Job? newJob) {
    final log = newJob != null
        ? '💼 You started a new job as a ${newJob.emoji} ${newJob.title} (\$${newJob.monthlySalary.toStringAsFixed(0)}/mo).'
        : '🚶 You quit your job. Hope you have savings...';

    return GameState(
      totalMonths: current.totalMonths,
      cash: current.cash,
      debt: current.debt,
      maxEnergy: current.maxEnergy,
      remainingEnergy: current.remainingEnergy,
      stats: current.stats,
      currentJob: newJob,
      logHistory: [log, ...current.logHistory],
      usedActivitiesThisMonth: current.usedActivitiesThisMonth,
    );
  }

  GameState advanceMonth(GameState current) {
    int nextTotalMonths = current.totalMonths + 1;
    double nextCash = current.cash;
    double nextDebt = current.debt;
    List<String> newLogs = [];

    // 1. Monthly bills
    double totalBills = _rentCost + _baseLivingExpenses;
    nextCash -= totalBills;
    newLogs.add(
        '🏠 Paid \$${totalBills.toStringAsFixed(0)} in rent & living expenses.');

    // 2. Job income
    if (current.currentJob != null) {
      final job = current.currentJob!;
      nextCash += job.monthlySalary;
      newLogs.add(
          '💵 Earned \$${job.monthlySalary.toStringAsFixed(0)} as ${job.emoji} ${job.title}.');
    } else {
      newLogs.add('⚠️ No job — no income this month.');
    }

    // 3. Debt interest
    if (nextDebt > 0) {
      double interest = nextDebt * _debtInterestRate;
      nextDebt += interest;
      newLogs.add(
          '📈 Accrued \$${interest.toStringAsFixed(0)} in interest on your debt.');
    }

    // 4. Overdraft → debt
    if (nextCash < 0) {
      nextDebt += nextCash.abs();
      nextCash = 0;
      newLogs.add('⚠️ Overdraft! Expenses converted to high-interest debt.');
    }

    // 5. Stat evolution
    double nextStress = current.stats.stress;
    double nextHealth = current.stats.health;
    double nextHappiness = current.stats.happiness;
    double nextLooks = current.stats.looks;

    // Job stress
    if (current.currentJob != null) {
      nextStress += current.currentJob!.monthlyStressGain;
    } else {
      // Unemployment slowly drains happiness
      nextHappiness -= 5;
    }

    // Burnout penalty
    if (nextStress > 70) {
      nextHealth -= 4.0;
      nextHappiness -= 5.0;
      newLogs.add('🚨 Severe burnout is damaging your health and happiness.');
    }

    // Natural stat decay
    nextHappiness -= 2;
    nextLooks -= 0.5;

    // 6. Random event
    _RandomEvent? event = _rollForRandomEvent(current);
    if (event != null) {
      nextCash += event.cashImpact;
      nextStress += event.stressImpact;
      nextHappiness += event.happinessImpact;
      nextHealth += event.healthImpact;
      newLogs.add('🎲 EVENT: ${event.description}');
    }

    // Clamp all stats
    nextHealth = nextHealth.clamp(0.0, 100.0);
    nextHappiness = nextHappiness.clamp(0.0, 100.0);
    nextStress = nextStress.clamp(0.0, 100.0);
    nextLooks = nextLooks.clamp(0.0, 100.0);

    return GameState(
      totalMonths: nextTotalMonths,
      cash: nextCash,
      debt: nextDebt,
      maxEnergy: 100,
      remainingEnergy: 100,
      stats: PlayerStats(
        happiness: nextHappiness,
        health: nextHealth,
        stress: nextStress,
        looks: nextLooks,
      ),
      currentJob: current.currentJob,
      logHistory: [...newLogs, ...current.logHistory],
    );
  }

  _RandomEvent? _rollForRandomEvent(GameState state) {
    final rand = Random();
    if (rand.nextDouble() > 0.40) return null;

    final List<_RandomEvent> pool = [
      _RandomEvent(
          "Your phone screen shattered. Repair cost: \$150.", -150, 8, 0, 0),
      _RandomEvent(
          "Spontaneous road trip with friends — memories made!", -200, -15, 20, 0),
      _RandomEvent(
          "A wild crypto bet actually paid out! Earned \$800.", 800, -5, 10, 0),
      _RandomEvent(
          "Old flame texted out of nowhere. Emotional spiral ensued.", 0, 20, -10, 0),
      _RandomEvent("Got a surprise freelance gig! Earned \$400.", 400, 10, 5, 0),
      _RandomEvent(
          "Got sick and needed a doctor. Cost \$300 and sapped your energy.", -300, 10, -5, -8),
      _RandomEvent(
          "Found \$50 in an old jacket. Small wins!", 50, 0, 5, 0),
      _RandomEvent(
          "Friend drama blew up. Stressful but at least it's free.", 0, 18, -8, 0),
      _RandomEvent(
          "Impulse bought something online at 2am. There goes \$250.", -250, -5, 5, 0),
      _RandomEvent(
          "Got a compliment from a stranger. You're glowing!", 0, -5, 10, 3),
    ];

    return pool[rand.nextInt(pool.length)];
  }
}

class _RandomEvent {
  final String description;
  final double cashImpact;
  final double stressImpact;
  final double happinessImpact;
  final double healthImpact;

  _RandomEvent(this.description, this.cashImpact, this.stressImpact,
      this.happinessImpact, this.healthImpact);
}
