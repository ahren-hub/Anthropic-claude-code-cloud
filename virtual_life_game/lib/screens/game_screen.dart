import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models.dart';
import '../game_engine.dart';
import '../widgets/stat_bar.dart';
import '../widgets/activity_card.dart';
import 'game_over_screen.dart';

class GameScreen extends StatefulWidget {
  final GameState state;
  const GameScreen({super.key, required this.state});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen>
    with SingleTickerProviderStateMixin {
  late GameState _state;
  final GameEngine _engine = GameEngine();
  late TabController _tabController;
  String? _lastEventMessage;

  @override
  void initState() {
    super.initState();
    _state = widget.state;
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _doActivity(Activity activity) {
    final next = _engine.applyActivity(_state, activity);
    if (next == _state) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _state.remainingEnergy < activity.energyCost
                ? 'Not enough energy!'
                : 'Already done this month.',
          ),
          backgroundColor: const Color(0xFFEF4444),
          duration: const Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    setState(() => _state = next);
  }

  void _endMonth() {
    final next = _engine.advanceMonth(_state);
    setState(() => _state = next);

    if (next.isGameOver) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => GameOverScreen(state: next, didWin: false),
        ),
      );
      return;
    }

    if (next.hasWon) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => GameOverScreen(state: next, didWin: true),
        ),
      );
      return;
    }

    // Show the top event log entry as a snackbar
    if (next.logHistory.isNotEmpty) {
      final topLog = next.logHistory
          .firstWhere((l) => l.startsWith('🎲'), orElse: () => '');
      if (topLog.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(topLog),
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            backgroundColor: const Color(0xFF252940),
          ),
        );
      }
    }
  }

  void _applyJobChange(Job? job) {
    setState(() => _state = _engine.changeJob(_state, job));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildFinancialStrip(),
            _buildTabBar(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildLifeTab(),
                  _buildCareerTab(),
                  _buildJournalTab(),
                ],
              ),
            ),
            _buildEndMonthButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'AGE ${_state.formattedAge}',
                style: GoogleFonts.rajdhani(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1,
                ),
              ),
              Text(
                _state.currentJob != null
                    ? '${_state.currentJob!.emoji} ${_state.currentJob!.title}'
                    : '💼 Unemployed',
                style: const TextStyle(color: Colors.white54, fontSize: 13),
              ),
            ],
          ),
          const Spacer(),
          _buildEnergyPill(),
        ],
      ),
    );
  }

  Widget _buildEnergyPill() {
    final fraction = _state.remainingEnergy / _state.maxEnergy;
    final color = fraction > 0.5
        ? const Color(0xFF10B981)
        : fraction > 0.25
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Text('⚡', style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 6),
          Text(
            '${_state.remainingEnergy}/${_state.maxEnergy}',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinancialStrip() {
    final netWorth = _state.netWorth;
    final nwColor = netWorth >= 0
        ? const Color(0xFF10B981)
        : const Color(0xFFEF4444);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF151929),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF252940)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _FinStat(
              label: 'Cash',
              value: '\$${_state.cash.toStringAsFixed(0)}',
              color: const Color(0xFF10B981)),
          _FinStat(
              label: 'Debt',
              value: '\$${_state.debt.toStringAsFixed(0)}',
              color: _state.debt > 0
                  ? const Color(0xFFEF4444)
                  : Colors.white38),
          _FinStat(
              label: 'Net Worth',
              value: '\$${netWorth.toStringAsFixed(0)}',
              color: nwColor),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      decoration: BoxDecoration(
        color: const Color(0xFF151929),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: const Color(0xFF7C3AED),
          borderRadius: BorderRadius.circular(10),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white38,
        labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        tabs: const [
          Tab(text: '🌱 Life'),
          Tab(text: '💼 Career'),
          Tab(text: '📜 Journal'),
        ],
      ),
    );
  }

  Widget _buildLifeTab() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      children: [
        _buildStatsCard(),
        const SizedBox(height: 16),
        Text(
          'THIS MONTH\'S ACTIVITIES',
          style: GoogleFonts.rajdhani(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Colors.white38,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 0.85,
          ),
          itemCount: GameEngine.activities.length,
          itemBuilder: (context, i) {
            final activity = GameEngine.activities[i];
            final canAfford =
                _state.remainingEnergy >= activity.energyCost;
            final alreadyUsed = !activity.allowMultiple &&
                _state.usedActivitiesThisMonth.contains(activity.id);
            return ActivityCard(
              activity: activity,
              canAffordEnergy: canAfford,
              alreadyUsed: alreadyUsed,
              onTap: () => _doActivity(activity),
            );
          },
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildStatsCard() {
    final s = _state.stats;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151929),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF252940)),
      ),
      child: Column(
        children: [
          StatBar(
              label: 'Happiness',
              emoji: '😊',
              value: s.happiness,
              color: const Color(0xFFF59E0B)),
          const SizedBox(height: 12),
          StatBar(
              label: 'Health',
              emoji: '❤️',
              value: s.health,
              color: const Color(0xFFEF4444)),
          const SizedBox(height: 12),
          StatBar(
              label: 'Stress',
              emoji: '😰',
              value: s.stress,
              color: const Color(0xFF8B5CF6)),
          const SizedBox(height: 12),
          StatBar(
              label: 'Looks',
              emoji: '✨',
              value: s.looks,
              color: const Color(0xFF06B6D4)),
        ],
      ),
    );
  }

  Widget _buildCareerTab() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      children: [
        if (_state.currentJob != null) ...[
          _buildCurrentJobCard(),
          const SizedBox(height: 16),
          TextButton.icon(
            onPressed: () => _confirmQuit(),
            icon: const Icon(Icons.exit_to_app, color: Color(0xFFEF4444)),
            label: const Text('Quit current job',
                style: TextStyle(color: Color(0xFFEF4444))),
          ),
          const SizedBox(height: 8),
        ],
        Text(
          'JOB BOARD',
          style: GoogleFonts.rajdhani(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Colors.white38,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 10),
        ...GameEngine.availableJobs.map((job) => _buildJobListTile(job)),
      ],
    );
  }

  Widget _buildCurrentJobCard() {
    final job = _state.currentJob!;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A2140),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(job.emoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    job.title,
                    style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                  Text(
                    'CURRENT JOB',
                    style: TextStyle(
                        fontSize: 11,
                        color: const Color(0xFF7C3AED),
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1),
                  ),
                ],
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${job.monthlySalary.toStringAsFixed(0)}/mo',
                    style: const TextStyle(
                        color: Color(0xFF10B981),
                        fontWeight: FontWeight.bold,
                        fontSize: 15),
                  ),
                  Text('⚡ ${job.energyCost} energy',
                      style: const TextStyle(color: Colors.white38, fontSize: 12)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(job.description,
              style:
                  const TextStyle(color: Colors.white54, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildJobListTile(Job job) {
    final isCurrent = _state.currentJob?.id == job.id;
    return GestureDetector(
      onTap: isCurrent ? null : () => _confirmHire(job),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isCurrent
              ? const Color(0xFF7C3AED).withOpacity(0.1)
              : const Color(0xFF151929),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isCurrent
                ? const Color(0xFF7C3AED).withOpacity(0.5)
                : const Color(0xFF252940),
          ),
        ),
        child: Row(
          children: [
            Text(job.emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(job.title,
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isCurrent ? Colors.white54 : Colors.white,
                          fontSize: 15)),
                  const SizedBox(height: 3),
                  Text(job.description,
                      style: const TextStyle(
                          color: Colors.white38, fontSize: 12)),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      Text('⚡ ${job.energyCost}',
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 11)),
                      const SizedBox(width: 10),
                      Text('😰 +${job.monthlyStressGain.toStringAsFixed(0)}/mo',
                          style: const TextStyle(
                              color: Colors.white38, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '\$${job.monthlySalary.toStringAsFixed(0)}',
              style: const TextStyle(
                  color: Color(0xFF10B981),
                  fontWeight: FontWeight.bold,
                  fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJournalTab() {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      itemCount: _state.logHistory.length,
      separatorBuilder: (_, __) =>
          const Divider(color: Colors.white10, height: 1),
      itemBuilder: (context, i) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Text(
            _state.logHistory[i],
            style: TextStyle(
              color: i == 0 ? Colors.white70 : Colors.white38,
              fontSize: 13,
              height: 1.4,
            ),
          ),
        );
      },
    );
  }

  Widget _buildEndMonthButton() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _endMonth,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF7C3AED),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: Text(
            'END MONTH →',
            style: GoogleFonts.rajdhani(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
            ),
          ),
        ),
      ),
    );
  }

  void _confirmHire(Job job) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF151929),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('${job.emoji} Apply for ${job.title}?',
            style: const TextStyle(color: Colors.white)),
        content: Text(
          'Salary: \$${job.monthlySalary.toStringAsFixed(0)}/mo\n'
          'Energy cost: ${job.energyCost}/month\n'
          'Monthly stress: +${job.monthlyStressGain.toStringAsFixed(0)}',
          style: const TextStyle(color: Colors.white54),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _applyJobChange(job);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED)),
            child: const Text('Accept Job'),
          ),
        ],
      ),
    );
  }

  void _confirmQuit() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF151929),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Quit your job?',
            style: TextStyle(color: Colors.white)),
        content: const Text(
          'You\'ll lose your salary next month. Make sure you can cover bills.',
          style: TextStyle(color: Colors.white54),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _applyJobChange(null);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444)),
            child: const Text('Quit'),
          ),
        ],
      ),
    );
  }
}

class _FinStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _FinStat(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label,
            style: const TextStyle(color: Colors.white38, fontSize: 11)),
        const SizedBox(height: 3),
        Text(value,
            style: TextStyle(
                color: color, fontWeight: FontWeight.bold, fontSize: 15)),
      ],
    );
  }
}
