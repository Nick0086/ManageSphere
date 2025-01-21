import * as React from "react";
import CreatableSelect from "react-select/creatable";
import { defaultClassNames, defaultStyles } from "~/lib/helper";
import {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    Option,
} from "./ReactSelectCustomComponents";

const Creatable = React.forwardRef((props, ref) => {
    const {
        value,
        onChange,
        options = [],
        styles = defaultStyles,
        classNames = defaultClassNames,
        components = {},
        ...rest
    } = props;

    const id = React.useId();

    return (
        <CreatableSelect
            instanceId={id}
            ref={ref}
            value={value}
            onChange={onChange}
            options={options}
            unstyled
            components={{
                DropdownIndicator,
                ClearIndicator,
                MultiValueRemove,
                Option,
                ...components,
            }}
            styles={styles}
            classNames={classNames}
            {...rest}
        />
    );
});
Creatable.displayName = "Creatable";
export default Creatable;