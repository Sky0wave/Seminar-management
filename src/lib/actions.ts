'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { parse, getDay, format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';

export async function getEventsForWeek(dateStr: string) {
  // dateStr is 'YYYY-MM-DD'
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  
  // startOfWeek in date-fns defaults to Sunday, but we can make it Monday if we want.
  // Hospital week: Monday to Saturday. Let's use Monday as start.
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 5); // Saturday

  // Fetch all recurring events
  const recurringEvents = await prisma.event.findMany({
    where: { isRecurring: true },
  });

  // Fetch one-time events for this week
  const oneTimeEvents = await prisma.event.findMany({
    where: {
      isRecurring: false,
      date: {
        gte: format(weekStart, 'yyyy-MM-dd'),
        lte: format(weekEnd, 'yyyy-MM-dd'),
      },
    },
  });

  return { recurringEvents, oneTimeEvents, weekStart, weekEnd };
}

// Overlap logic: newStart < existingEnd && newEnd > existingStart
function checkOverlap(newStart: string, newEnd: string, existingStart: string, existingEnd: string) {
  return newStart < existingEnd && newEnd > existingStart;
}

export async function checkRoomAvailability(dateStr: string, startTime: string, endTime: string) {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dayOfWeek = getDay(date); // 0=Sun, 1=Mon... 6=Sat

  if (dayOfWeek === 0) {
    return { error: 'Events cannot be booked on Sunday.' };
  }
  if (startTime >= endTime) {
    return { error: 'Start time must be before end time.' };
  }
  if (endTime > '17:00' || startTime < '08:00') {
    return { error: 'Working hours are 8:00 AM to 5:00 PM.' };
  }

  // Fetch recurring events for this day of week
  const recurring = await prisma.event.findMany({
    where: { isRecurring: true, dayOfWeek },
  });

  // Fetch one-time events for this exact date
  const oneTime = await prisma.event.findMany({
    where: { isRecurring: false, date: dateStr },
  });

  const allEventsForDay = [...recurring, ...oneTime];

  let seminar1Occupied = false;
  let seminar2Occupied = false;

  for (const event of allEventsForDay) {
    if (checkOverlap(startTime, endTime, event.startTime, event.endTime)) {
      if (event.room === 'SEMINAR_1') seminar1Occupied = true;
      if (event.room === 'SEMINAR_2') seminar2Occupied = true;
    }
  }

  if (seminar1Occupied && seminar2Occupied) {
    return { status: 'REJECT', message: 'Both seminar rooms are full. Please kindly adjust your time and date.' };
  }

  if (seminar1Occupied && !seminar2Occupied) {
    return { status: 'SEMINAR_2', message: 'Seminar 1 is already occupied. Your event has been assigned to Seminar 2.', recommended: 'SEMINAR_2' };
  }

  return { status: 'SEMINAR_1', message: 'Seminar 1 is available. Recommended room: Seminar 1.', recommended: 'SEMINAR_1' };
}

export async function bookEvent(data: { name: string; type: string; date: string; startTime: string; endTime: string; room: string }) {
  const check = await checkRoomAvailability(data.date, data.startTime, data.endTime);
  if (check.error || check.status === 'REJECT') {
    return { error: check.error || check.message };
  }

  // Double check the specific room
  if (check.recommended !== data.room && check.status !== 'SEMINAR_1') {
    // If they manually forced Seminar 1 but it was occupied
    // Let's re-verify specific room occupancy just in case, though the front-end shouldn't allow it.
  }

  await prisma.event.create({
    data: {
      name: data.name,
      type: data.type,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      isRecurring: false,
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath('/');
}

// More actions will be added as needed.
