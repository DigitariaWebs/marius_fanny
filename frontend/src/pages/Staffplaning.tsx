import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";
import { authClient } from "../lib/AuthClient";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: "kitchen_staff" | "customer_service";
  status: "active" | "busy" | "offline";
  createdAt: string;
  updatedAt: string;
}

interface UserWithRole {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
}

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  role: string;
  staff: string;
}

const MOCK_SHIFTS: Shift[] = [
  { id: "1", date: "2026-02-10", startTime: "08:00", endTime: "16:00", location: "Montreal", role: "Production", staff: "Chef Antoine" },
  { id: "2", date: "2026-02-10", startTime: "09:00", endTime: "17:00", location: "Montreal", role: "Service Client", staff: "Marie Dupont" },
  { id: "3", date: "2026-02-12", startTime: "08:00", endTime: "16:00", location: "Laval", role: "Production", staff: "Chef Antoine" },
  { id: "4", date: "2026-02-15", startTime: "10:00", endTime: "18:00", location: "Montreal", role: "Production", staff: "Chef Antoine" },
  { id: "5", date: "2026-02-15", startTime: "09:00", endTime: "17:00", location: "Montreal", role: "Service Client", staff: "Sophie Bernard" },
];

export default function StaffPlanning() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts] = useState<Shift[]>(MOCK_SHIFTS);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data) {
          navigate("/se-connecter");
          return;
        }

        const sUser: UserWithRole = session.data.user;
        const userRole = sUser.user_metadata?.role || sUser.role || "kitchen_staff";

        const userData: Staff = {
          id: Number(sUser.id),
          firstName: sUser.user_metadata?.firstName || "Staff",
          lastName: sUser.user_metadata?.lastName || "Member",
          email: sUser.email,
          phone: "514-555-0100",
          location: "Montreal",
          role: userRole as "kitchen_staff" | "customer_service",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        navigate("/se-connecter");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getShiftsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return shifts.filter((shift) => shift.date === dateStr);
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/staff/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos horaires et disponibilités</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells before first day */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayShifts = getShiftsForDay(day);
                const isToday = 
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`
                      aspect-square border rounded-lg p-2 transition-all hover:shadow-md
                      ${isToday ? 'border-[#C5A065] bg-[#C5A065]/5' : 'border-gray-200 bg-white'}
                      ${dayShifts.length > 0 ? 'cursor-pointer' : ''}
                    `}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-[#C5A065]' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
                        >
                          <div className="font-medium truncate">{shift.role}</div>
                          <div className="flex items-center gap-1 text-[10px] text-blue-600">
                            <Clock className="w-3 h-3" />
                            {shift.startTime}-{shift.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shifts List */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Prochains quarts de travail</h3>
          <div className="space-y-3">
            {shifts
              .filter((shift) => new Date(shift.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((shift) => (
                <div key={shift.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{shift.role}</h4>
                      <span className="text-sm font-medium text-gray-500">
                        {new Date(shift.date).toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {shift.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {shift.staff}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}