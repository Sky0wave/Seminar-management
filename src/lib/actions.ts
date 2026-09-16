'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { parse, getDay, format, startOfWeek, addDays } from 'date-fns';

// Helper to get current Date in Asia/Kolkata (IST, UTC+5:30)
export async function getKolkataNow() {
  const now = new Date();
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(kolkataStr);
}

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safe fallback when executed outside of an active HTTP render context
  }
}

export async function getEventsForWeek(dateStr: string) {
  // dateStr is 'YYYY-MM-DD'
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  
  // Hospital week: Monday to Saturday.
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 5); // Saturday

  // Fetch all recurring events (excluding cancelled)
  const recurringEvents = await prisma.event.findMany({
    where: { 
      isRecurring: true,
      status: { not: 'CANCELLED' }
    },
  });

  // Fetch one-time events for this week (excluding cancelled)
  const oneTimeEvents = await prisma.event.findMany({
    where: {
      isRecurring: false,
      status: { not: 'CANCELLED' },
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

  // Fetch recurring events for this day of week (excluding cancelled)
  const recurring = await prisma.event.findMany({
    where: { 
      isRecurring: true, 
      dayOfWeek,
      status: { not: 'CANCELLED' }
    },
  });

  // Fetch one-time events for this exact date (excluding cancelled)
  const oneTime = await prisma.event.findMany({
    where: { 
      isRecurring: false, 
      date: dateStr,
      status: { not: 'CANCELLED' }
    },
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

export async function bookEvent(data: { 
  name: string; 
  type: string; 
  date: string; 
  startTime: string; 
  endTime: string; 
  room: string;
  status?: string;
}) {
  const check = await checkRoomAvailability(data.date, data.startTime, data.endTime);
  if (check.error || check.status === 'REJECT') {
    return { error: check.error || check.message };
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
      status: data.status || 'PENDING',
    },
  });

  safeRevalidate('/');
  safeRevalidate('/rooms');
  safeRevalidate('/requests');
  return { success: true };
}

export async function acceptEvent(id: string, verificationPassword?: string) {
  if (verificationPassword !== 'med@1234') {
    return { error: 'Incorrect verification password. Action denied.' };
  }
  await prisma.event.update({
    where: { id },
    data: { status: 'CONFIRMED' },
  });
  safeRevalidate('/');
  safeRevalidate('/rooms');
  safeRevalidate('/requests');
  return { success: true };
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  safeRevalidate('/');
  safeRevalidate('/rooms');
  safeRevalidate('/requests');
}

export async function getPendingEvents() {
  return await prisma.event.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createBookingRequest(data: {
  name: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
}) {
  if (data.startTime >= data.endTime) {
    return { error: 'Start time must be before end time.' };
  }
  await prisma.bookingRequest.create({
    data: {
      name: data.name,
      requestedDate: data.requestedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'PENDING',
    },
  });
  safeRevalidate('/requests');
  return { success: true };
}
