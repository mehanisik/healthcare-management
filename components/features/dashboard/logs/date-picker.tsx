'use client';
import type { DateRange } from 'react-day-picker';
import { Button } from '#/components/ui/button';
import { Calendar } from '#/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover';

import { cn } from '#/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

type DatePickerWithRangeProps = {
  onDateChange: (dateRange?: DateRange) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function DatePickerWithRange({
  className,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();

  React.useEffect(() => {
    onDateChange(date);
  }, [date, onDateChange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[270px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from
              ? (
                  date.to
                    ? (
                        <>
                          {format(date.from, 'LLL dd, y')}
                          {' '}
                          -
                          {' '}
                          {format(date.to, 'LLL dd, y')}
                        </>
                      )
                    : (
                        format(date.from, 'LLL dd, y')
                      )
                )
              : (
                  <span>Pick a date range</span>
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
