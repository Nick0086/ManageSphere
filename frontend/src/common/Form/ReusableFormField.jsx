import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { PhoneInput } from '@/components/ui/phone-input';
import ReactSelect from '@/components/ui/react-select/react-select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import EnhancedAttachmentInput from '@/components/ui/EnhancedAttachmentInput';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { TagInput } from '@/components/ui/tag/tag-input';


const ReusableFormField = ({
    control,
    name,
    label,
    type,
    options = [],
    required = false,
    placeholder,
    className,
    labelClassName,
    inputClassName,
    containerClassName,
    inputProps = {},
    labelProps = {},
    formItemProps = {},
    onValueChange,
    formControlProps = {},
    isLoading = false,
    disabled = false,
    readonly = false,
    tooltipText = '',
    isencryptAES = false,
    decryptAESFunction = {},
    radioLabelClassName,
    radioGroupBodyClassName,
    coustomValue,
    textAreaClassName='',
    activeTagIndex,
    setActiveTagIndex
}) => {

    const [showPassword, setShowPassword] = useState(false);

    const renderInput = (field) => {

        let commonProps = {
            ...field,
            ...inputProps,
            disabled: disabled || isLoading,
            readOnly: readonly,
            placeholder,
            onChange: (e) => {
                const value = e.target.value;
                field.onChange(value);
                onValueChange?.(value);
            },

        };

        if (type === 'PhoneInput') {
            commonProps.onChange = (value) => {
                field.onChange(value);
                onValueChange?.(value);
            }
        }
        if (type === 'password') {
            commonProps.value = !isencryptAES ? field?.value : decryptAESFunction(field?.value)
        }


        switch (type) {
            case 'select':
                return (
                    <Select
                        onValueChange={(value) => {
                            if (value === 0 ||value || value === null) {
                                field.onChange(value);
                                onValueChange?.(value);
                            }

                        }}
                        value={field.value}
                        disabled={disabled || isLoading || readonly}
                    >
                        <FormControl className={cn("", inputClassName)}>
                            <SelectTrigger isLoading={isLoading}>
                                {
                                    coustomValue ?? <SelectValue placeholder={placeholder} />
                                }

                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectGroup>
                                {options.length === 0 ? (
                                    <SelectLabel>No options available</SelectLabel>
                                ) : options.length > 10 ? (
                                    <ScrollArea className="h-72">
                                        {options.map((option) => (
                                            <SelectItem key={option.value} value={`${option.value}`}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                ) : (
                                    options.map((option) => (
                                        <SelectItem key={option.value} value={`${option.value}`}>
                                            {option.label}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                );
            case 'multiSelect':
                return (
                    <ReactSelect
                        options={options}
                        isMulti
                        isDisabled={disabled || isLoading || readonly}
                        value={
                            field.value
                                ? options.filter((option) =>
                                    field.value.includes(option?.value)
                                )
                                : []
                        }
                        onChange={(value) => {
                            field.onChange(
                                value ? value.map((item) => item.value) : []
                            )
                            onValueChange?.(value);
                        }}
                    />
                );
            case 'tagInput':
                return (
                    <TagInput   
                        placeholder={placeholder}
                        includeTagsInInput
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                        tags={
                            field.value?.map((tag) => ({
                                text: tag,
                                id: tag,
                            })) || []
                        }
                        setTags={(tags) => {
                            field.onChange(tags?.map((tag) => tag?.text));
                            onValueChange?.(tags?.map((tag) => tag?.text));
                        }}
                        disabled={disabled || isLoading || readonly}
                        {...inputProps}
                    />
                );
            case 'PhoneInput':
                return (
                    <PhoneInput
                        {...commonProps}
                        countryCallingCodeEditable={false}
                        international={true}
                        defaultCountry="IN"
                        className={cn("", inputClassName)}
                    />
                );
            case 'textarea':
                return <Textarea className={cn("", textAreaClassName)}  {...commonProps} />;
            case 'checkbox':
                return (
                    <Checkbox
                        checked={field.value === true || field.value === 1}
                        onCheckedChange={(value) => {
                            field.onChange(value);
                            onValueChange?.(value);
                        }}
                        {...commonProps}
                    />
                );
            case 'switch':
                return (
                    <div>
                        <Switch
                            checked={field.value === true || field.value === 1}
                            onCheckedChange={(value) => {
                                field.onChange(value);
                                onValueChange?.(value);
                            }}
                            disabled={disabled || isLoading || readonly}
                            {...inputProps}
                        />
                    </div>

                );
            case 'password':
                return (
                    <div className="relative">
                        <Input
                            {...commonProps}
                            type={showPassword ? 'text' : 'password'}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                );
            case 'OTP':
                return (
                    <InputOTP
                    className='w-full'
                        value={field.value}
                        disabled={disabled || isLoading || readonly}
                        maxLength={6}
                        {...inputProps}
                        onChange={(value) => {
                            field.onChange(value);
                            onValueChange?.(value);
                        }}
                    >
                        <InputOTPGroup className='border border-input rounded px-0.5 w-full'>
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={0} />
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={1} />
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={2} />
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={3} />
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={4} />
                            <InputOTPSlot placeholder='●' className='border-none first:rounded-l-none last:rounded-none' index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                )
            case 'radio':
                return (
                    <RadioGroup
                        onValueChange={(value) => {
                            field.onChange(value);
                            onValueChange?.(value);
                        }}
                        value={field.value}
                        disabled={disabled || isLoading || readonly}
                        className="space-y-1"
                        {...inputProps}
                    >
                        <div className={cn(`flex items-center gap-2`, radioGroupBodyClassName)} >
                            {options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                                    <label
                                        htmlFor={`${name}-${option.value}`}
                                        className={cn(`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`, radioLabelClassName)}
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>

                    </RadioGroup>
                );

            case 'file':
                return (
                    <EnhancedAttachmentInput
                        field={field}
                        disabled={disabled || isLoading}
                        readonly={readonly}
                        inputClassName={inputClassName}
                        onValueChange={onValueChange}
                    />
                );

            case 'email':
                return <Input {...commonProps} type="email" />;
            default:
                return <Input {...commonProps} type={type} />;

        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("space-y-0", className)} {...formItemProps}>
                    <div className={cn("w-full space-y-1", containerClassName)}>
                        <FormLabel className={cn("text-sm text-secondary", labelClassName)} {...labelProps}>
                            {label}
                            {required && <sup className="text-status-danger text-sm -top-0">*</sup>}
                            {tooltipText && (
                                <>
                                    <Info
                                        data-tooltip-id={`reusable-form-filed-tooltip-${name}`}
                                        data-tooltip-class-name='break-all max-w-56'
                                        data-tooltip-place='right'
                                        data-tooltip-content={tooltipText}
                                        className="inline ml-1 cursor-pointer text-secondary"
                                        size={14}
                                    />
                                    <Tooltip id={`reusable-form-filed-tooltip-${name}`} />
                                </>
                            )}
                        </FormLabel>
                        {
                            type === 'select' ? renderInput(field) :
                                <FormControl className={cn("", inputClassName)} {...formControlProps}>
                                    {renderInput(field)}
                                </FormControl>

                        }

                    </div>
                    <div className={cn("w-full", containerClassName)}>
                        <div className={cn("", labelClassName)}></div>
                        <FormMessage className={cn("", inputClassName)} />
                    </div>
                </FormItem>
            )}
        />
    );
};

export default ReusableFormField;