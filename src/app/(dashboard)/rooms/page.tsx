import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { formatTime12h } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayEvents = await prisma.event.findMany({
    where: {
      OR: [
        { date: today },
        { isRecurring: true, dayOfWeek: new Date().getDay() }
      ]
    },
    orderBy: { startTime: 'asc' }
  });

  const sem1 = todayEvents.filter((e: any) => e.room === 'SEMINAR_1');
  const sem2 = todayEvents.filter((e: any) => e.room === 'SEMINAR_2');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Seminar Rooms</h2>
        <p className="text-sm text-gray-400 mt-1">Today's Schedule ({format(new Date(), 'MMMM d, yyyy')})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seminar 1 */}
        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="bg-blue-900 p-4 border-b border-blue-800">
            <h3 className="text-lg font-bold text-white">Seminar 1</h3>
            <p className="text-blue-300 text-sm">Primary Room</p>
          </div>
          <div className="p-4 space-y-3">
            {sem1.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for today.</p>
            ) : (
              sem1.map((event: any) => (
                <div key={event.id} className="p-3 bg-blue-900/30 border border-blue-900 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-blue-300">{event.name}</div>
                    <div className="flex items-center text-xs text-blue-400 mt-1 font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-800 text-xs font-bold rounded-md">
                    {event.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seminar 2 */}
        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="bg-emerald-900 p-4 border-b border-emerald-800">
            <h3 className="text-lg font-bold text-white">Seminar 2</h3>
            <p className="text-emerald-300 text-sm">Backup Room</p>
          </div>
          <div className="p-4 space-y-3">
            {sem2.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for today.</p>
            ) : (
              sem2.map((event: any) => (
                <div key={event.id} className="p-3 bg-emerald-900/30 border border-emerald-900 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold text-emerald-300">{event.name}</div>
                    <div className="flex items-center text-xs text-emerald-400 mt-1 font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-900/50 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-md">
                    {event.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
