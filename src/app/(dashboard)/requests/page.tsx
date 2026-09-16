import { prisma } from '@/lib/prisma';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { bookEvent, checkRoomAvailability } from '@/lib/actions';
import { formatTime12h } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  const requests = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Booking Requests</h2>
        <p className="text-sm text-gray-400 mt-1">Manage old and incoming requests manually.</p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No booking requests found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {requests.map((req: any) => (
              <li key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-lg font-bold text-white">{req.name}</h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                      {req.requestedDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                      {formatTime12h(req.startTime)} - {formatTime12h(req.endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                          room: check.recommended!
                        });
                        await prisma.bookingRequest.update({
                          where: { id: req.id },
                          data: { status: 'SCHEDULED' }
                        });
                      }
                      revalidatePath('/requests');
                    }}>
                      <button type="submit" className="flex items-center px-3 py-1.5 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800 rounded-lg text-sm font-medium transition-colors">
                        Process
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
                      <button type="submit" className="text-gray-500 hover:text-red-500 transition-colors">
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
