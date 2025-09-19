<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Report</title>
    <style>
        /* Using inline CSS is best for dompdf compatibility */
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .metrics-grid {
            width: 100%;
            border-spacing: 10px;
            border-collapse: separate;
        }
        .metric-card {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            padding: 15px;
            text-align: center;
            width: 22%;
        }
        .metric-card h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #555;
        }
        .metric-card p {
            margin: 0;
            font-size: 22px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Project Analytics Report</h1>
        <p><strong>Project:</strong> {{ $projectName }}</p>
        <p><strong>Date Range:</strong> {{ $dateRange }}</p>
        <p><em>Generated on: {{ now()->format('Y-m-d H:i:s') }}</em></p>
    </div>

    <div class="section">
        <h2 class="section-title">Key Metrics</h2>
        <table class="metrics-grid">
            <tr>
                <td class="metric-card">
                    <h3>Total Tasks</h3>
                    <p>{{ $metrics['totalTasks'] }}</p>
                </td>
                <td class="metric-card">
                    <h3>Completed Tasks</h3>
                    <p>{{ $metrics['completedTasks'] }}</p>
                </td>
                <td class="metric-card">
                    <h3>In Progress Tasks</h3>
                    <p>{{ $metrics['inProgressTasks'] }}</p>
                </td>
                <td class="metric-card">
                    <h3>Avg. Cycle Time</h3>
                    <p>{{ $metrics['avgCycleTime'] ?? 'N/A' }} days</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Team Performance</h2>
        @if(count($teamPerformance) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Team Member</th>
                        <th>Role</th>
                        <th>Tasks Completed</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($teamPerformance as $member)
                        <tr>
                            <td>{{ $member['name'] }}</td>
                            <td>{{ $member['role'] }}</td>
                            <td>{{ $member['tasksCompleted'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No team performance data available for this period.</p>
        @endif
    </div>

    <div class="section">
        <h2 class="section-title">Task Status Distribution</h2>
        @if(count($taskDistribution) > 0)
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Number of Tasks</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($taskDistribution as $status => $count)
                        <tr>
                            <td>{{ ucfirst(str_replace('_', ' ', $status)) }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No task distribution data available for this period.</p>
        @endif
    </div>

    <div class="footer">
        ProjectIve | Confidential Report
    </div>
</body>
</html>