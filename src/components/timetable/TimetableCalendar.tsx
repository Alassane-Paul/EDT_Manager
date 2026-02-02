import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, startOfWeek, setHours, setMinutes, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Creneau {
    id: string;
    jour_semaine: string;
    heure_debut: string;
    heure_fin: string;
    salle?: { nom_salle: string };
    cours?: {
        matiere: { nom_matiere: string; couleur_affichage?: string };
        enseignant?: { utilisateur: { nom: string; prenom: string } };
    };
    statut: string;
}

interface TimetableCalendarProps {
    creneaux: Creneau[];
    showWeekend?: boolean;
    startHour?: number;
    endHour?: number;
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function TimetableCalendar({
    creneaux = [],
    showWeekend = true,
    startHour = 7,
    endHour = 19
}: TimetableCalendarProps) {

    // Filter days based on showWeekend
    const daysToShow = showWeekend ? JOURS.slice(0, 6) : JOURS.slice(0, 5); // Default to Sat included

    // Generate time slots
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = startHour; i <= endHour; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }, [startHour, endHour]);

    const getCreneauxForDay = (jour: string) => {
        return creneaux.filter(c => c.jour_semaine.toLowerCase() === jour.toLowerCase());
    };

    // Helper to calculate position and height
    const getPositionStyle = (heure_debut: string, heure_fin: string) => {
        const [hStart, mStart] = heure_debut.split(':').map(Number);
        const [hEnd, mEnd] = heure_fin.split(':').map(Number);

        const startMinutes = (hStart - startHour) * 60 + mStart;
        const durationMinutes = (hEnd * 60 + mEnd) - (hStart * 60 + mStart);

        return {
            top: `${(startMinutes / 60) * 4}rem`, // 4rem per hour height
            height: `calc(${(durationMinutes / 60) * 4}rem - 4px)` // Added 4px gap
        };
    };

    return (
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
            {/* Header: Days */}
            <div className="grid grid-cols-[60px_1fr] border-b">
                <div className="p-2 border-r bg-muted/30"></div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}>
                    {daysToShow.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-semibold border-r last:border-r-0 bg-muted/30">
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body: Time slots and Creneaux */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-[60px_1fr] relative">

                    {/* Time Column */}
                    <div className="border-r bg-muted/10">
                        {timeSlots.map(time => (
                            <div key={time} className="h-16 border-b text-xs text-muted-foreground p-1 text-right relative">
                                <span className="-top-2 relative">{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns Container */}
                    <div className="grid relative" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}>
                        {/* Background Grid Lines */}
                        {daysToShow.map((day, dayIndex) => (
                            <div key={`grid-${day}`} className="border-r last:border-r-0 relative">
                                {timeSlots.map(time => (
                                    <div key={`${day}-${time}`} className="h-16 border-b border-dashed border-gray-100 dark:border-gray-800"></div>
                                ))}

                                {/* Render Creneaux for this day */}
                                {getCreneauxForDay(day).map(creneau => {
                                    const style = getPositionStyle(creneau.heure_debut, creneau.heure_fin);
                                    const bgColor = creneau.cours?.matiere?.couleur_affichage || "#3b82f6"; // Default blue

                                    return (
                                        <TooltipProvider key={creneau.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="absolute w-[95%] left-[2.5%] rounded-md p-2 text-xs text-white shadow-sm overflow-hidden cursor-pointer hover:brightness-110 transition-all z-10"
                                                        style={{
                                                            ...style,
                                                            backgroundColor: bgColor,
                                                            borderLeft: `4px solid ${adjustColor(bgColor, -20)}`
                                                        }}
                                                    >
                                                        <div className="font-bold truncate">{creneau.cours?.matiere.nom_matiere}</div>
                                                        <div className="truncate opacity-90">{creneau.salle?.nom_salle || "Sans salle"}</div>
                                                        <div className="truncate opacity-90 text-[10px]">
                                                            {creneau.heure_debut} - {creneau.heure_fin}
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-sm">
                                                        <p className="font-bold">{creneau.cours?.matiere.nom_matiere}</p>
                                                        <p>Enseignant: {creneau.cours?.enseignant?.utilisateur.prenom} {creneau.cours?.enseignant?.utilisateur.nom}</p>
                                                        <p>Salle: {creneau.salle?.nom_salle}</p>
                                                        <p>Horaire: {creneau.heure_debut} - {creneau.heure_fin}</p>
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

// Simple utils to darken color for border
function adjustColor(color: string, amount: number) {
    if (!color.startsWith('#')) return color;
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

