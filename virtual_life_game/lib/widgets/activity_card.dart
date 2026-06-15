import 'package:flutter/material.dart';
import '../models.dart';

class ActivityCard extends StatelessWidget {
  final Activity activity;
  final bool canAffordEnergy;
  final bool alreadyUsed;
  final VoidCallback onTap;

  const ActivityCard({
    super.key,
    required this.activity,
    required this.canAffordEnergy,
    required this.alreadyUsed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool locked = !canAffordEnergy || alreadyUsed;

    return GestureDetector(
      onTap: locked ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: locked
              ? const Color(0xFF1A1E2E)
              : const Color(0xFF1E2340),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: locked
                ? Colors.white10
                : const Color(0xFF7C3AED).withOpacity(0.4),
            width: 1,
          ),
        ),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(activity.emoji, style: const TextStyle(fontSize: 26)),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: locked
                        ? Colors.white10
                        : const Color(0xFF7C3AED).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '⚡ ${activity.energyCost}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: locked ? Colors.white30 : const Color(0xFFBFA0FF),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              activity.name,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: locked ? Colors.white30 : Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              alreadyUsed ? 'Done this month' : activity.description,
              style: TextStyle(
                fontSize: 12,
                color: locked ? Colors.white20 : Colors.white54,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),
            _buildStatChanges(locked),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChanges(bool locked) {
    final color = locked ? Colors.white20 : Colors.white54;
    List<Widget> chips = [];

    void addChip(double val, String label) {
      if (val == 0) return;
      final isPos = val > 0;
      chips.add(Text(
        '${isPos ? '+' : ''}${val.toStringAsFixed(0)} $label',
        style: TextStyle(
          fontSize: 11,
          color: locked
              ? Colors.white20
              : (isPos ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
        ),
      ));
    }

    if (activity.cashChange != 0) {
      final isPos = activity.cashChange > 0;
      chips.add(Text(
        '${isPos ? '+' : ''}\$${activity.cashChange.abs().toStringAsFixed(0)}',
        style: TextStyle(
          fontSize: 11,
          color: locked
              ? Colors.white20
              : (isPos ? const Color(0xFF10B981) : const Color(0xFFEF4444)),
        ),
      ));
    }
    addChip(activity.happinessChange, '😊');
    addChip(activity.healthChange, '❤️');
    addChip(activity.stressChange, '😰');
    addChip(activity.looksChange, '✨');

    return Wrap(spacing: 8, runSpacing: 4, children: chips);
  }
}
