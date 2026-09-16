import { getEventsForWeek, deleteEvent, getKolkataNow } from '@/lib/actions';
import { format, addDays } from 'date-fns';
import { Clock, MapPin, Trash2, X, Bell } from 'lucide-react';
import { formatTime12h } from '@/lib/time';
import AcceptEventButton from '@/components/AcceptEventButton';

export const dynamic = 'force-dynamic';

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const now = await getKolkataNow();
  const todayDateStr = format(now, 'yyyy-MM-dd');
  const currentDate = (await searchParams).date || todayDateStr;
  const { recurringEvents, oneTimeEvents, weekStart } = await getEventsForWeek(currentDate);

  // Generate the 6 days of the week (Monday to Saturday)
  const actualDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i));

  // Time slots from 08:00 to 17:00
  const timeSlots = Array.from({ length: 10 }).map((_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Calculate pending events in this view
  const pendingEvents = oneTimeEvents.filter((e: any) => e.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Pending Approval Notification Banner */}
      {pendingEvents.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/50 rounded-xl border border-red-700/60 text-red-400">
              <Bell className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-300">
                {pendingEvents.length} Event{pendingEvents.length > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-xs text-red-400/90 mt-0.5">
                Review below highlighted in <span className="font-semibold text-red-200">RED</span>. Click <span className="text-emerald-400 font-bold">✔ Accept</span> to approve (turns Green) or <span className="text-red-300 font-bold">✖ Delete</span> to reject.
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-red-900/60 text-red-200 border border-red-700">
            Action Required
          </div>
        </div>
      )}

      {/* Header and Week Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Weekly Timetable</h2>
          <p className="text-sm text-gray-400 mt-1">
            {format(actualDays[0], 'MMMM d')} - {format(actualDays[5], 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs bg-gray-900/90 px-4 py-2 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/40"></span>
            <span className="text-blue-300 font-medium">Today's Highlight (Blue)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-300 font-medium">Pending (Red)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-300 font-medium">Accepted (Green)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`/?date=${format(addDays(weekStart, -7), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Previous
          </a>
          <a
            href={`/?date=${todayDateStr}`}
            className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-950/50 border border-blue-800 rounded-lg hover:bg-blue-900/50 transition-colors"
          >
            Today
          </a>
          <a
            href={`/?date=${format(addDays(weekStart, 7), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Next
          </a>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-x-auto relative">
        <div className="min-w-[850px]">
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-950/60">
            <div className="p-4 border-r border-gray-800 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</span>
            </div>
            {actualDays.map((day) => {
              const isCurrentDay = format(day, 'yyyy-MM-dd') === todayDateStr;
              return (
                <div
                  key={day.toString()}
                  className={`p-3.5 border-r border-gray-800 last:border-r-0 text-center transition-colors relative ${
                    isCurrentDay
                      ? 'bg-blue-950/50 border-b-2 border-b-blue-500 shadow-sm'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1.5">
                    <span className={`text-sm font-bold ${isCurrentDay ? 'text-blue-300' : 'text-white'}`}>
                      {format(day, 'EEEE')}
                    </span>
                    {isCurrentDay && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-blue-600 text-white rounded-md shadow-sm">
                        Today
                      </span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 ${isCurrentDay ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
                    {format(day, 'MMM d')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="relative">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-7 border-b border-gray-800 last:border-b-0 min-h-[105px]">
                <div className="border-r border-gray-800 p-2 flex justify-center text-xs font-semibold text-gray-400 bg-gray-950/50">
                  {formatTime12h(time)}
                </div>
                {actualDays.map((day, dayIndex) => {
                  const isCurrentDay = format(day, 'yyyy-MM-dd') === todayDateStr;
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
                    <div
                      key={`${day}-${time}`}
                      className={`border-r border-gray-800 last:border-r-0 p-1.5 relative group space-y-1.5 transition-colors ${
                        isCurrentDay ? 'bg-blue-950/25' : ''
                      }`}
                    >
                      {allBlockEvents.map((event: any) => {
                        const isPending = event.status === 'PENDING';
                        const isSeminar1 = event.room === 'SEMINAR_1';

                        return (
                          <div
                            key={event.id}
                            className={`p-2.5 rounded-xl border text-left shadow-sm transition-all hover:shadow-md ${
                              isPending
                                ? 'bg-red-950/60 border-red-700/90 text-red-200'
                                : 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
                            } ${
                              isCurrentDay
                                ? 'ring-2 ring-blue-500/70 shadow-lg shadow-blue-950/40'
                                : ''
                            }`}
                          >
                            {/* Card Top: Title & Status / Quick Actions */}
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <div className="font-bold text-xs line-clamp-2 leading-tight">
                                  {event.name}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {isPending && (
                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-900/80 text-red-200 border border-red-600">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                                      <span>PENDING</span>
                                    </span>
                                  )}
                                  {isCurrentDay && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-900/80 text-blue-200 border border-blue-600">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons: If Pending, show Accept + Delete. If Confirmed, show Delete */}
                              <div className="flex items-center space-x-1 shrink-0">
                                {isPending && (
                                  <AcceptEventButton
                                    eventId={event.id}
                                    eventName={event.name}
                                    eventTime={`${formatTime12h(event.startTime)} - ${formatTime12h(event.endTime)}`}
                                    eventRoom={isSeminar1 ? 'Seminar 1' : 'Seminar 2'}
                                  />
                                )}

                                <form action={async () => {
                                  'use server';
                                  await deleteEvent(event.id);
                                }}>
                                  <button
                                    type="submit"
                                    title="Delete Event"
                                    className={`p-1 rounded-md transition-colors ${
                                      isPending 
                                        ? 'bg-red-800 hover:bg-red-700 text-red-200' 
                                        : 'text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100'
                                    }`}
                                  >
                                    {isPending ? <X className="h-3 w-3 stroke-[3]" /> : <Trash2 className="h-3 w-3" />}
                                  </button>
                                </form>
                              </div>
                            </div>

                            {/* Card Bottom: Time & Room */}
                            <div className="flex items-center text-[10px] mt-1.5 font-medium opacity-90">
                              <Clock className="h-2.5 w-2.5 mr-1 shrink-0" />
                              <span>{formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}</span>
                            </div>

                            <div className="flex items-center text-[10px] mt-0.5 font-medium opacity-90">
                              <MapPin className="h-2.5 w-2.5 mr-1 shrink-0" />
                              <span>{isSeminar1 ? 'Seminar 1' : 'Seminar 2'}</span>
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
