import React, { useEffect, useState } from 'react';
import { Users, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user.types';
import { studentService } from '../services/student.service';
import { classService } from '../services/class.service';
import { attendanceService } from '../services/attendance.service';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    todayAttendance: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === UserRole.PRINCIPAL) {
          const [studentsRes, classesRes] = await Promise.all([
            studentService.getAllStudents(),
            classService.getAllClasses(),
          ]);

          setStats({
            totalStudents: studentsRes.count || 0,
            totalClasses: classesRes.count || 0,
            todayAttendance: 0,
            attendanceRate: 85,
          });
        } else if (user?.role === UserRole.TEACHER) {
          const studentsRes = await studentService.getAllStudents();
          setStats({
            totalStudents: studentsRes.count || 0,
            totalClasses: 2,
            todayAttendance: 45,
            attendanceRate: 92,
          });
        } else if (user?.role === UserRole.STUDENT) {
          // Student-specific stats
          const attendanceRes = await attendanceService.getAttendanceStats(user.id);
          setStats({
            totalStudents: 1,
            totalClasses: 1,
            todayAttendance: attendanceRes.data?.presentDays || 0,
            attendanceRate: attendanceRes.data?.attendancePercentage || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getWelcomeMessage = () => {
    if (!user) return '';
    
    const hour = new Date().getHours();
    let greeting = 'Good ';
    
    if (hour < 12) greeting += 'Morning';
    else if (hour < 18) greeting += 'Afternoon';
    else greeting += 'Evening';

    return `${greeting}, ${user.fullName || 'User'}`;
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case UserRole.PRINCIPAL:
        return {
          title: 'Principal Dashboard',
          description: 'Overview of school management and analytics',
          cards: [
            {
              icon: <Users className="h-8 w-8 text-blue-600" />,
              title: 'Total Students',
              value: stats.totalStudents.toString(),
              change: '+12%',
              color: 'blue',
            },
            {
              icon: <BookOpen className="h-8 w-8 text-green-600" />,
              title: 'Classes',
              value: stats.totalClasses.toString(),
              change: '+2',
              color: 'green',
            },
            {
              icon: <Calendar className="h-8 w-8 text-purple-600" />,
              title: 'Today\'s Attendance',
              value: `${stats.todayAttendance}%`,
              change: '+5%',
              color: 'purple',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
              title: 'Overall Attendance Rate',
              value: `${stats.attendanceRate}%`,
              change: '+3%',
              color: 'orange',
            },
          ],
        };
      case UserRole.TEACHER:
        return {
          title: 'Teacher Dashboard',
          description: 'Manage your classes and students',
          cards: [
            {
              icon: <Users className="h-8 w-8 text-blue-600" />,
              title: 'My Students',
              value: stats.totalStudents.toString(),
              change: '',
              color: 'blue',
            },
            {
              icon: <BookOpen className="h-8 w-8 text-green-600" />,
              title: 'Assigned Classes',
              value: stats.totalClasses.toString(),
              change: '',
              color: 'green',
            },
            {
              icon: <Calendar className="h-8 w-8 text-purple-600" />,
              title: 'Today\'s Attendance',
              value: `${stats.todayAttendance}/50`,
              change: '2 absent',
              color: 'purple',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
              title: 'Class Average',
              value: `${stats.attendanceRate}%`,
              change: '+2%',
              color: 'orange',
            },
          ],
        };
      case UserRole.STUDENT:
        return {
          title: 'Student Dashboard',
          description: 'Your academic overview',
          cards: [
            {
              icon: <Calendar className="h-8 w-8 text-blue-600" />,
              title: 'Total Days Present',
              value: stats.todayAttendance.toString(),
              change: '',
              color: 'blue',
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-green-600" />,
              title: 'Attendance Percentage',
              value: `${stats.attendanceRate}%`,
              change: '',
              color: 'green',
            },
            {
              icon: <BookOpen className="h-8 w-8 text-purple-600" />,
              title: 'Current Class',
              value: '10-A',
              change: '',
              color: 'purple',
            },
            {
              icon: <Users className="h-8 w-8 text-orange-600" />,
              title: 'Class Rank',
              value: '15/50',
              change: '+2',
              color: 'orange',
            },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          description: '',
          cards: [],
        };
    }
  };

  const content = getRoleSpecificContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{getWelcomeMessage()}</h1>
        <p className="text-gray-600 mt-2">{content.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {content.cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gray-50">
                {card.icon}
              </div>
              {card.change && (
                <span className={`text-sm font-medium ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === UserRole.PRINCIPAL && (
            <>
              <button className="bg-primary-50 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <div className="font-medium">Add New Student</div>
                <div className="text-sm text-primary-600">Register a new student</div>
              </button>
              <button className="bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors text-left">
                <div className="font-medium">Create Class</div>
                <div className="text-sm text-green-600">Add new class/section</div>
              </button>
              <button className="bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-purple-600">Generate analytics</div>
              </button>
            </>
          )}
          {user?.role === UserRole.TEACHER && (
            <>
              <button className="bg-primary-50 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <div className="font-medium">Mark Attendance</div>
                <div className="text-sm text-primary-600">For today's class</div>
              </button>
              <button className="bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors text-left">
                <div className="font-medium">View Students</div>
                <div className="text-sm text-green-600">Class list and details</div>
              </button>
              <button className="bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <div className="font-medium">Add Remarks</div>
                <div className="text-sm text-purple-600">Student behavior notes</div>
              </button>
            </>
          )}
          {user?.role === UserRole.STUDENT && (
            <>
              <button className="bg-primary-50 text-primary-700 px-4 py-3 rounded-lg hover:bg-primary-100 transition-colors text-left">
                <div className="font-medium">View Attendance</div>
                <div className="text-sm text-primary-600">Check your attendance</div>
              </button>
              <button className="bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors text-left">
                <div className="font-medium">Timetable</div>
                <div className="text-sm text-green-600">Daily schedule</div>
              </button>
              <button className="bg-purple-50 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <div className="font-medium">Results</div>
                <div className="text-sm text-purple-600">Exam scores</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;