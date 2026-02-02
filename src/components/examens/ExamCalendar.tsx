import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SessionExamen } from '@/api/sessionsExamen/api';

interface ExamCalendarProps {
    sessions: SessionExamen[];
    currentDate: Date;
    startHour?: number;
    endHour?: number;
}

export function ExamCalendar({
    sessions = [],
    currentDate,
    startHour = 7,
    endHour = 19
}: ExamCalendarProps) {

    // Generate week days for the current week starting from Monday
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 6 }).map((_, i) => addDays(start, i)); // Mon to Sat
    }, [currentDate]);

    // Generate time slots
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = startHour; i <= endHour; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, [startHour, endHour]);

    const getSessionsForDate = (date: Date) => {
        return sessions.filter(s => isSameDay(parseISO(s.date_examen), date));
    };

    const getPositionStyle = (heure_debut: string, heure_fin: string) => {
        const [hStart, mStart] = heure_debut.split(':').map(Number);
        const [hEnd, mEnd] = heure_fin.split(':').map(Number);

        const startMinutes = (hStart - startHour) * 60 + mStart;
        const durationMinutes = (hEnd * 60 + mEnd) - (hStart * 60 + mStart);

        return {
            top: `${(startMinutes / 60) * 4}rem`, // 4rem per hour height
            height: `calc(${(durationMinutes / 60) * 4}rem - 4px)`
        };
    };

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background shadow-sm">
            {/* Header: Days with Dates */}
            <div className="grid grid-cols-[80px_1fr] border-b bg-muted/30">
                <div className="p-4 border-r"></div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className={cn(
                            "p-3 text-center border-r last:border-r-0",
                            isSameDay(day, new Date()) && "bg-blue-50/50 dark:bg-blue-900/20"
                        )}>
                            <div className="text-xs font-semibold text-muted-foreground uppercase">{format(day, 'eee', { locale: fr })}</div>
                            <div className={cn(
                                "text-lg font-bold",
                                isSameDay(day, new Date()) && "text-blue-600 dark:text-blue-400"
                            )}>{format(day, 'd')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-[80px_1fr] relative">
                    {/* Time Column */}
                    <div className="border-r bg-muted/5">
                        {timeSlots.map(time => (
                            <div key={time} className="h-16 border-b text-xs text-muted-foreground pr-3 pt-1 text-right relative">
                                <span className="-top-2 relative font-medium">{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="grid relative" style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
                        {weekDays.map((day) => (
                            <div key={`col-${day.toISOString()}`} className="border-r last:border-r-0 relative group">
                                {timeSlots.map(time => (
                                    <div key={`${day}-${time}`} className="h-16 border-b border-dashed border-slate-100 dark:border-slate-800"></div>
                                ))}

                                {/* Sessions */}
                                {getSessionsForDate(day).map(session => {
                                    const style = getPositionStyle(session.heure_debut, session.heure_fin);

                                    return (
                                        <TooltipProvider key={session.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="absolute w-[92%] left-[4%] rounded-lg p-2 text-xs shadow-md border-l-4 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all z-10 bg-white dark:bg-slate-900 border-blue-500"
                                                        style={style}
                                                    >
                                                        <div className="font-bold text-blue-700 dark:text-blue-400 truncate">{session.titre}</div>
                                                        <div className="font-medium text-slate-700 dark:text-slate-300 truncate">{session.matiere?.nom_matiere || session.classe?.nom_classe}</div>
                                                        <div className="text-slate-500 dark:text-slate-400 truncate text-[10px]">
                                                            {session.heure_debut.substring(0, 5)} - {session.heure_fin.substring(0, 5)}
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="p-1">
                                                        <p className="font-bold text-blue-600">{session.titre}</p>
                                                        <p className="text-sm">Classe: {session.classe?.nom_classe}</p>
                                                        <p className="text-sm">Matière: {session.matiere?.nom_matiere}</p>
                                                        <p className="text-sm">Horaire: {session.heure_debut} - {session.heure_fin}</p>
                                                        <p className="text-sm text-muted-foreground italic capitalize">{session.type.replace('_', ' ')}</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
