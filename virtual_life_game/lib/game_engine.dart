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

  static const List<Dilemma> dilemmas = [
    Dilemma(
      id: 'startup', emoji: '💸', title: 'Startup Pitch',
      description: "An old friend needs \$1,000 to fund their startup. They swear it'll 10x.",
      choices: [
        DilemmaChoice(label: 'Invest \$1,000', gamble: Gamble(
          winChance: 0.45,
          win: Effects(cash: 2500, happiness: 12, result: "The startup took off — your \$1,000 became \$2,500!"),
          lose: Effects(cash: -1000, stress: 14, result: "It folded in months. Your \$1,000 is gone."),
        )),
        DilemmaChoice(label: 'Politely decline', effects: Effects(happiness: -2, result: "You pass. No risk, no reward.")),
      ],
    ),
    Dilemma(
      id: 'overtime', emoji: '⏰', title: 'Overtime Offer', requiresJob: true,
      description: "Your boss offers a big weekend project for extra pay.",
      choices: [
        DilemmaChoice(label: 'Grind the weekend', effects: Effects(cash: 900, stress: 15, health: -5, result: "Exhausting, but the \$900 bonus helps.")),
        DilemmaChoice(label: 'Protect your time', effects: Effects(happiness: 6, stress: -6, result: "You recharge instead. Worth it.")),
      ],
    ),
    Dilemma(
      id: 'wallet', emoji: '👛', title: 'Lost Wallet',
      description: "You find a wallet on the street with \$200 cash inside.",
      choices: [
        DilemmaChoice(label: 'Keep the cash', effects: Effects(cash: 200, happiness: -8, stress: 5, result: "You pocket it, but the guilt lingers.")),
        DilemmaChoice(label: 'Return it', effects: Effects(happiness: 14, result: "The owner is overjoyed. You feel great.")),
      ],
    ),
    Dilemma(
      id: 'trip', emoji: '✈️', title: 'Weekend Getaway',
      description: "Friends invite you on a spontaneous \$350 weekend trip.",
      choices: [
        DilemmaChoice(label: 'Go for it', effects: Effects(cash: -350, happiness: 20, stress: -15, health: 3, result: "Unforgettable weekend. Money well spent.")),
        DilemmaChoice(label: 'Stay home & save', effects: Effects(happiness: -3, result: "You save the cash but feel a little FOMO.")),
      ],
    ),
    Dilemma(
      id: 'pet', emoji: '🐶', title: 'Adopt a Pet?',
      description: "A shelter puppy needs a home. Adoption fee is \$150.",
      choices: [
        DilemmaChoice(label: 'Adopt the pup', effects: Effects(cash: -150, happiness: 18, stress: 5, result: "Your new best friend moves in. Pure joy.")),
        DilemmaChoice(label: 'Not right now', effects: Effects(happiness: -2, result: "The timing isn't right. Maybe someday.")),
      ],
    ),
    Dilemma(
      id: 'charity', emoji: '🎗️', title: 'Charity Drive',
      description: "A local charity is fundraising in your neighborhood.",
      choices: [
        DilemmaChoice(label: 'Donate \$100', effects: Effects(cash: -100, happiness: 12, stress: -3, result: "Giving back feels good.")),
        DilemmaChoice(label: 'Walk past', effects: Effects(happiness: -3, result: "You keep your cash and your guilt.")),
      ],
    ),
    Dilemma(
      id: 'course', emoji: '🎓', title: 'Night Class',
      description: "A \$400 course could level up your career skills.",
      choices: [
        DilemmaChoice(label: 'Enroll (\$400)', gamble: Gamble(
          winChance: 0.6,
          win: Effects(cash: 200, happiness: 10, result: "You aced it and landed a \$600 raise — net win!"),
          lose: Effects(cash: -400, stress: 8, result: "You finished it, but no payoff yet. Pricey lesson."),
        )),
        DilemmaChoice(label: 'Skip it', effects: Effects(stress: -2, result: "You stick with what you know.")),
      ],
    ),
    Dilemma(
      id: 'trainer', emoji: '🏋️', title: 'Personal Trainer',
      description: "A trainer offers a 1-month transformation package for \$300.",
      choices: [
        DilemmaChoice(label: 'Sign up (\$300)', effects: Effects(cash: -300, health: 15, looks: 10, stress: -5, result: "You're in the best shape of your life.")),
        DilemmaChoice(label: 'Pass', effects: Effects(happiness: -1, result: "You'll stick to free workouts.")),
      ],
    ),
    Dilemma(
      id: 'crypto', emoji: '🪙', title: 'Hot Crypto Tip',
      description: "A coworker swears a new coin is about to moon. \$500 to get in.",
      choices: [
        DilemmaChoice(label: 'Ape in \$500', gamble: Gamble(
          winChance: 0.4,
          win: Effects(cash: 1500, happiness: 10, result: "It mooned! Your \$500 turned into \$2,000."),
          lose: Effects(cash: -500, stress: 15, happiness: -8, result: "It rugged. Your \$500 vanished overnight."),
        )),
        DilemmaChoice(label: 'Stay out', effects: Effects(stress: -2, result: "You keep your money and your sanity.")),
      ],
    ),
    Dilemma(
      id: 'family', emoji: '👪', title: 'Family Emergency',
      description: "A close relative urgently needs \$600 to cover a crisis.",
      choices: [
        DilemmaChoice(label: 'Help them out', effects: Effects(cash: -600, happiness: 8, stress: 5, result: "They're deeply grateful. Family first.")),
        DilemmaChoice(label: "Can't afford it", effects: Effects(happiness: -10, stress: 8, result: "You couldn't help. The guilt weighs on you.")),
      ],
    ),
    Dilemma(
      id: 'promotion', emoji: '📈', title: 'Stretch Assignment', requiresJob: true,
      description: "A high-visibility project could fast-track your career — or burn you out.",
      choices: [
        DilemmaChoice(label: 'Take the shot', effects: Effects(stress: 18), gamble: Gamble(
          winChance: 0.55,
          win: Effects(cash: 1000, happiness: 8, result: "You crushed it — a \$1,000 bonus and a promotion!"),
          lose: Effects(stress: 6, happiness: -5, result: "It fizzled out. A lot of stress for little reward."),
        )),
        DilemmaChoice(label: 'Play it safe', effects: Effects(stress: -5, result: "You keep your current workload steady.")),
      ],
    ),
    Dilemma(
      id: 'splurge', emoji: '🛒', title: 'Big Sale',
      description: "There's a huge sale on something you've wanted for ages (\$250).",
      choices: [
        DilemmaChoice(label: 'Treat yourself', effects: Effects(cash: -250, happiness: 14, looks: 4, result: "Retail therapy hits the spot.")),
        DilemmaChoice(label: 'Resist', effects: Effects(happiness: -2, stress: 2, result: "You stay disciplined. Your wallet thanks you.")),
      ],
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
      lastDilemmaMonth: current.lastDilemmaMonth,
      lastDilemmaId: current.lastDilemmaId,
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
      lastDilemmaMonth: current.lastDilemmaMonth,
      lastDilemmaId: current.lastDilemmaId,
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
      newLogs.add('🎲 ${event.description}');
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
      lastDilemmaMonth: current.lastDilemmaMonth,
      lastDilemmaId: current.lastDilemmaId,
      lastMonthLog: newLogs,
    );
  }

  /// Picks a dilemma to surface after a month, or null if none is due.
  /// One is guaranteed at least every 3 months, plus a 40% chance otherwise.
  Dilemma? pickDilemma(GameState state) {
    final rand = Random();
    final due = (state.totalMonths - state.lastDilemmaMonth) >= 3 ||
        rand.nextDouble() < 0.4;
    if (!due) return null;
    final pool = dilemmas
        .where((d) =>
            (!d.requiresJob || state.currentJob != null) &&
            d.id != state.lastDilemmaId)
        .toList();
    if (pool.isEmpty) return null;
    return pool[rand.nextInt(pool.length)];
  }

  /// Applies a dilemma choice (base effects + optional random gamble) and
  /// returns the new state along with the result message to show.
  GameState applyChoice(GameState state, Dilemma dilemma, DilemmaChoice choice) {
    final logs = <String>[];
    GameState s = _applyEffects(state, choice.effects, logs);
    if (choice.gamble != null) {
      final won = Random().nextDouble() < choice.gamble!.winChance;
      s = _applyEffects(s, won ? choice.gamble!.win : choice.gamble!.lose, logs);
    }
    return GameState(
      totalMonths: s.totalMonths,
      cash: s.cash,
      debt: s.debt,
      maxEnergy: s.maxEnergy,
      remainingEnergy: s.remainingEnergy,
      stats: s.stats,
      currentJob: s.currentJob,
      logHistory: s.logHistory,
      usedActivitiesThisMonth: s.usedActivitiesThisMonth,
      lastDilemmaMonth: state.totalMonths,
      lastDilemmaId: dilemma.id,
      lastMonthLog: logs,
    );
  }

  GameState _applyEffects(GameState s, Effects e, List<String> logs) {
    double cash = s.cash + e.cash;
    double debt = s.debt;
    if (cash < 0) {
      debt += cash.abs();
      cash = 0;
    }
    if (e.result != null) logs.add('🤔 ${e.result}');
    return GameState(
      totalMonths: s.totalMonths,
      cash: cash,
      debt: debt,
      maxEnergy: s.maxEnergy,
      remainingEnergy: s.remainingEnergy,
      stats: PlayerStats(
        happiness: (s.stats.happiness + e.happiness).clamp(0.0, 100.0),
        health: (s.stats.health + e.health).clamp(0.0, 100.0),
        stress: (s.stats.stress + e.stress).clamp(0.0, 100.0),
        looks: (s.stats.looks + e.looks).clamp(0.0, 100.0),
      ),
      currentJob: s.currentJob,
      logHistory: e.result != null ? ['🤔 ${e.result}', ...s.logHistory] : s.logHistory,
      usedActivitiesThisMonth: s.usedActivitiesThisMonth,
      lastDilemmaMonth: s.lastDilemmaMonth,
      lastDilemmaId: s.lastDilemmaId,
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
