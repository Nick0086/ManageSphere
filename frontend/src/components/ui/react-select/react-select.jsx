import * as React from 'react';
import Select from 'react-select';
import { defaultClassNames, defaultStyles } from './helper';
import {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    Option
} from './components';

const ReactSelect = React.forwardRef((props, ref) => {
    const {
        value,
        onChange,
        options = [],
        styles = defaultStyles,
        classNames = defaultClassNames,
        components = {},
        ...rest
    } = props;

    return (
        <Select
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
                ...components
            }}
            styles={styles}
            classNames={classNames}
            {...rest}
        />
    );
});

// Add this line to set the display name
ReactSelect.displayName = 'ReactSelect';

export default ReactSelect;