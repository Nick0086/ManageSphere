import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";

import flags from "react-phone-number-input/flags";

import { Button } from "./button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./command";
import { Input } from "./input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover";
import { ScrollArea } from "./scroll-area";

import { cn } from "../../lib/utils";

const PhoneInput = React.forwardRef(
    ({ className, onChange, countrySelectClassName, ...props }, ref) => {
        return (
            <RPNInput.default
                ref={ref}
                className={cn("flex !items-stretch", className)}
                flagComponent={FlagComponent}
                countrySelectComponent={CountrySelect}
                inputComponent={InputComponent}
                /**
                 * Handles the onChange event.
                 *
                 * react-phone-number-input might trigger the onChange event as undefined
                 * when a valid phone number is not entered. To prevent this,
                 * the value is coerced to an empty string.
                 *
                 * @param {E164Number | undefined} value - The entered value
                 */
                onChange={(value) => onChange?.(value)}
                {...props}
            />
        );
    },
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef(
    ({ className, ...props }, ref) => (
        <Input
            variant=""
            className={cn("rounded-e-md rounded-s-none ", className)}
            {...props}
            ref={ref}
        />
    ),
);
InputComponent.displayName = "InputComponent";

const CountrySelect = ({
    disabled,
    value,
    onChange,
    options,
    countrySelectClassName
}) => {
    const handleSelect = React.useCallback(
        (country) => {
            onChange(country);
        },
        [onChange],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn("flex gap-1 rounded-e-none rounded-s-md px-3 border-r-0", countrySelectClassName)}
                    disabled={disabled}
                >
                    <FlagComponent country={value} countryName={value} />
                    <ChevronsUpDown
                    size={16}
                        className={cn(
                            "-mr-2 -opacity-50",
                            disabled ? "hidden" : "opacity-100",
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent onFocusOutside={(e) => {
                e.preventDefault()
            }} className="w-[300px] z-[999999] p-0" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}>
                <Command>
                    <CommandList>
                        <ScrollArea className="h-72">
                            <CommandInput bodyClassName='bg-white sticky top-0 w-full z-50' placeholder="Search country..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {options
                                    .filter((x) => x.value)
                                    .map((option) => (
                                        <CommandItem
                                            className="gap-2"
                                            key={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <FlagComponent
                                                country={option.value}
                                                countryName={option.label}
                                            />
                                            <span className="flex-1 text-sm">{option.label}</span>
                                            {option.value && (
                                                <span className="text-sm text-foreground/50">
                                                    {`+${RPNInput.getCountryCallingCode(option.value)}`}
                                                </span>
                                            )}
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    option.value === value ? "opacity-100" : "opacity-0",
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const FlagComponent = ({ country, countryName }) => {
    const Flag = flags[country];

    return (
        <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
            {Flag && <Flag title={countryName} />}
        </span>
    );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };