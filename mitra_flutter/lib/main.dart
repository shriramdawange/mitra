import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MitraApp());
}

class MitraApp extends StatelessWidget {
  const MitraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Mitra',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        scaffoldBackgroundColor: const Color(0xFFF5F7FC),
      ),
      home: const MitraHomePage(),
    );
  }
}

class ApiClient {
  static const String _base = String.fromEnvironment(
    'MITRA_API_BASE_URL',
    defaultValue: 'http://127.0.0.1:3000',
  );

  Uri _uri(String path) => Uri.parse('$_base$path');

  Future<Map<String, dynamic>> getJson(String path) async {
    final response = await http.get(_uri(path));
    if (response.statusCode >= 400) throw Exception(response.body);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      _uri(path),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode >= 400) throw Exception(response.body);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> patchJson(String path, Map<String, dynamic> body) async {
    final response = await http.patch(
      _uri(path),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (response.statusCode >= 400) throw Exception(response.body);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}

class MitraHomePage extends StatefulWidget {
  const MitraHomePage({super.key});

  @override
  State<MitraHomePage> createState() => _MitraHomePageState();
}

class _MitraHomePageState extends State<MitraHomePage> {
  int _index = 0;

  final _pages = const [
    DashboardTab(),
    GoalsTab(),
    PlannerTab(),
    GrowthTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(CupertinoIcons.chart_bar_alt_fill), label: 'Dashboard'),
          NavigationDestination(icon: Icon(CupertinoIcons.flag_fill), label: 'Goals'),
          NavigationDestination(icon: Icon(CupertinoIcons.calendar), label: 'Planner'),
          NavigationDestination(icon: Icon(CupertinoIcons.sparkles), label: 'Growth'),
        ],
      ),
    );
  }
}

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  final api = ApiClient();
  Map<String, dynamic>? stats;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() => loading = true);
    try {
      final json = await api.getJson('/api/mitra/dashboard');
      setState(() {
        stats = json['stats'] as Map<String, dynamic>?;
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Mitra', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Personal growth, productivity and planning', style: TextStyle(color: Colors.black54)),
            const SizedBox(height: 16),
            if (loading)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
            else
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  statCard('Goals', '${stats?['goalsCompleted'] ?? 0}/${stats?['totalGoals'] ?? 0}'),
                  statCard('Habits Today', '${stats?['habitsToday'] ?? 0}/${stats?['totalHabits'] ?? 0}'),
                  statCard('Todos', '${stats?['todosDone'] ?? 0}/${stats?['totalTodos'] ?? 0}'),
                  statCard('Reminders', '${stats?['pendingReminders'] ?? 0} pending'),
                  statCard('Learning Active', '${stats?['learningActive'] ?? 0}'),
                  statCard('Goal Logs Today', '${stats?['todayGoalLogs'] ?? 0}'),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget statCard(String label, String value) {
    return Container(
      width: 170,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 14, offset: Offset(0, 6))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.black54)),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}

class GoalsTab extends StatefulWidget {
  const GoalsTab({super.key});

  @override
  State<GoalsTab> createState() => _GoalsTabState();
}

