import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'game_engine.dart';
import 'screens/game_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const VirtualLifeApp());
}

class VirtualLifeApp extends StatelessWidget {
  const VirtualLifeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Virtual Life',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0E1A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF7C3AED),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF151929),
          error: Color(0xFFEF4444),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        cardTheme: CardTheme(
          color: const Color(0xFF151929),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFF252940), width: 1),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0A0E1A),
          elevation: 0,
        ),
        dialogTheme: DialogTheme(
          backgroundColor: const Color(0xFF151929),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: Color(0xFF252940),
          contentTextStyle: TextStyle(color: Colors.white70),
          behavior: SnackBarBehavior.floating,
        ),
      ),
      home: const StartScreen(),
    );
  }
}

class StartScreen extends StatelessWidget {
  const StartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              const Spacer(flex: 2),
              const Text('🌟', style: TextStyle(fontSize: 80)),
              const SizedBox(height: 24),
              Text(
                'VIRTUAL LIFE',
                style: GoogleFonts.rajdhani(
                  fontSize: 46,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF7C3AED),
                  letterSpacing: 6,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Your choices define your story.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white38, fontSize: 16),
              ),
              const SizedBox(height: 48),
              _FeatureRow('💼', 'Pick a career and climb the ladder'),
              const SizedBox(height: 12),
              _FeatureRow('🎲', 'Face random life events'),
              const SizedBox(height: 12),
              _FeatureRow('⚖️', 'Balance money, health & happiness'),
              const SizedBox(height: 12),
              _FeatureRow('🏆', 'Retire wealthy and fulfilled by 65'),
              const Spacer(flex: 3),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => GameScreen(
                          state: GameEngine.createInitialState(),
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    'BEGIN YOUR LIFE',
                    style: GoogleFonts.rajdhani(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  final String emoji;
  final String text;
  const _FeatureRow(this.emoji, this.text);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 20)),
        const SizedBox(width: 12),
        Text(text,
            style: const TextStyle(color: Colors.white54, fontSize: 15)),
      ],
    );
  }
}
