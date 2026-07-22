'use client';

import { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  isToday,
  setYear,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Car, Key } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  bookings: any[];
}

type EventType = 'pickup' | 'return' | 'maintenance' | 'booking' | 'payment_due';

interface CalendarEvent {
  id: string;
  date: Date;
  type: EventType;
  title: string;
  booking: any;
  color: string;
}

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState('ALL');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Generate events from bookings
  const events = useMemo(() => {
    const list: CalendarEvent[] = [];
    bookings.forEach(b => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return;

      const customer = b.guestName || b.user?.name || 'Guest';
      const carName = b.car ? `${b.car.brand} ${b.car.name}` : 'Car';
      
      if (b.startDateTime) {
        list.push({
          id: `${b.id}-pickup`,
          date: parseISO(b.startDateTime),
          type: 'pickup',
          title: `Pickup: ${carName} (${customer})`,
          booking: b,
          color: 'bg-blue-500'
        });
      }
      if (b.endDateTime) {
        list.push({
          id: `${b.id}-return`,
          date: parseISO(b.endDateTime),
          type: 'return',
          title: `Return: ${carName} (${customer})`,
          booking: b,
          color: 'bg-purple-500'
        });
      }
      if (b.status === 'DP_CONFIRMED' && b.startDateTime) {
        // Just a mock for final payment due based on start date
        list.push({
          id: `${b.id}-payment`,
          date: parseISO(b.startDateTime),
          type: 'payment_due',
          title: `Final Payment: ${customer}`,
          booking: b,
          color: 'bg-yellow-500'
        });
      }
    });
    return list;
  }, [bookings, statusFilter]);

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Selected Date Events
  const selectedEvents = events.filter(e => isSameDay(e.date, selectedDate));
  const todayEvents = events.filter(e => isSameDay(e.date, new Date()));

  // Year Options (Current year - 2 to + 3)
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 6}, (_, i) => currentYear - 2 + i);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Calendar View */}
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select 
              value={currentDate.getFullYear().toString()} 
              onValueChange={(val) => { if (val) setCurrentDate(setYear(currentDate, parseInt(val))); }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN_PROGRESS">Active</SelectItem>
                <SelectItem value="DP_CONFIRMED">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
              <div key={dayName} className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-0">
                {dayName}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {days.map((d, idx) => {
              const dayEvents = events.filter(e => isSameDay(e.date, d));
              return (
                <div 
                  key={d.toISOString()} 
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b cursor-pointer transition-colors hover:bg-muted/50",
                    !isSameMonth(d, monthStart) && "bg-muted/10 text-muted-foreground opacity-50",
                    isSameDay(d, selectedDate) && "bg-primary/5 ring-1 ring-inset ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                      isToday(d) && "bg-primary text-primary-foreground",
                    )}>
                      {format(d, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <div key={e.id} className={cn("text-[10px] px-1.5 py-0.5 rounded text-white truncate", e.color)}>
                        {e.type === 'pickup' ? <Key size={10} className="inline mr-1"/> : null}
                        {e.type === 'return' ? <Car size={10} className="inline mr-1"/> : null}
                        {format(e.date, 'HH:mm')} {e.title.split(':')[0]}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground font-medium pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Side Panels */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Events on {format(selectedDate, 'dd MMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px] pr-4">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-10">No events for this date.</p>
              ) : (
                <div className="space-y-4">
                  {selectedEvents.map(e => (
                    <div key={e.id} className="flex gap-3 relative">
                      <div className="w-12 text-xs font-semibold text-muted-foreground shrink-0 mt-1">
                        {format(e.date, 'HH:mm')}
                      </div>
                      <div className="absolute left-[3.25rem] top-1.5 bottom-[-1rem] w-px bg-border last:hidden" />
                      <div className={cn("w-2 h-2 rounded-full absolute left-[3rem] top-1.5 ring-4 ring-background", e.color)} />
                      <div className="flex-1 bg-muted/40 p-3 rounded-lg ml-6">
                        <p className="text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Booking #{e.booking.id.slice(0,8)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[200px] pr-4">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-10">No events today.</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", e.color)} />
                        <span className="font-medium truncate max-w-[150px]">{e.title}</span>
                      </div>
                      <span className="text-xs font-semibold">{format(e.date, 'HH:mm')}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