class _GoalsTabState extends State<GoalsTab> {
  final api = ApiClient();
  final title = TextEditingController();
  final description = TextEditingController();
  List<dynamic> goals = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() => loading = true);
    try {
      final json = await api.getJson('/api/mitra/goals');
      setState(() => goals = (json['data'] as List<dynamic>? ?? []));
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> addGoal() async {
    if (title.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/goals', {
      'title': title.text,
      'description': description.text,
    });
    title.clear();
    description.clear();
    await load();
  }

  Future<void> toggleGoal(Map<String, dynamic> goal) async {
    await api.patchJson('/api/mitra/goals', {
      'id': goal['id'],
      'completed': !(goal['completed'] as bool? ?? false),
    });
    await load();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Daily Goals', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            input(title, 'Goal title'),
            const SizedBox(height: 8),
            input(description, 'Description'),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: addGoal, child: const Text('Add Goal')),
            const SizedBox(height: 12),
            if (loading) const Center(child: CircularProgressIndicator()),
            ...goals.map((item) {
              final goal = item as Map<String, dynamic>;
              final completed = goal['completed'] as bool? ?? false;
              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: ListTile(
                  title: Text(goal['title']?.toString() ?? ''),
                  subtitle: Text(goal['description']?.toString() ?? ''),
                  trailing: CupertinoSwitch(
                    value: completed,
                    onChanged: (_) => toggleGoal(goal),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class PlannerTab extends StatefulWidget {
  const PlannerTab({super.key});

  @override
  State<PlannerTab> createState() => _PlannerTabState();
}

class _PlannerTabState extends State<PlannerTab> {
  final api = ApiClient();

  final todoTitle = TextEditingController();
  final eventTitle = TextEditingController();
  final eventDate = TextEditingController();
  final reminderTitle = TextEditingController();

  List<dynamic> todos = [];
  List<dynamic> events = [];
  List<dynamic> reminders = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    final t = await api.getJson('/api/mitra/todos');
    final e = await api.getJson('/api/mitra/calendar-events');
    final r = await api.getJson('/api/mitra/reminders');
    setState(() {
      todos = (t['data'] as List<dynamic>? ?? []);
      events = (e['data'] as List<dynamic>? ?? []);
      reminders = (r['data'] as List<dynamic>? ?? []);
    });
  }

  Future<void> addTodo() async {
    if (todoTitle.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/todos', {'title': todoTitle.text, 'priority': 'medium'});
    todoTitle.clear();
    await load();
  }

  Future<void> addEvent() async {
    if (eventTitle.text.trim().isEmpty || eventDate.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/calendar-events', {'title': eventTitle.text, 'eventDate': eventDate.text});
    eventTitle.clear();
    eventDate.clear();
    await load();
  }

  Future<void> addReminder() async {
    if (reminderTitle.text.trim().isEmpty) return;
    final now = DateTime.now().add(const Duration(hours: 1)).toIso8601String();
    await api.postJson('/api/mitra/reminders', {'title': reminderTitle.text, 'remindAt': now});
    reminderTitle.clear();
    await load();
  }

  Future<void> toggleTodo(Map<String, dynamic> todo) async {
    await api.patchJson('/api/mitra/todos', {'id': todo['id'], 'done': !(todo['done'] as bool? ?? false)});
    await load();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Planner', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            section(
              'Todo List',
              Column(children: [
                input(todoTitle, 'Task title'),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: addTodo, child: const Text('Add Todo')),
                ...todos.take(5).map((item) {
                  final todo = item as Map<String, dynamic>;
                  return CheckboxListTile(
                    value: todo['done'] as bool? ?? false,
                    onChanged: (_) => toggleTodo(todo),
                    title: Text(todo['title']?.toString() ?? ''),
                  );
                }),
              ]),
            ),
            section(
              'Calendar',
              Column(children: [
                input(eventTitle, 'Event title'),
                const SizedBox(height: 8),
                input(eventDate, 'Event date (YYYY-MM-DD)'),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: addEvent, child: const Text('Add Event')),
                ...events.take(5).map((item) {
                  final event = item as Map<String, dynamic>;
                  return ListTile(
                    leading: const Icon(CupertinoIcons.calendar),
                    title: Text(event['title']?.toString() ?? ''),
                    subtitle: Text(event['eventDate']?.toString() ?? ''),
                  );
                }),
              ]),
            ),
            section(
              'Reminders',
              Column(children: [
                input(reminderTitle, 'Reminder title'),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: addReminder, child: const Text('Quick Add Reminder')),
                ...reminders.take(5).map((item) {
                  final reminder = item as Map<String, dynamic>;
                  return ListTile(
                    leading: const Icon(CupertinoIcons.bell_fill),
                    title: Text(reminder['title']?.toString() ?? ''),
                    subtitle: Text(reminder['remindAt']?.toString() ?? ''),
                  );
                }),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}

class GrowthTab extends StatefulWidget {
  const GrowthTab({super.key});

  @override
  State<GrowthTab> createState() => _GrowthTabState();
}

class _GrowthTabState extends State<GrowthTab> {
  final api = ApiClient();

  final habitName = TextEditingController();
  final learningTitle = TextEditingController();
  final resourceTitle = TextEditingController();
  final reflection = TextEditingController();
  final opportunityField = TextEditingController();
  final opportunityTitle = TextEditingController();

  List<dynamic> habits = [];
  List<dynamic> learning = [];
  List<dynamic> resources = [];
  List<dynamic> logs = [];
  List<dynamic> opportunities = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    final h = await api.getJson('/api/mitra/habits');
    final l = await api.getJson('/api/mitra/learning-items');
    final r = await api.getJson('/api/mitra/resources');
    final d = await api.getJson('/api/mitra/development-logs');
    final o = await api.getJson('/api/mitra/opportunities');
    setState(() {
      habits = (h['data'] as List<dynamic>? ?? []);
      learning = (l['data'] as List<dynamic>? ?? []);
      resources = (r['data'] as List<dynamic>? ?? []);
      logs = (d['data'] as List<dynamic>? ?? []);
      opportunities = (o['data'] as List<dynamic>? ?? []);
    });
  }

  Future<void> addHabit() async {
    if (habitName.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/habits', {'name': habitName.text, 'category': 'General'});
    habitName.clear();
    await load();
  }

  Future<void> checkHabit(Map<String, dynamic> habit) async {
    await api.patchJson('/api/mitra/habits', {'habitId': habit['id']});
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Habit checked for today')));
  }

  Future<void> addLearning() async {
    if (learningTitle.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/learning-items', {'title': learningTitle.text, 'status': 'planned'});
    learningTitle.clear();
    await load();
  }

  Future<void> addResource() async {
    if (resourceTitle.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/resources', {'title': resourceTitle.text, 'kind': 'pdf'});
    resourceTitle.clear();
    await load();
  }

  Future<void> addReflection() async {
    if (reflection.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/development-logs', {
      'focusArea': 'Personal Development',
      'reflection': reflection.text,
      'mood': 'good',
    });
    reflection.clear();
    await load();
  }

  Future<void> addOpportunity() async {
    if (opportunityField.text.trim().isEmpty || opportunityTitle.text.trim().isEmpty) return;
    await api.postJson('/api/mitra/opportunities', {
      'field': opportunityField.text,
      'title': opportunityTitle.text,
      'location': 'Remote',
    });
    opportunityField.clear();
    opportunityTitle.clear();
    await load();
  }

  Future<void> fetchOpportunityUpdates(Map<String, dynamic> opportunity) async {
    await api.postJson('/api/mitra/opportunities/${opportunity['id']}/updates', {
      'field': opportunity['field'],
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opportunity updates refreshed')));
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Growth', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            section('Habits', Column(children: [
              input(habitName, 'Habit name'),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: addHabit, child: const Text('Add Habit')),
              ...habits.take(4).map((item) {
                final h = item as Map<String, dynamic>;
                return ListTile(
                  title: Text(h['name']?.toString() ?? ''),
                  subtitle: Text(h['category']?.toString() ?? ''),
                  trailing: IconButton(
                    icon: const Icon(CupertinoIcons.check_mark_circled_solid),
                    onPressed: () => checkHabit(h),
                  ),
                );
              }),
            ])),
            section('Learning List', Column(children: [
              input(learningTitle, 'Learning topic'),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: addLearning, child: const Text('Add Learning Item')),
              ...learning.take(4).map((item) {
                final l = item as Map<String, dynamic>;
                return ListTile(title: Text(l['title']?.toString() ?? ''), subtitle: Text(l['status']?.toString() ?? ''));
              }),
            ])),
            section('PDF / Wishlist', Column(children: [
              input(resourceTitle, 'Resource title'),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: addResource, child: const Text('Save Resource')),
              ...resources.take(4).map((item) {
                final r = item as Map<String, dynamic>;
                return ListTile(title: Text(r['title']?.toString() ?? ''), subtitle: Text(r['kind']?.toString() ?? ''));
              }),
            ])),
            section('Personal Development', Column(children: [
              input(reflection, 'Today reflection'),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: addReflection, child: const Text('Save Reflection')),
              ...logs.take(3).map((item) {
                final d = item as Map<String, dynamic>;
                return ListTile(title: Text(d['focusArea']?.toString() ?? ''), subtitle: Text(d['reflection']?.toString() ?? ''));
              }),
            ])),
            section('Opportunities', Column(children: [
              input(opportunityField, 'Field (AI, Flutter, Design)'),
              const SizedBox(height: 8),
              input(opportunityTitle, 'Opportunity title'),
              const SizedBox(height: 8),
              ElevatedButton(onPressed: addOpportunity, child: const Text('Add Opportunity')),
              ...opportunities.take(4).map((item) {
                final o = item as Map<String, dynamic>;
                return ListTile(
                  title: Text(o['title']?.toString() ?? ''),
                  subtitle: Text(o['field']?.toString() ?? ''),
                  trailing: TextButton(
                    onPressed: () => fetchOpportunityUpdates(o),
                    child: const Text('Fetch Updates'),
                  ),
                );
              }),
            ])),
          ],
        ),
      ),
    );
  }
}

Widget section(String title, Widget child) {
  return Container(
    margin: const EdgeInsets.only(bottom: 14),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      boxShadow: const [BoxShadow(color: Color(0x12000000), blurRadius: 12, offset: Offset(0, 6))],
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      child,
    ]),
  );
}

Widget input(TextEditingController controller, String hint) {
  return TextField(
    controller: controller,
    decoration: InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: const Color(0xFFF3F4F8),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
    ),
  );
}
