import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { DashboardService } from './dashboard.service'
import { IEngagementQuery } from './dashboard.interface'

const getDashboardPage = catchAsync(async (req: Request, res: Response) => {
  // This would render a dashboard page if you're using a template engine
  // For now, we'll return a simple HTML response with placeholders
  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NCLEX Prep Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .stats-container { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
            .stat-label { color: #6b7280; margin-top: 5px; }
            .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .year-selector { margin-bottom: 20px; }
            select { padding: 8px 12px; border-radius: 4px; border: 1px solid #d1d5db; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>NCLEX Prep Dashboard</h1>

            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-number" id="totalUsers">-</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalQuestions">-</div>
                    <div class="stat-label">Total Questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalLessons">-</div>
                    <div class="stat-label">Study Lessons</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="year-selector">
                    <label for="yearSelect">Select Year: </label>
                    <select id="yearSelect">
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>
                <canvas id="engagementChart" width="400" height="200"></canvas>
            </div>
        </div>

        <script>
            let chart;

            async function loadDashboardData(year = new Date().getFullYear()) {
                try {
                    const response = await fetch('/api/dashboard/data?year=' + year);
                    const data = await response.json();

                    // Update stats
                    document.getElementById('totalUsers').textContent = data.data.stats.totalUsers;
                    document.getElementById('totalQuestions').textContent = data.data.stats.totalQuestions;
                    document.getElementById('totalLessons').textContent = data.data.stats.totalStudyLessons;

                    // Update chart
                    updateChart(data.data.userEngagement);
                } catch (error) {
                    console.error('Error loading dashboard data:', error);
                }
            }

            function updateChart(engagementData) {
                const ctx = document.getElementById('engagementChart').getContext('2d');

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: engagementData.map(item => item.month),
                        datasets: [
                            {
                                label: 'Active Users',
                                data: engagementData.map(item => item.activeUsers),
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.1
                            },
                            {
                                label: 'New Users',
                                data: engagementData.map(item => item.userCount),
                                borderColor: 'rgb(255, 99, 132)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                tension: 0.1
                            },
                            {
                                label: 'Questions Answered',
                                data: engagementData.map(item => item.questionsAnswered),
                                borderColor: 'rgb(54, 162, 235)',
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                tension: 0.1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'User Engagement Over Time'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Event listeners
            document.getElementById('yearSelect').addEventListener('change', function(e) {
                loadDashboardData(parseInt(e.target.value));
            });

            // Load initial data
            loadDashboardData();
        </script>
    </body>
    </html>
  `

  res.send(htmlResponse)
})

const getDashboardData = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query as IEngagementQuery

  const result = await DashboardService.getDashboardData(
    year ? parseInt(year.toString()) : undefined,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: result,
  })
})

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardStats()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  })
})

const getUserEngagement = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query as IEngagementQuery

  const result = await DashboardService.getUserEngagementByYear(
    year ? parseInt(year.toString()) : undefined,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User engagement data retrieved successfully',
    data: result,
  })
})

export const DashboardController = {
  getDashboardPage,
  getDashboardData,
  getDashboardStats,
  getUserEngagement,
}
