import { prisma } from '@/lib/prisma';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, Plus, Send, Inbox } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { bookEvent, checkRoomAvailability, createBookingRequest } from '@/lib/actions';
import { formatTime12h, TIME_SLOTS_12H } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  const requests = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Booking Requests</h2>
        <p className="text-sm text-gray-400 mt-1">
          Record manual/historical requests and process them with automatic room allocation.
        </p>
      </div>

      {/* Manual Request Entry Form */}
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Plus className="h-4 w-4 text-blue-400" />
          <span>Enter Offline / Historical Request</span>
        </h3>

        <form
          action={async (formData: FormData) => {
            'use server';
            const name = formData.get('name') as string;
            const requestedDate = formData.get('requestedDate') as string;
            const startTime = formData.get('startTime') as string;
            const endTime = formData.get('endTime') as string;

            if (name && requestedDate && startTime && endTime) {
              await createBookingRequest({
                name,
                requestedDate,
                startTime,
                endTime,
              });
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div className="lg:col-span-2">
            <label className="text-xs text-gray-400 block mb-1">Request / Event Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g., Surgery Department Case Review"
              className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Date (Mon-Sat)</label>
            <input
              name="requestedDate"
              type="date"
              required
              className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Time Slot (12h)</label>
            <div className="grid grid-cols-2 gap-1">
              <select
                name="startTime"
                defaultValue="09:00"
                className="px-2 py-2 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_SLOTS_12H.filter(s => s.value < '17:00').map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                name="endTime"
                defaultValue="10:00"
                className="px-2 py-2 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_SLOTS_12H.filter(s => s.value > '08:00').map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-colors shadow-md flex items-center justify-center space-x-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Add Request</span>
            </button>
          </div>
        </form>
      </div>

      {/* Requests Queue List */}
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
            <Inbox className="h-4 w-4 text-blue-400" />
            <span>REQUEST QUEUE ({requests.length})</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Click 'Process' to check room overlap and auto-schedule to Seminar 1 or 2.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Inbox className="h-10 w-10 mx-auto text-gray-700 mb-2" />
            <p className="text-sm">No booking requests in queue.</p>
            <p className="text-xs text-gray-600 mt-1">Use the form above to add an offline request.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {requests.map((req: any) => (
              <li key={req.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 hover:bg-gray-800/20 transition-colors">
                <div>
                  <h3 className="text-base font-bold text-white">{req.name}</h3>
                  <div className="mt-1.5 flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      {req.requestedDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      {formatTime12h(req.startTime)} - {formatTime12h(req.endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    req.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                    req.status === 'SCHEDULED' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' :
                    req.status === 'CONFLICT' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {req.status}
                  </span>
                  
                  {req.status === 'PENDING' && (
                    <form action={async () => {
                      'use server';
                      const check = await checkRoomAvailability(req.requestedDate, req.startTime, req.endTime);
                      
                      if (check.error || check.status === 'REJECT') {
                        await prisma.bookingRequest.update({
                          where: { id: req.id },
                          data: { status: 'CONFLICT' }
                        });
                      } else {
                        await bookEvent({
                          name: req.name,
                          type: 'MEETING',
                          date: req.requestedDate,
                          startTime: req.startTime,
                          endTime: req.endTime,
                          room: check.recommended!,
                          status: 'CONFIRMED',
                        });
                        await prisma.bookingRequest.update({
                          where: { id: req.id },
                          data: { status: 'SCHEDULED' }
                        });
                      }
                      revalidatePath('/requests');
                    }}>
                      <button type="submit" className="flex items-center px-3 py-1.5 bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border border-blue-700 rounded-lg text-xs font-semibold transition-colors">
                        Process &amp; Schedule
                      </button>
                    </form>
                  )}
                  
                  {(req.status === 'PENDING' || req.status === 'CONFLICT') && (
                    <form action={async () => {
                      'use server';
                      await prisma.bookingRequest.update({
                        where: { id: req.id },
                        data: { status: 'CANCELLED' }
                      });
                      revalidatePath('/requests');
                    }}>
                      <button type="submit" title="Cancel Request" className="text-gray-500 hover:text-red-400 p-1 transition-colors">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
