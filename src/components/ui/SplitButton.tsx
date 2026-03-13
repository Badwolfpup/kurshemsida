import { Button, type ButtonProps } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitButtonOption {
  id: number;
  label: string;
}

interface SplitButtonProps {
  mainLabel: React.ReactNode;
  onMainClick: () => void;
  options: SplitButtonOption[];
  onOptionSelect: (id: number) => void;
  disabled?: boolean;
  variant?: ButtonProps['variant'];
  className?: string;
}

export default function SplitButton({
  mainLabel,
  onMainClick,
  options,
  onOptionSelect,
  disabled,
  variant,
  className,
}: SplitButtonProps) {
  return (
    <div className={cn('inline-flex', className)}>
      <Button
        variant={variant}
        disabled={disabled}
        onClick={onMainClick}
        className="rounded-r-none"
      >
        {mainLabel}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            disabled={disabled}
            className="rounded-l-none border-l-0 px-2"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((opt) => (
            <DropdownMenuItem key={opt.id} onClick={() => onOptionSelect(opt.id)}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
