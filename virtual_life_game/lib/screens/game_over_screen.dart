import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models.dart';
import '../game_engine.dart';
import 'game_screen.dart';

class GameOverScreen extends StatelessWidget {
  final GameState state;
  final bool didWin;

  const GameOverScreen({
    super.key,
    required this.state,
    required this.didWin,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  didWin ? '🏆' : (state.isDead ? '💀' : '💸'),
                  style: const TextStyle(fontSize: 80),
                ),
                const SizedBox(height: 24),
                Text(
                  didWin ? 'LIFE WELL LIVED' : 'GAME OVER',
                  style: GoogleFonts.rajdhani(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: didWin
                        ? const Color(0xFFF59E0B)
                        : const Color(0xFFEF4444),
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  didWin
                      ? 'You reached retirement with wealth and happiness.'
                      : (state.isDead
                          ? 'Your health reached zero. Take better care of yourself.'
                          : 'You went bankrupt. Money problems spiral fast.'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white54, fontSize: 16),
                ),
                const SizedBox(height: 40),
                _StatRow('Age', state.formattedAge),
                _StatRow(
                    'Net Worth',
                    '\$${state.netWorth.toStringAsFixed(0)}',
                    color: state.netWorth >= 0
                        ? const Color(0xFF10B981)
                        : const Color(0xFFEF4444)),
                _StatRow('Happiness', '${state.stats.happiness.toStringAsFixed(0)}/100'),
                _StatRow('Health', '${state.stats.health.toStringAsFixed(0)}/100'),
                _StatRow('Looks', '${state.stats.looks.toStringAsFixed(0)}/100'),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (_) => GameScreen(
                            state: GameEngine.createInitialState(),
                          ),
                        ),
                        (_) => false,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C3AED),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      'PLAY AGAIN',
                      style: GoogleFonts.rajdhani(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _StatRow(this.label, this.value, {this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: Colors.white54, fontSize: 16)),
          Text(
            value,
            style: TextStyle(
              color: color ?? Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
