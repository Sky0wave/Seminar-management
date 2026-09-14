import { getEventsForWeek, deleteEvent } from '@/lib/actions';
import { format, addDays } from 'date-fns';
import { Clock, MapPin, Trash2 } from 'lucide-react';
import { formatTime12h } from '@/lib/time';

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const currentDate = (await searchParams).date || format(new Date(), 'yyyy-MM-dd');
  const { recurringEvents, oneTimeEvents, weekStart } = await getEventsForWeek(currentDate);

  // Generate the 6 days of the week (Monday to Saturday)
  const actualDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i));

  // Time slots from 08:00 to 17:00
  const timeSlots = Array.from({ length: 10 }).map((_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Weekly Timetable</h2>
          <p className="text-sm text-gray-400 mt-1">
            {format(actualDays[0], 'MMMM d')} - {format(actualDays[5], 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={`/?date=${format(addDays(weekStart, -7), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            Previous
          </a>
          <a
            href={`/?date=${format(new Date(), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-950/50 border border-blue-800 rounded-lg hover:bg-blue-900/50"
          >
            Today
          </a>
          <a
            href={`/?date=${format(addDays(weekStart, 7), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            Next
          </a>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-x-auto relative">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-950/50">
            <div className="p-4 border-r border-gray-800 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</span>
            </div>
            {actualDays.map((day) => (
              <div key={day.toString()} className="p-4 border-r border-gray-800 last:border-r-0 text-center">
                <div className="text-sm font-bold text-white">{format(day, 'EEEE')}</div>
                <div className="text-xs font-medium text-gray-400 mt-0.5">{format(day, 'MMM d')}</div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="relative">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-7 border-b border-gray-800 last:border-b-0 min-h-[100px]">
                <div className="border-r border-gray-800 p-2 flex justify-center text-xs font-semibold text-gray-400 bg-gray-950/50">
                  {formatTime12h(time)}
                </div>
                {actualDays.map((day, dayIndex) => {
                  const dayOfWeek = dayIndex + 1; // 1=Mon, 6=Sat
                  
                  // Find events starting in this hour block
                  const dayRecEvents = recurringEvents.filter((e: any) => 
                    e.dayOfWeek === dayOfWeek && e.startTime.startsWith(time.split(':')[0])
                  );
                  const dayOneTimeEvents = oneTimeEvents.filter((e: any) => 
                    e.date === format(day, 'yyyy-MM-dd') && e.startTime.startsWith(time.split(':')[0])
                  );
                  const allBlockEvents = [...dayRecEvents, ...dayOneTimeEvents];

                  return (
                    <div key={`${day}-${time}`} className="border-r border-gray-800 last:border-r-0 p-1 relative group">
                      {allBlockEvents.map((event: any) => {
                        const isSeminar1 = event.room === 'SEMINAR_1';
                        return (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg border text-left mb-1 shadow-sm transition-all hover:shadow-md ${
                              isSeminar1 
                                ? 'bg-blue-900/40 border-blue-800' 
                                : 'bg-emerald-900/40 border-emerald-800'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className={`font-bold text-xs line-clamp-2 ${isSeminar1 ? 'text-blue-300' : 'text-emerald-300'}`}>
                                {event.name}
                              </div>
                              <form action={async () => {
                                'use server';
                                await deleteEvent(event.id);
                              }}>
                                <button type="submit" className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </form>
                            </div>
                            <div className={`flex items-center text-[10px] mt-1 font-medium ${isSeminar1 ? 'text-blue-400' : 'text-emerald-400'}`}>
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}
                            </div>
                            <div className={`flex items-center text-[10px] mt-0.5 font-medium ${isSeminar1 ? 'text-blue-400' : 'text-emerald-400'}`}>
                              <MapPin className="h-2.5 w-2.5 mr-1" />
                              {isSeminar1 ? 'Seminar 1' : 'Seminar 2'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
