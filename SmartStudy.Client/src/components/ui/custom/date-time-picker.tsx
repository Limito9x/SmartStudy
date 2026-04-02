import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  // Kiểm tra date có hợp lệ không
  const isValidDate = value && !isNaN(value.getTime());
  // Tách time string từ Date hiện tại để hiển thị trong input
  const timeString = isValidDate ? format(value!, "HH:mm") : "";

  // Khi chọn ngày → giữ nguyên giờ cũ, chỉ đổi phần date
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    const merged = new Date(selectedDate);
    if (value) {
      merged.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }
    onChange(merged);
  };

  // Khi đổi giờ → giữ nguyên ngày cũ, chỉ đổi phần time
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const merged = value ? new Date(value) : new Date();
    merged.setHours(hours, minutes, 0, 0);
    onChange(merged);
  };

  return (
    <div className="flex gap-3">
      {/* Date part */}
      <div className="flex flex-col gap-1.5 flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between font-normal w-full"
            >
              {value ? format(value, "dd/MM/yyyy") : "Chọn ngày"}
              <ChevronDownIcon size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={vi}
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time part */}
      <div className="flex flex-col gap-1.5 w-28">
        <Input
          type="time"
          value={timeString}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
