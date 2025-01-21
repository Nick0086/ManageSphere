export const useFormatters = () => {

    // useful for CreatableSelect
    const formatCreateLabel = (label) => (
        <span className={'text-sm'}>
            Add
            <span className={'font-semibold'}>{` "${label}"`}</span>
        </span>
    );

    // useful for GroupedOptions
    const formatGroupLabel = (data) => (
        <div className={'flex justify-between items-center'}>
            <span>{data.label}</span>
            <span
                className={
                    'rounded-md text-xs font-normal text-secondary-foreground bg-secondary shadow-sm px-1'
                }
            >
                {data.options.length}
            </span>
        </div>
    );
    return {
        formatCreateLabel,
        formatGroupLabel
    };
};