import { cloneElement, forwardRef, isValidElement } from 'react';

const baseClasses = 'inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25';

function mergeClassNames(...values) {
    return values.filter(Boolean).join(' ');
}

const SecondaryButton = forwardRef(function SecondaryButton(
    {
        type = 'button',
        className = '',
        disabled,
        asChild = false,
        children,
        ...props
    },
    ref,
) {
    const classes = mergeClassNames(baseClasses, disabled && 'opacity-25', className);

    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            ref,
            ...props,
            className: mergeClassNames(classes, children.props?.className),
        });
    }

    return (
        <button
            {...props}
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled}
        >
            {children}
        </button>
    );
});

export default SecondaryButton;
