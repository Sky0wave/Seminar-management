'use client';

import { useState } from 'react';
import { checkRoomAvailability, bookEvent } from '@/lib/actions';
import { TIME_SLOTS_12H, formatTime12h } from '@/lib/time';
import { CheckCircle2, XCircle, Sparkles, Clock, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';

const QUICK_TEMPLATES = [
  { name: 'Clinical Seminar', type: 'CLASS' },
  { name: 'MDT Meeting', type: 'MEETING' },
  { name: 'Grand Rounds', type: 'CLASS' },
  { name: 'Departmental Review', type: 'MEETING' },
  { name: 'Student Teaching', type: 'CLASS' },
];

const QUICK_DURATIONS = [
  { label: '30 min', mins: 30 },
  { label: '1 hour', mins: 60 },
  { label: '1.5 hrs', mins: 90 },
  { label: '2 hours', mins: 120 },
  { label: '3 hours', mins: 180 },
];

export default function AddEventPage() {
  const router = useRouter();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    name: '',
    type: 'CLASS',
    date: todayStr,
    startTime: '09:00',
    endTime: '10:00',
    room: 'SEMINAR_1',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status?: 'SUCCESS' | 'REJECT' | 'CHECK_SUCCESS';
    room?: string;
    message?: string;
    error?: string;
  } | null>(null);

  // Set End Time based on Start Time + duration
  const applyDuration = (mins: number) => {
    const [h, m] = (formData.startTime || '09:00').split(':').map(Number);
    const totalMins = h * 60 + m + mins;
    const endH = Math.min(17, Math.floor(totalMins / 60));
    const endM = totalMins % 60;
    const newEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, endTime: newEnd }));
  };

  // Direct 1-Click Fast Booking: checks availability and books automatically
  const handleFastBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // 1. Availability check
    const check = await checkRoomAvailability(formData.date, formData.startTime, formData.endTime);
    
    if (check.error || check.status === 'REJECT') {
      setResult({
        status: 'REJECT',
        error: check.error || 'Both Seminar 1 and Seminar 2 are occupied at this time.',
      });
      setLoading(false);
      return;
    }

    const assignedRoom = check.recommended || 'SEMINAR_1';

    // 2. Book event
    const booking = await bookEvent({
      ...formData,
      room: assignedRoom,
    });

    if (booking.error) {
      setResult({
        status: 'REJECT',
        error: booking.error,
      });
    } else {
      setResult({
        status: 'SUCCESS',
        room: assignedRoom,
        message: assignedRoom === 'SEMINAR_2'
          ? 'Seminar 1 was occupied. Automatically assigned to Seminar 2!'
          : 'Successfully assigned to primary Seminar 1 room.',
      });
      setTimeout(() => {
        router.push('/');
      }, 1600);
    }
    setLoading(false);
  };

  // Check Availability Only (preview without booking)
  const handleCheckOnly = async () => {
    if (!formData.name) {
      setResult({ status: 'REJECT', error: 'Please enter an event name first.' });
      return;
    }
    setLoading(true);
    setResult(null);

    const check = await checkRoomAvailability(formData.date, formData.startTime, formData.endTime);
    if (check.error || check.status === 'REJECT') {
      setResult({
        status: 'REJECT',
        error: check.error || 'Both rooms are occupied during this time.',
      });
    } else {
      setResult({
        status: 'CHECK_SUCCESS',
        room: check.recommended,
        message: check.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Quick Event Booking</h2>
        <p className="text-sm text-gray-400 mt-1">
          Smart scheduler with automatic Seminar 1 &amp; Seminar 2 room assignment.
        </p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Quick Suggestion Chips */}
        <div className="p-6 border-b border-gray-800/80 bg-gray-950/40">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mb-3">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>QUICK PRESETS (1-CLICK FILL)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map(tpl => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, name: tpl.name, type: tpl.type }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800/90 text-gray-300 border border-gray-700 hover:border-blue-500 hover:text-white hover:bg-blue-950/30 transition-all"
              >
                + {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFastBook} className="p-6 md:p-8 space-y-6">
          {/* Event Title & Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-300 block mb-2">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Cardiology Case Conference"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm"
              >
                <option value="CLASS">Class</option>
                <option value="MEETING">Meeting</option>
              </select>
            </div>
          </div>

          {/* Date Picker with Quick Date Chips */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Date (Mon - Sat)</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, date: todayStr }))}
                  className={`text-xs px-2.5 py-1 rounded-md border ${
                    formData.date === todayStr
                      ? 'bg-blue-900/50 border-blue-600 text-blue-300 font-semibold'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, date: tomorrowStr }))}
                  className={`text-xs px-2.5 py-1 rounded-md border ${
                    formData.date === tomorrowStr
                      ? 'bg-blue-900/50 border-blue-600 text-blue-300 font-semibold'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm"
            />
          </div>

          {/* Time Picker in 12-Hour Dropdowns */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Select Time (12-Hour AM/PM)</span>
              </label>
              {/* Quick Duration Chips */}
              <div className="flex items-center space-x-1">
                {QUICK_DURATIONS.map(d => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => applyDuration(d.mins)}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400 mb-1 block">Start Time</span>
                <select
                  value={formData.startTime}
                  onChange={e => {
                    const newStart = e.target.value;
                    setFormData(prev => ({ ...prev, startTime: newStart }));
                  }}
                  className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm font-medium"
                >
                  {TIME_SLOTS_12H.filter(s => s.value < '17:00').map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-xs text-gray-400 mb-1 block">End Time</span>
                <select
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-950 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm font-medium"
                >
                  {TIME_SLOTS_12H.filter(s => s.value > formData.startTime).map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Operating hours: 8:00 AM – 5:00 PM (Monday through Saturday).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Processing...' : 'Auto-Assign & Book Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCheckOnly}
              disabled={loading}
              className="py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              Check Availability First
            </button>
          </div>
        </form>

        {/* Feedback Area */}
        {result && (
          <div className="border-t border-gray-800">
            {result.status === 'REJECT' && (
              <div className="bg-red-950/40 border-t border-red-900/80 p-5 flex items-start space-x-3.5">
                <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-300">Cannot Book Slot</h4>
                  <p className="text-xs text-red-400 mt-1">{result.error}</p>
                </div>
              </div>
            )}

            {result.status === 'SUCCESS' && (
              <div className="bg-emerald-950/40 border-t border-emerald-900/80 p-5 flex items-start space-x-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Booking Confirmed in {result.room === 'SEMINAR_1' ? 'Seminar 1' : 'Seminar 2'}!
                  </h4>
                  <p className="text-xs text-emerald-400 mt-1">{result.message}</p>
                  <p className="text-[11px] text-gray-400 mt-2">Redirecting to timetable...</p>
                </div>
              </div>
            )}

            {result.status === 'CHECK_SUCCESS' && (
              <div className="bg-blue-950/40 border-t border-blue-900/80 p-5 flex items-start space-x-3.5">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-300">
                    {result.room === 'SEMINAR_1' ? 'Seminar 1 Available' : 'Seminar 2 Available (Backup)'}
                  </h4>
                  <p className="text-xs text-blue-400 mt-1">{result.message}</p>
                  <button
                    type="button"
                    onClick={handleFastBook}
                    className="mt-3 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center space-x-1"
                  >
                    <span>Confirm &amp; Book Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
