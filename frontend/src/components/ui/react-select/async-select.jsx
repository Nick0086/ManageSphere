import * as React from 'react';
import Async from 'react-select/async';
import { defaultClassNames, defaultStyles } from './helper';
import {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    Option
} from './components';

const AsyncSelect = React.forwardRef((props, ref) => {
    const {
        value,
        onChange,
        styles = defaultStyles,
        classNames = defaultClassNames,
        components = {},
        ...rest
    } = props;

    return (
        <Async
            ref={ref}
            value={value}
            onChange={onChange}
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
AsyncSelect.displayName = 'AsyncSelect';

export default AsyncSelect;